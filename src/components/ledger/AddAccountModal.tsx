'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, UserPlus, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import { LedgerAccount } from '@/types';

interface AddAccountModalProps {
	isOpen: boolean;
	onClose: () => void;
	editAccount?: LedgerAccount | null;
	ledgerBookId: number;
}

export default function AddAccountModal({ isOpen, onClose, editAccount, ledgerBookId }: AddAccountModalProps) {
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState('');
	const [contactNumber, setContactNumber] = useState('');

	const isEdit = !!editAccount;

	const resetForm = () => {
		setName('');
		setContactNumber('');
	};

	useEffect(() => {
		if (isOpen) {
			if (editAccount) {
				setName(editAccount.name);
				setContactNumber(editAccount.contact_number || '');
			} else {
				resetForm();
			}
		}
	}, [isOpen, editAccount]);

	const isDisabled = useMemo(() => {
		// Required field missing
		if (!name.trim()) return true;
		// In edit mode, disabled if nothing changed
		if (isEdit && editAccount) {
			const nameUnchanged = name.trim() === editAccount.name;
			const contactUnchanged = (contactNumber.trim() || '') === (editAccount.contact_number || '');
			if (nameUnchanged && contactUnchanged) return true;
		}
		return false;
	}, [name, contactNumber, isEdit, editAccount]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isDisabled) return;

		setLoading(true);
		const toastId = toast.loading(isEdit ? 'Updating account...' : 'Adding account...');

		try {
			if (isEdit) {
				const res = await fetch('/api/ledger', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'update_account',
						id: editAccount!.id,
						name: name.trim(),
						contact_number: contactNumber.trim() || null,
					}),
				});
				if (!res.ok) throw new Error('Failed to update account');
				toast.success('Account updated!', { id: toastId });
			} else {
				const res = await fetch('/api/ledger', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'create_account',
						name: name.trim(),
						contact_number: contactNumber.trim() || null,
						ledger_book_id: ledgerBookId,
					}),
				});
				if (!res.ok) throw new Error('Failed to create account');
				toast.success('Account added!', { id: toastId });
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
		'w-full px-4 py-3 text-base md:text-sm bg-white/6 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-white/30 focus:ring-2 focus:ring-white/10 focus:outline-none transition-shadow outline-none';
	const labelCls =
		'block text-sm font-semibold text-white/80 mb-1.5';

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center h-full p-4'
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.95, opacity: 0, y: 20 }}
						onClick={(e) => e.stopPropagation()}
						className='bg-[#1a191e]/95 backdrop-blur-2xl w-full max-w-md border border-white/10 overflow-hidden rounded-3xl shadow-2xl shadow-black/60'
					>
						<div className='p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-white/4'>
							<h2 className='text-xl font-semibold text-white flex items-center gap-2'>
								{isEdit ? (
									<Pencil size={20} className='text-white/80' />
								) : (
									<UserPlus size={20} className='text-white/80' />
								)}
								{isEdit ? 'Edit Account' : 'Add Account'}
							</h2>
							<button
								onClick={onClose}
								className='cursor-pointer p-2 text-white/50 hover:text-white border border-white/10 bg-white/8 hover:bg-white/[0.14] rounded-full transition-colors hover:-translate-y-0.5 active:translate-y-0'
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
									placeholder='e.g. John Doe'
								/>
							</div>

							<div>
								<label className={labelCls}>Contact Number (optional)</label>
								<input
									type='tel'
									value={contactNumber}
									onChange={(e) => setContactNumber(e.target.value)}
									className={inputCls}
									placeholder='e.g. +91 9876543210'
								/>
							</div>

							<div className='pt-2'>
								<motion.button
									whileTap={!isDisabled && !loading ? { scale: 0.98 } : undefined}
									type='submit'
									disabled={loading || isDisabled}
									className={`w-full py-3 bg-[#9294e5] hover:bg-[#a3a5ec] text-black rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_2px_24px_rgba(146,148,229,0.35)] transition-colors ${
										loading || isDisabled
											? 'opacity-50 cursor-not-allowed'
											: 'cursor-pointer'
									}`}
								>
									{loading ? (
										<div className='h-5 w-5 border-2 border-black/30 border-t-transparent rounded-full animate-spin' />
									) : (
										<>
											<CheckCircle2 size={20} strokeWidth={2} />
											{isEdit ? 'Update Account' : 'Add Account'}
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
