'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, StickyNote, Pencil, Trash2, Pin, Search } from 'lucide-react';

import AddNoteModal from './AddNoteModal';
import ConfirmModal from '../ConfirmModal';
import { Note } from '@/types';
import { NotesSkeletonLoading } from './skeleton';

export default function Notes() {
	const queryClient = useQueryClient();

	const [search, setSearch] = useState('');

	// Modal states
	const [noteModalOpen, setNoteModalOpen] = useState(false);
	const [editNote, setEditNote] = useState<Note | null>(null);
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
		refetchInterval: 5000,
	});

	const notes = useMemo(() => {
		const all = data?.notes || [];
		if (!search.trim()) return all;
		const q = search.trim().toLowerCase();
		return all.filter(
			(n) =>
				n.title.toLowerCase().includes(q) ||
				(n.content || '').toLowerCase().includes(q),
		);
	}, [data, search]);

	const togglePin = async (note: Note, e: React.MouseEvent) => {
		e.stopPropagation();
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
			queryClient.invalidateQueries({ queryKey: ['notes'] });
		} catch {
			toast.error('Something went wrong', { id: toastId });
		} finally {
			setConfirmModal({ isOpen: false, id: null });
		}
	};

	const openAddNote = () => {
		setEditNote(null);
		setNoteModalOpen(true);
	};

	const openEditNote = (note: Note) => {
		setEditNote(note);
		setNoteModalOpen(true);
	};

	// ---------- Loading Skeleton ----------
	if (isLoading && !data) {
		return <NotesSkeletonLoading />;
	}

	const hasNotes = (data?.notes || []).length > 0;

	return (
		<>
			<div className='relative flex-1 w-full min-h-[calc(100dvh-24px)] sm:min-h-[calc(100dvh-64px)] overflow-hidden'>
				<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<header className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
						<div>
							<h1 className='text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'>
								Notes
							</h1>
							<p className='text-slate-500 dark:text-slate-400 mt-1'>
								Capture thoughts, ideas & reminders
							</p>
						</div>
						<button
							onClick={openAddNote}
							className='w-fit bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer'
						>
							<Plus size={18} />
							<span>New Note</span>
						</button>
					</header>

					{/* Search — only when there are notes to search */}
					{hasNotes && (
						<div className='relative max-w-md mb-6'>
							<Search
								size={16}
								className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
							/>
							<input
								type='text'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className='w-full pl-10 pr-4 py-2.5 text-base md:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-slate-50 dark:focus:bg-slate-800 shadow-sm transition-shadow outline-none text-slate-900 dark:text-white'
								placeholder='Search notes...'
							/>
						</div>
					)}

					{!hasNotes ?
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-12 shadow-sm text-center'
						>
							<StickyNote
								className='mx-auto text-slate-300 dark:text-slate-600 mb-4'
								size={48}
							/>
							<p className='text-slate-500 dark:text-slate-400 text-lg font-medium'>
								No notes yet
							</p>
							<p className='text-slate-400 dark:text-slate-500 text-sm mt-1'>
								Create a note to save your thoughts
							</p>
						</motion.div>
					: notes.length === 0 ?
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-12 shadow-sm text-center'
						>
							<Search
								className='mx-auto text-slate-300 dark:text-slate-600 mb-4'
								size={48}
							/>
							<p className='text-slate-500 dark:text-slate-400 text-lg font-medium'>
								No matching notes
							</p>
							<p className='text-slate-400 dark:text-slate-500 text-sm mt-1'>
								Try a different search term
							</p>
						</motion.div>
					:	<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
							{notes.map((note) => (
								<motion.div
									key={note.id}
									whileTap={{ scale: 0.98 }}
									onClick={() => openEditNote(note)}
									className='p-5 rounded-3xl border cursor-pointer transition-all group relative overflow-hidden bg-white/70 dark:bg-slate-900/50 border-violet-100 dark:border-violet-800/30 hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-md flex flex-col'
								>
									<div className='absolute -inset-2 bg-linear-to-r from-transparent via-white/40 to-transparent dark:via-white/5 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none' />
									<div className='relative z-10 flex flex-col flex-1'>
										<div className='flex items-start justify-between mb-2'>
											<div className='flex items-center gap-2 min-w-0'>
												<StickyNote
													size={18}
													className='text-violet-500 shrink-0'
												/>
												<h3 className='font-bold text-slate-900 dark:text-white text-lg truncate'>
													{note.title}
												</h3>
											</div>
											<div className='flex items-center gap-1 shrink-0'>
												<button
													onClick={(e) => togglePin(note, e)}
													className={`p-1.5 rounded-lg transition-colors ${
														note.pinned
															? 'text-violet-500'
															: 'text-slate-300 hover:text-violet-500 opacity-0 group-hover:opacity-100'
													}`}
												>
													<Pin
														size={14}
														className={note.pinned ? 'fill-violet-500' : ''}
													/>
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														openEditNote(note);
													}}
													className='p-1.5 text-slate-300 hover:text-violet-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100'
												>
													<Pencil size={14} />
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														setConfirmModal({
															isOpen: true,
															id: note.id,
														});
													}}
													className='p-1.5 text-slate-300 hover:text-rose-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100'
												>
													<Trash2 size={14} />
												</button>
											</div>
										</div>
										{note.content && (
											<p className='text-sm text-slate-400 dark:text-slate-500 mb-3 line-clamp-4 whitespace-pre-line'>
												{note.content}
											</p>
										)}
										<div className='flex items-center justify-between mt-auto pt-3'>
											<span className='text-xs text-slate-400 dark:text-slate-500'>
												{new Date(note.updated_at).toLocaleDateString(
													'en-IN',
													{
														day: 'numeric',
														month: 'short',
														year: 'numeric',
													},
												)}
											</span>
											{note.pinned && (
												<span className='text-[10px] font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/30 px-2 py-0.5 rounded-full'>
													Pinned
												</span>
											)}
										</div>
									</div>
								</motion.div>
							))}
						</div>
					}
				</div>
			</div>

			<AddNoteModal
				isOpen={noteModalOpen}
				onClose={() => {
					setNoteModalOpen(false);
					setEditNote(null);
				}}
				editNote={editNote}
			/>

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
