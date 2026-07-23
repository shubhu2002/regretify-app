'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
	Plus,
	StickyNote,
	Trash2,
	Pin,
	Search,
	ChevronLeft,
	Cloud,
	CloudUpload,
	List,
	ListOrdered,
	ListChecks,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Placeholder } from '@tiptap/extensions';

import ConfirmModal from '../ConfirmModal';
import { Note } from '@/types';
import { NotesSkeletonLoading } from './skeleton';

type SaveState = 'saved' | 'dirty' | 'saving';

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Notes created before the rich editor were stored as plain text —
// wrap them in paragraphs so the editor keeps their line breaks
const toEditorHtml = (content: string | null) => {
	if (!content) return '';
	if (/^\s*</.test(content)) return content;
	return content
		.split('\n')
		.map((line) => `<p>${escapeHtml(line)}</p>`)
		.join('');
};

// Plain-text version of note content for the sidebar preview & search
const stripHtml = (html: string) => {
	if (!/^\s*</.test(html)) return html;
	return html
		.replace(/<li[^>]*data-checked="true"[^>]*>/gi, '\n☑ ')
		.replace(/<li[^>]*data-checked="false"[^>]*>/gi, '\n☐ ')
		.replace(/<li[^>]*>/gi, '\n• ')
		.replace(/<\/(p|li|h[1-6]|blockquote|div)>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.replace(/\n{2,}/g, '\n')
		.trim();
};

export default function Notes() {
	const queryClient = useQueryClient();

	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [creating, setCreating] = useState(false);

	// Editor draft state (content is editor HTML)
	const [draftTitle, setDraftTitle] = useState('');
	const [draftContent, setDraftContent] = useState('');
	const [saveState, setSaveState] = useState<SaveState>('saved');
	const titleInputRef = useRef<HTMLInputElement | null>(null);

	// Refs so debounced saves always see the latest draft
	const draftRef = useRef<{
		id: number | null;
		title: string;
		content: string;
		dirty: boolean;
	}>({ id: null, title: '', content: '', dirty: false });
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const contentHandlerRef = useRef<(html: string) => void>(() => {});

	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		id: number | null;
	}>({ isOpen: false, id: null });

	const { data, isLoading } = useQuery({
		queryKey: ['notes'],
		queryFn: async () => {
			const res = await fetch('/api/notes');
			if (!res.ok) throw new Error('Failed to fetch');
			return res.json() as Promise<{ notes: Note[] }>;
		},
	});

	// Stable order: newest-created first. Sorting by created_at (not the
	// server's updated_at order) keeps a note from jumping to the top of the
	// list on every autosave while it's being edited.
	const allNotes = useMemo(
		() =>
			[...(data?.notes || [])].sort(
				(a, b) =>
					new Date(b.created_at).getTime() -
					new Date(a.created_at).getTime(),
			),
		[data],
	);


	const pinnedNotes = allNotes.filter((n) => n.pinned);
	const otherNotes = allNotes.filter((n) => !n.pinned);

	const selectedNote = allNotes.find((n) => n.id === selectedId) || null;

	// ---------- Rich text editor ----------
	const editor = useEditor({
		extensions: [
			StarterKit,
			TaskList,
			TaskItem.configure({ nested: true }),
			Placeholder.configure({ placeholder: 'Start writing...' }),
		],
		immediatelyRender: false,
		shouldRerenderOnTransaction: true,
		editorProps: {
			attributes: {
				class: 'note-editor flex-1 px-4 sm:px-6 pt-1.5 pb-10 text-[15px] sm:text-base leading-relaxed text-white/80',
			},
		},
		onUpdate: ({ editor }) => {
			contentHandlerRef.current(editor.isEmpty ? '' : editor.getHTML());
		},
	});

	// When the editor instance appears after a note was already selected
	useEffect(() => {
		if (editor && draftRef.current.id != null) {
			editor.commands.setContent(draftRef.current.content || '');
		}
	}, [editor]);

	// ---------- Auto-save ----------
	const flushSave = useCallback(async () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		const d = draftRef.current;
		if (!d.dirty || d.id == null) return;
		d.dirty = false;
		setSaveState('saving');
		try {
			const res = await fetch('/api/notes', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: d.id,
					title: d.title.trim() || 'New Note',
					content: d.content.trim() ? d.content : null,
				}),
			});
			if (!res.ok) throw new Error('Failed to save');
			queryClient.invalidateQueries({ queryKey: ['notes'] });
			if (!draftRef.current.dirty) setSaveState('saved');
		} catch {
			draftRef.current.dirty = true;
			setSaveState('dirty');
			toast.error('Failed to save note');
		}
	}, [queryClient]);

	const scheduleSave = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(flushSave, 800);
	}, [flushSave]);

	// Flush pending edits when leaving the page
	useEffect(() => {
		return () => {
			flushSave();
		};
	}, [flushSave]);

	const onTitleChange = (value: string) => {
		setDraftTitle(value);
		draftRef.current = { ...draftRef.current, title: value, dirty: true };
		setSaveState('dirty');
		scheduleSave();
	};

	const onContentChange = useCallback(
		(html: string) => {
			setDraftContent(html);
			draftRef.current = { ...draftRef.current, content: html, dirty: true };
			setSaveState('dirty');
			scheduleSave();
		},
		[scheduleSave],
	);

	useEffect(() => {
		contentHandlerRef.current = onContentChange;
	}, [onContentChange]);

	// ---------- Actions ----------
	const loadIntoEditor = (note: Note) => {
		const html = toEditorHtml(note.content);
		setSelectedId(note.id);
		setDraftTitle(note.title);
		setDraftContent(html);
		draftRef.current = {
			id: note.id,
			title: note.title,
			content: html,
			dirty: false,
		};
		setSaveState('saved');
		editor?.commands.setContent(html || '');
	};

	const selectNote = (note: Note) => {
		if (note.id === selectedId) return;
		flushSave();
		loadIntoEditor(note);
	};

	const createNote = async () => {
		flushSave();
		setCreating(true);
		const toastId = toast.loading('Creating note...');
		try {
			const res = await fetch('/api/notes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'New Note', content: null }),
			});
			if (!res.ok) throw new Error('Failed to create note');
			const { note } = (await res.json()) as { note: Note };
			toast.success('Note created!', { id: toastId });
			queryClient.invalidateQueries({ queryKey: ['notes'] });
			loadIntoEditor(note);
			setDraftTitle('');
			draftRef.current.title = '';
			setTimeout(() => titleInputRef.current?.focus(), 50);
		} catch {
			toast.error('Something went wrong', { id: toastId });
		} finally {
			setCreating(false);
		}
	};

	const togglePin = async (note: Note, e?: React.MouseEvent) => {
		e?.stopPropagation();
		const loadingId = toast.loading('Please Wait !', { duration: 1500 });
		try {
			const res = await fetch('/api/notes', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: note.id, pinned: !note.pinned }),
			});
			if (!res.ok) {
				const data = await res.json();
				toast.error(data.message || 'Failed to pin note');
				return;
			}
			queryClient.invalidateQueries({ queryKey: ['notes'] });
		} catch {
			toast.error('Something went wrong');
		} finally {
			toast.dismiss(loadingId);
		}
	};

	const handleDelete = async () => {
		if (!confirmModal.id) return;
		const toastId = toast.loading('Deleting...');
		try {
			const res = await fetch(`/api/notes?id=${confirmModal.id}`, {
				method: 'DELETE',
			});
			if (!res.ok) throw new Error('Failed to delete');
			toast.success('Deleted!', { id: toastId });
			if (confirmModal.id === selectedId) {
				setSelectedId(null);
				draftRef.current = { id: null, title: '', content: '', dirty: false };
			}
			queryClient.invalidateQueries({ queryKey: ['notes'] });
		} catch {
			toast.error('Something went wrong', { id: toastId });
		} finally {
			setConfirmModal({ isOpen: false, id: null });
		}
	};

	// ---------- Loading Skeleton ----------
	if (isLoading && !data) {
		return <NotesSkeletonLoading />;
	}

	// Sidebar list item — shows live draft values for the note being edited
	const NoteListItem = ({ note }: { note: Note }) => {
		const isSelected = note.id === selectedId;
		const title = isSelected ? draftTitle.trim() || 'New Note' : note.title;
		const preview = stripHtml(isSelected ? draftContent : note.content || '');

		return (
			<motion.button
				whileTap={{ scale: 0.98 }}
				onClick={() => selectNote(note)}
				className={`relative w-full text-left px-4 py-3 transition-colors cursor-pointer group ${
					isSelected ? 'bg-white/6' : 'hover:bg-white/3'
				}`}
			>
				{isSelected && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.15 }}
						className='absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#9294e5]'
					/>
				)}
				<div className='flex items-center justify-between gap-2'>
					<h3 className='text-white font-semibold text-sm truncate'>
						{title}
					</h3>
					{note.pinned && (
						<Pin
							size={12}
							className='shrink-0 fill-amber-400 text-amber-400'
						/>
					)}
				</div>
				<p className='text-xs text-white/40 line-clamp-2 mt-0.5 whitespace-pre-line'>
					{preview || 'No additional text'}
				</p>
				<p className='text-xs text-white/35 mt-1.5'>
					{new Date(note.updated_at).toLocaleDateString('en-IN', {
						day: 'numeric',
						month: 'short',
						year: 'numeric',
					})}
				</p>
			</motion.button>
		);
	};

	const sectionLabelCls =
		'px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1';

	const formatButtons = [
		{
			icon: List,
			title: 'Bulleted list',
			isActive: editor?.isActive('bulletList') ?? false,
			action: () => editor?.chain().focus().toggleBulletList().run(),
		},
		{
			icon: ListOrdered,
			title: 'Numbered list',
			isActive: editor?.isActive('orderedList') ?? false,
			action: () => editor?.chain().focus().toggleOrderedList().run(),
		},
		{
			icon: ListChecks,
			title: 'Checklist',
			isActive: editor?.isActive('taskList') ?? false,
			action: () => editor?.chain().focus().toggleTaskList().run(),
		},
	];

	return (
		<>
			<div className='relative flex-1 w-full min-h-[calc(100dvh-24px)] sm:min-h-[calc(100dvh-64px)] overflow-hidden'>
				<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pb-8'>
					<motion.header
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						className='flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6'
					>
						<div>
							<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient'>
								Thoughts, lists &amp; reminders
							</span>
							<h1 className='text-3xl sm:text-4xl font-semibold tracking-tight text-gradient mt-2'>
								Notes
							</h1>
							<p className='text-white/50 mt-1.5'>
								Capture thoughts, ideas &amp; reminders
							</p>
						</div>
						<div className='flex items-center gap-3'>
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								onClick={createNote}
								disabled={creating}
								className='w-fit bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group/new'
							>
								<Plus
									size={18}
									className='transition-transform duration-300 group-hover/new:rotate-90'
								/>
								<span>New Note</span>
							</motion.button>
						</div>
					</motion.header>

					{/* Apple Notes style split panel */}
					<div className='card-aurora rounded-3xl overflow-hidden flex h-[calc(100dvh-210px)] md:h-[calc(100dvh-250px)] min-h-105'>
						{/* Sidebar — note list */}
						<div
							className={`${
								selectedId !== null ? 'hidden md:flex' : 'flex'
							} w-full md:w-72 lg:w-80 shrink-0 md:border-r border-white/10 flex-col`}
						>
							<div className='flex-1 overflow-y-auto pt-2 px-2 pb-2 space-y-2'>
								{allNotes.length === 0 ?
									<div className='text-center pt-12 px-4'>
										{allNotes.length === 0 ?
											<>
												<motion.div
													animate={{ y: [0, -6, 0] }}
													transition={{
														duration: 3,
														repeat: Infinity,
														ease: 'easeInOut',
													}}
													className='w-12 h-12 mx-auto mb-4 rounded-xl bg-[#f0f8e8]/10 text-[#f0f8e8] flex items-center justify-center'
												>
													<StickyNote size={22} />
												</motion.div>
												<p className='text-white/60 font-semibold'>
													No notes yet
												</p>
												<p className='text-white/35 text-sm mt-1'>
													Create a note to save your thoughts
												</p>
											</>
										:	<>
												<Search
													className='mx-auto text-white/20 mb-3'
													size={36}
												/>
												<p className='text-white/50 font-medium'>
													No matching notes
												</p>
												<p className='text-white/40 text-sm mt-1'>
													Try a different search term
												</p>
											</>
										}
									</div>
								:	<>
										{pinnedNotes.length > 0 && (
											<>
												<p className={sectionLabelCls}>
													<Pin size={11} />
													Pinned
												</p>
												<div className='bg-[#1a191e] border border-white/6 rounded-2xl overflow-hidden divide-y divide-white/5'>
													{pinnedNotes.map((note) => (
														<NoteListItem key={note.id} note={note} />
													))}
												</div>
											</>
										)}
										{otherNotes.length > 0 && (
											<>
												{pinnedNotes.length > 0 && (
													<p className={sectionLabelCls}>Notes</p>
												)}
												<div className='bg-[#1a191e] border border-white/6 rounded-2xl overflow-hidden divide-y divide-white/5'>
													{otherNotes.map((note) => (
														<NoteListItem key={note.id} note={note} />
													))}
												</div>
											</>
										)}
									</>
								}
							</div>
						</div>

						{/* Editor pane */}
						<div
							className={`${
								selectedId !== null ? 'flex' : 'hidden md:flex'
							} flex-1 min-w-0 flex-col bg-white/2`}
						>
							{selectedNote && (
								<>
									{/* Toolbar */}
									<div className='flex items-center justify-between gap-2 px-3 sm:px-4 pt-3'>
										<button
											onClick={() => {
												flushSave();
												setSelectedId(null);
											}}
											className='md:hidden p-2 text-white/50 hover:text-white hover:bg-white/8 bg-white/6 border border-white/10 rounded-xl transition-colors cursor-pointer'
										>
											<ChevronLeft size={16} />
										</button>

										<div className='hidden sm:flex items-center gap-1.5 text-[11px] text-white/40 min-w-0'>
											{saveState === 'saved' ?
												<Cloud size={12} className='shrink-0' />
											:	<CloudUpload
													size={12}
													className='shrink-0 animate-pulse text-[#b9baf1]'
												/>
											}
											<span className='truncate'>
												{saveState === 'saved' ?
													`Edited ${new Date(
														selectedNote.updated_at,
													).toLocaleDateString('en-IN', {
														day: 'numeric',
														month: 'short',
														year: 'numeric',
													})}`
												:	'Saving...'}
											</span>
										</div>

										<div className='flex items-center gap-1'>
											{formatButtons.map((btn) => (
												<button
													key={btn.title}
													onClick={btn.action}
													title={btn.title}
													className={`p-2 rounded-lg transition-colors cursor-pointer ${
														btn.isActive
															? 'bg-white/10 text-white'
															: 'text-white/50 hover:text-white hover:bg-white/8'
													}`}
												>
													<btn.icon size={15} />
												</button>
											))}

											<div className='w-px h-5 bg-white/10 mx-1' />

											<button
												onClick={() => togglePin(selectedNote)}
												title={selectedNote.pinned ? 'Unpin note' : 'Pin note'}
												className={`p-2 rounded-lg transition-colors cursor-pointer ${
													selectedNote.pinned
														? 'bg-white/10 text-white'
														: 'text-white/50 hover:text-white hover:bg-white/8'
												}`}
											>
												<Pin
													size={15}
													className={
														selectedNote.pinned ? 'fill-amber-400 text-amber-400' : ''
													}
												/>
											</button>
											<button
												onClick={() =>
													setConfirmModal({
														isOpen: true,
														id: selectedNote.id,
													})
												}
												title='Delete note'
												className='p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer'
											>
												<Trash2 size={15} />
											</button>
										</div>
									</div>

									{/* Inline editor — Apple Notes style, saves as you type */}
									<input
										ref={titleInputRef}
										type='text'
										value={draftTitle}
										onChange={(e) => onTitleChange(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												editor?.commands.focus('start');
											}
										}}
										className='w-full bg-transparent outline-none px-4 sm:px-6 pt-4 pb-1 text-xl sm:text-2xl font-semibold tracking-tight text-white placeholder:text-white/30'
										placeholder='Title'
									/>
								</>
							)}

							<div
								className={`flex-1 overflow-y-auto flex-col ${
									selectedNote ? 'flex' : 'hidden'
								}`}
							>
								<EditorContent
									editor={editor}
									className='flex-1 flex flex-col cursor-text'
								/>
							</div>

							{!selectedNote && (
								<div className='flex-1 flex flex-col items-center justify-center text-center p-8'>
									<motion.div
										animate={{ y: [0, -8, 0] }}
										transition={{
											duration: 3,
											repeat: Infinity,
											ease: 'easeInOut',
										}}
										className='w-16 h-16 mb-5 rounded-2xl bg-[#9294e5]/15 text-[#b9baf1] flex items-center justify-center'
									>
										<StickyNote size={28} />
									</motion.div>
									<p className='text-white text-xl font-semibold tracking-tight'>
										{allNotes.length === 0 ?
											'No notes yet'
										:	'Select a note'}
									</p>
									<p className='text-white/40 text-sm mt-1.5 max-w-xs'>
										{allNotes.length === 0 ?
											'Create a note to save your thoughts, ideas and checklists.'
										:	'Choose a note from the list or create a new one.'}
									</p>
									<motion.button
										whileHover={{ scale: 1.03 }}
										whileTap={{ scale: 0.97 }}
										onClick={createNote}
										disabled={creating}
										className='mt-7 bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50'
									>
										<Plus size={16} />
										{allNotes.length === 0 ?
											'Create your first note'
										:	'New note'}
									</motion.button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<ConfirmModal
				isOpen={confirmModal.isOpen}
				onClose={() => setConfirmModal({ isOpen: false, id: null })}
				onConfirm={handleDelete}
				title='Delete Note'
				message='This will permanently delete this note. This cannot be undone.'
				confirmLabel='Delete'
				isDanger
			/>
		</>
	);
}
