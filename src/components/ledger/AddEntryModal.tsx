'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { LedgerAccount, LedgerEntry } from '@/types';
import { getLocalDateString, getLocalTimeString } from '@/utils';

interface AddEntryModalProps {
	isOpen: boolean;
	onClose: () => void;
	account: LedgerAccount;
	editEntry?: LedgerEntry | null;
}

export default function AddEntryModal({
	isOpen,
	onClose,
	account,
	editEntry,
}: AddEntryModalProps) {
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState('');
	const [description, setDescription] = useState('');
	const [type, setType] = useState<'give' | 'take'>('give');

	const isEdit = !!editEntry;

	const [date, setDate] = useState(getLocalDateString());
	const [time, setTime] = useState(getLocalTimeString());

	const resetForm = () => {
		setAmount('');
		setDescription('');
		setType('give');
		setDate(getLocalDateString());
		setTime(getLocalTimeString());
	};

	useEffect(() => {
		if (isOpen) {
			if (editEntry) {
				const entryDate = new Date(editEntry.date);
				setAmount(editEntry.amount.toString());
				setDescription(editEntry.description || '');
				setType(editEntry.type);
				setDate(getLocalDateString(entryDate));
				setTime(getLocalTimeString(entryDate));
			} else {
				resetForm();
			}
		}
	}, [isOpen, editEntry]);

	const calculatedAmount = useMemo(() => {
		try {
			if (!amount) return null;
			if (!Number.isNaN(Number(amount))) return null;

			const sanitized = amount.replace(/[^\d.+\-*/()]/g, '');
			if (!sanitized) return null;
			if (/[.+\-*/(]$/.test(sanitized)) return null;

			const res = new Function(`return ${sanitized}`)();
			if (isFinite(res) && res > 0) {
				return Number(res.toFixed(2));
			}
			return null;
		} catch {
			return null;
		}
	}, [amount]);

	// Check if required fields are missing
	const isMissingFields = useMemo(() => {
		if (!amount || !date || !time) return true;
		return false;
	}, [amount, date, time]);

	// Check if nothing changed (edit mode only)
	const isUnchanged = useMemo(() => {
		if (!isEdit || !editEntry) return false;
		const entryDate = new Date(editEntry.date);
		const amountSame = amount === editEntry.amount.toString();
		const descSame = (description || '') === (editEntry.description || '');
		const typeSame = type === editEntry.type;
		const dateSame = date === getLocalDateString(entryDate);
		const timeSame = time === getLocalTimeString(entryDate);
		return amountSame && descSame && typeSame && dateSame && timeSame;
	}, [amount, description, type, date, time, isEdit, editEntry]);

	const isDisabled = isMissingFields || isUnchanged;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isDisabled) return;

		let finalAmount = parseFloat(amount);
		if (Number.isNaN(finalAmount)) {
			try {
				const sanitized = amount.replace(/[^\d.+\-*/()]/g, '');
				finalAmount = new Function(`return ${sanitized}`)();
			} catch {
				finalAmount = 0;
			}
		}

		if (!finalAmount || finalAmount <= 0) return;

		setLoading(true);
		const toastId = toast.loading(
			isEdit ? 'Updating entry...' : 'Saving entry...',
		);

		const [year, month, day] = date.split('-').map(Number);
		const [hours, minutes] = time.split(':').map(Number);
		const finalDateObj = new Date(year, month - 1, day, hours, minutes, 0);
		const finalDateStr = finalDateObj.toISOString();

		try {
			if (isEdit) {
				const res = await fetch('/api/ledger', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'update_entry',
						id: editEntry!.id,
						amount: finalAmount,
						description: description.trim() || null,
						date: finalDateStr,
						type,
					}),
				});
				if (!res.ok) throw new Error('Failed to update entry');
				toast.success('Entry updated!', { id: toastId });
			} else {
				const res = await fetch('/api/ledger', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'create_entry',
						ledger_id: account.id,
						amount: finalAmount,
						description: description.trim() || null,
						date: finalDateStr,
						type,
					}),
				});
				if (!res.ok) throw new Error('Failed to save entry');
				toast.success('Entry saved!', { id: toastId });
			}

			queryClient.invalidateQueries({ queryKey: ['ledger'] });
			queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
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
					className='fixed inset-0 bg-slate-900/60 backdrop-blur-md transform-gpu z-100 flex items-center justify-center min-h-dvh p-4 overflow-hidden'
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.95, opacity: 0, y: 20 }}
						onClick={(e) => e.stopPropagation()}
						className='bg-fuchsia-50/90 backdrop-blur-2xl transform-gpu dark:bg-fuchsia-950/30 w-full max-w-md border border-fuchsia-100 dark:border-fuchsia-800/30 overflow-hidden rounded-3xl shadow-2xl'
					>
						<div className='p-4 sm:p-6 border-b border-fuchsia-100 dark:border-fuchsia-800/30 flex justify-between items-center bg-violet-50/50 dark:bg-violet-900/20'>
							<h2 className='text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
								<span
									className={`w-3 h-3 rounded-full shadow-sm ${type === 'give' ? 'bg-rose-500' : 'bg-emerald-500'}`}
								/>
								{isEdit ? 'Edit' : 'Add'} Entry for{' '}
								{account.name}
							</h2>
							<button
								onClick={onClose}
								className='cursor-pointer p-2 text-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm rounded-full transition-colors hover:-translate-y-0.5 active:translate-y-0'
							>
								<X
									size={18}
									strokeWidth={2}
								/>
							</button>
						</div>

						<form
							onSubmit={handleSubmit}
							className='p-4 sm:p-6 space-y-5 overflow-y-auto overflow-x-hidden max-h-[75dvh]'
						>
							{/* Type Toggle */}
							<div>
								<label className={labelCls}>Type</label>
								<div className='grid grid-cols-2 gap-3'>
									<button
										type='button'
										onClick={() => setType('give')}
										className={`cursor-pointer flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border transition-all ${
											type === 'give' ?
												'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
											:	'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
										}`}
									>
										<ArrowUpRight
											size={16}
											strokeWidth={2.5}
										/>
										You Gave
									</button>
									<button
										type='button'
										onClick={() => setType('take')}
										className={`cursor-pointer flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border transition-all ${
											type === 'take' ?
												'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
											:	'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
										}`}
									>
										<ArrowDownLeft
											size={16}
											strokeWidth={2.5}
										/>
										You Got
									</button>
								</div>
							</div>

							{/* Amount */}
							<div>
								<label className={labelCls}>Amount</label>
								<div className='relative'>
									<span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg'>
										&#8377;
									</span>
									<input
										type='text'
										inputMode='decimal'
										required
										value={amount}
										onChange={(e) =>
											setAmount(e.target.value)
										}
										className='w-full pl-9 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-slate-50 dark:focus:bg-slate-800 shadow-sm font-semibold text-base md:text-lg transition-shadow outline-none text-slate-900 dark:text-white'
										placeholder='e.g. 120+12'
									/>
								</div>
								<AnimatePresence>
									{calculatedAmount !== null && (
										<motion.div
											initial={{
												opacity: 0,
												y: -5,
												height: 0,
											}}
											animate={{
												opacity: 1,
												y: 0,
												height: 'auto',
											}}
											exit={{
												opacity: 0,
												y: -5,
												height: 0,
											}}
											className='mt-2 flex items-center justify-between bg-violet-50/50 dark:bg-violet-900/20 px-4 py-2.5 rounded-xl border border-violet-100 dark:border-violet-800/30 overflow-hidden'
										>
											<span className='text-sm text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2'>
												<span className='text-violet-500 dark:text-violet-400 font-bold'>
													=
												</span>
												&#8377;{' '}
												{calculatedAmount.toLocaleString()}
											</span>
											<button
												type='button'
												onClick={() =>
													setAmount(
														calculatedAmount.toString(),
													)
												}
												className='cursor-pointer text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm font-medium transition-all active:scale-95'
											>
												Use Value
											</button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Description */}
							<div>
								<label className={labelCls}>
									Description (optional)
								</label>
								<input
									type='text'
									value={description}
									onChange={(e) =>
										setDescription(e.target.value)
									}
									className={inputCls}
									placeholder='e.g. Lunch money'
								/>
							</div>

							{/* Date & Time */}
							<div className='grid grid-cols-2 gap-3'>
								<div>
									<label className={labelCls}>Date</label>
									<input
										type='date'
										required
										value={date}
										onChange={(e) =>
											setDate(e.target.value)
										}
										inputMode='text'
										className={`font-medium ${inputCls}`}
									/>
								</div>
								<div>
									<label className={labelCls}>Time</label>
									<input
										type='time'
										required
										value={time}
										onChange={(e) =>
											setTime(e.target.value)
										}
										className={`font-medium ${inputCls}`}
									/>
								</div>
							</div>

							<div className='pt-2'>
								<motion.button
									whileTap={
										!isDisabled && !loading ?
											{ scale: 0.98 }
										:	undefined
									}
									type='submit'
									disabled={loading || isDisabled}
									className={`w-full py-3 text-white rounded-xl font-medium text-lg flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md ${
										type === 'give' ?
											'bg-rose-600 dark:bg-rose-500 hover:bg-rose-700'
										:	'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700'
									} ${
										loading || isDisabled ?
											'opacity-50 cursor-not-allowed'
										:	'cursor-pointer'
									}`}
								>
									{loading ?
										<div className='h-5 w-5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin' />
									:	<>
											<CheckCircle2
												size={20}
												strokeWidth={2}
											/>
											{isEdit ?
												'Update Entry'
											:	'Save Entry'}
										</>
									}
								</motion.button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
