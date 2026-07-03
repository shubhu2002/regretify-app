'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, StickyNote, Pencil, Pin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types';

interface AddNoteModalProps {
	isOpen: boolean;
	onClose: () => void;
	editNote?: Note | null;
}

export default function AddNoteModal({ isOpen, onClose, editNote }: AddNoteModalProps) {
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [pinned, setPinned] = useState(false);

	const isEdit = !!editNote;

	const resetForm = () => {
		setTitle('');
		setContent('');
		setPinned(false);
	};

	useEffect(() => {
		if (isOpen) {
			if (editNote) {
				setTitle(editNote.title);
				setContent(editNote.content || '');
				setPinned(editNote.pinned);
			} else {
				resetForm();
			}
		}
	}, [isOpen, editNote]);

	const isDisabled = useMemo(() => {
		if (!title.trim()) return true;
		if (isEdit && editNote) {
			const titleUnchanged = title.trim() === editNote.title;
			const contentUnchanged = (content.trim() || '') === (editNote.content || '');
			const pinUnchanged = pinned === editNote.pinned;
			if (titleUnchanged && contentUnchanged && pinUnchanged) return true;
		}
		return false;
	}, [title, content, pinned, isEdit, editNote]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isDisabled) return;

		setLoading(true);
		const toastId = toast.loading(isEdit ? 'Updating note...' : 'Saving note...');

		try {
			if (isEdit) {
				const res = await fetch('/api/notes', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: editNote!.id,
						title: title.trim(),
						content: content.trim() || null,
						pinned,
					}),
				});
				if (!res.ok) throw new Error('Failed to update note');
				toast.success('Note updated!', { id: toastId });
			} else {
				const res = await fetch('/api/notes', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title: title.trim(),
						content: content.trim() || null,
						pinned,
					}),
				});
				if (!res.ok) throw new Error('Failed to save note');
				toast.success('Note saved!', { id: toastId });
			}

			queryClient.invalidateQueries({ queryKey: ['notes'] });
			resetForm();
			onClose();
		} catch {
			toast.error('Something went wrong', { id: toastId });
		} finally {
			setLoading(false);
		}
	};

	const inputCls =
		'w-full px-4 py-3 text-base md:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-slate-50 dark:focus:bg-slate-800 shadow-sm transition-shadow outline-none text-slate-900 dark:text-white';
	const labelCls =
		'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex items-center justify-center h-full p-4'
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.95, opacity: 0, y: 20 }}
						onClick={(e) => e.stopPropagation()}
						className='bg-fuchsia-50/90 backdrop-blur-2xl dark:bg-fuchsia-950/30 w-full max-w-md border border-fuchsia-100 dark:border-fuchsia-800/30 overflow-hidden rounded-3xl shadow-2xl'
					>
						<div className='p-4 sm:p-6 border-b border-fuchsia-100 dark:border-fuchsia-800/30 flex justify-between items-center bg-violet-50/50 dark:bg-violet-900/20'>
							<h2 className='text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
								{isEdit ? (
									<Pencil size={20} className='text-violet-500' />
								) : (
									<StickyNote size={20} className='text-violet-500' />
								)}
								{isEdit ? 'Edit Note' : 'New Note'}
							</h2>
							<button
								onClick={onClose}
								className='cursor-pointer p-2 text-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm rounded-full transition-colors hover:-translate-y-0.5 active:translate-y-0'
							>
								<X size={18} strokeWidth={2} />
							</button>
						</div>

						<form onSubmit={handleSubmit} className='p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto'>
							<div>
								<label className={labelCls}>Title</label>
								<input
									type='text'
									required
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className={inputCls}
									placeholder='e.g. Things I should stop buying'
								/>
							</div>

							<div>
								<label className={labelCls}>Note</label>
								<textarea
									value={content}
									onChange={(e) => setContent(e.target.value)}
									className={`${inputCls} resize-none`}
									rows={6}
									placeholder='Write your note here...'
								/>
							</div>

							<button
								type='button'
								onClick={() => setPinned(!pinned)}
								className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border shadow-sm transition-all cursor-pointer ${
									pinned
										? 'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/50 text-violet-700 dark:text-violet-300'
										: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
								}`}
							>
								<Pin
									size={15}
									strokeWidth={2}
									className={pinned ? 'fill-violet-500 text-violet-500' : ''}
								/>
								{pinned ? 'Pinned to top' : 'Pin to top'}
							</button>

							<div className='pt-2'>
								<motion.button
									whileTap={!isDisabled && !loading ? { scale: 0.98 } : undefined}
									type='submit'
									disabled={loading || isDisabled}
									className={`w-full py-3 text-white rounded-xl font-medium text-lg flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md bg-violet-600 dark:bg-violet-500 hover:bg-violet-700 ${
										loading || isDisabled
											? 'opacity-50 cursor-not-allowed'
											: 'cursor-pointer'
									}`}
								>
									{loading ? (
										<div className='h-5 w-5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin' />
									) : (
										<>
											<CheckCircle2 size={20} strokeWidth={2} />
											{isEdit ? 'Update Note' : 'Save Note'}
										</>
									)}
								</motion.button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
