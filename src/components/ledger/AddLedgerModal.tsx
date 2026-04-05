'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, BookOpen, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { LedgerBook } from '@/types';

interface AddLedgerModalProps {
	isOpen: boolean;
	onClose: () => void;
	editLedger?: LedgerBook | null;
}

export default function AddLedgerModal({ isOpen, onClose, editLedger }: AddLedgerModalProps) {
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	const isEdit = !!editLedger;

	const resetForm = () => {
		setName('');
		setDescription('');
	};

	useEffect(() => {
		if (isOpen) {
			if (editLedger) {
				setName(editLedger.name);
				setDescription(editLedger.description || '');
			} else {
				resetForm();
			}
		}
	}, [isOpen, editLedger]);

	const isDisabled = useMemo(() => {
		if (!name.trim()) return true;
		if (isEdit && editLedger) {
			const nameUnchanged = name.trim() === editLedger.name;
			const descUnchanged = (description.trim() || '') === (editLedger.description || '');
			if (nameUnchanged && descUnchanged) return true;
		}
		return false;
	}, [name, description, isEdit, editLedger]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isDisabled) return;

		setLoading(true);
		const toastId = toast.loading(isEdit ? 'Updating ledger...' : 'Creating ledger...');

		try {
			if (isEdit) {
				const res = await fetch('/api/ledger', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'update_book',
						id: editLedger!.id,
						name: name.trim(),
						description: description.trim() || null,
					}),
				});
				if (!res.ok) throw new Error('Failed to update ledger');
				toast.success('Ledger updated!', { id: toastId });
			} else {
				const res = await fetch('/api/ledger', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'create_book',
						name: name.trim(),
						description: description.trim() || null,
					}),
				});
				if (!res.ok) throw new Error('Failed to create ledger');
				toast.success('Ledger created!', { id: toastId });
			}

			queryClient.invalidateQueries({ queryKey: ['ledger'] });
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
									<BookOpen size={20} className='text-violet-500' />
								)}
								{isEdit ? 'Edit Ledger' : 'New Ledger'}
							</h2>
							<button
								onClick={onClose}
								className='cursor-pointer p-2 text-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm rounded-full transition-colors hover:-translate-y-0.5 active:translate-y-0'
							>
								<X size={18} strokeWidth={2} />
							</button>
						</div>

						<form onSubmit={handleSubmit} className='p-4 sm:p-6 space-y-5'>
							<div>
								<label className={labelCls}>Name</label>
								<input
									type='text'
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									className={inputCls}
									placeholder='e.g. Business, Personal, Family'
								/>
							</div>

							<div>
								<label className={labelCls}>Description (optional)</label>
								<input
									type='text'
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className={inputCls}
									placeholder='e.g. Track all business transactions'
								/>
							</div>

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
											{isEdit ? 'Update Ledger' : 'Create Ledger'}
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
