'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@/types';

type Type = 'income' | 'expense';

interface AddTransactionModalProps {
	isOpen: boolean;
	onClose: () => void;
	type: Type;
	userId: string;
	onSuccess: () => void;
	editItem?: Transaction;
}

const EXPENSE_CATEGORIES = [
	'Food',
	'Clothes/Fashion',
	'Electronics',
	'Bills',
	'Travel',
	'Devotional',
	'Vehicle',
	'Misc.',
	'Entertainment',
	'Other',
];
const PAYMENT_TYPES = ['Cash', 'Credit Card', 'UPI', 'Debit Card', 'Other'];
const INCOME_SOURCES = ['Salary', 'Freelance', 'Gift', 'Investment', 'Other'];

export default function AddTransactionModal({
	isOpen,
	onClose,
	type,
	userId,
	onSuccess,
	editItem,
}: AddTransactionModalProps) {
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState('');
	const [name, setName] = useState('');
	const [categorySource, setCategorySource] = useState('');
	const [otherCategory, setOtherCategory] = useState('');
	const [paymentType, setPaymentType] = useState(PAYMENT_TYPES[0]);
	const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

	const resetForm = () => {
		setAmount('');
		setName('');
		setCategorySource('');
		setOtherCategory('');
		setPaymentType(PAYMENT_TYPES[0]);
		setDate(new Date().toISOString().split('T')[0]);
	};

	useEffect(() => {
		if (isOpen) {
			if (editItem) {
				setAmount(editItem.amount.toString());
				if (type === 'expense') {
					setName(editItem.title || '');
					const isStandard = EXPENSE_CATEGORIES.includes(
						editItem.category,
					);
					setCategorySource(isStandard ? editItem.category : 'Other');
					if (!isStandard) setOtherCategory(editItem.category);
					setPaymentType(editItem.payment_type || PAYMENT_TYPES[0]);
				} else {
					const isStandard = INCOME_SOURCES.includes(editItem.title);
					setCategorySource(isStandard ? editItem.title : 'Other');
					if (!isStandard) setOtherCategory(editItem.title);
				}
				setDate(new Date(editItem.date).toISOString().split('T')[0]);
			} else {
				resetForm();
			}
		}
	}, [isOpen, editItem, type]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!amount) return;

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
		const toastId = toast.loading(editItem ? 'Updating...' : 'Saving...');
		const finalCategory =
			categorySource === 'Other' ? otherCategory : (
				categorySource ||
				(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_SOURCES[0])
			);

		// Mix selected date with current time
		const [year, month, day] = date.split('-');
		const finalDateObj = new Date();
		finalDateObj.setFullYear(Number(year), Number(month) - 1, Number(day));
		const finalDateStr = finalDateObj.toISOString();

		try {
			if (type === 'expense') {
				const payload = {
					type,
					user_id: userId,
					amount: finalAmount,
					name: name || 'Expense',
					category: finalCategory,
					payment_type: paymentType,
					date: finalDateStr,
				};
				if (editItem) {
					const res = await fetch('/api/transactions', {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ ...payload, id: editItem.id }),
					});
					if (!res.ok) throw new Error('Failed to update');
				} else {
					const res = await fetch('/api/transactions', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload),
					});
					if (!res.ok) throw new Error('Failed to save');
				}
			} else {
				const payload = {
					type,
					user_id: userId,
					amount: finalAmount,
					source: finalCategory,
					date: finalDateStr,
				};
				if (editItem) {
					const res = await fetch('/api/transactions', {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ ...payload, id: editItem.id }),
					});
					if (!res.ok) throw new Error('Failed to update');
				} else {
					const res = await fetch('/api/transactions', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload),
					});
					if (!res.ok) throw new Error('Failed to save');
				}
			}
			toast.success(
				editItem ? 'Updated successfully!' : 'Saved successfully!',
				{ id: toastId },
			);
			queryClient.invalidateQueries({ queryKey: ['transactions'] });
			resetForm();
			if (onSuccess) onSuccess();
			onClose();
		} catch (error: any) {
			console.log(error);
			toast.error('Something went wrong', { id: toastId });
		} finally {
			setLoading(false);
		}
	};

	const calculatedAmount = useMemo(() => {
		try {
			if (!amount) return null;
			// If purely a number, no calculation needed
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

	const inputCls =
		'w-full px-4 py-3 text-base md:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-slate-50 dark:focus:bg-slate-800 shadow-sm transition-shadow outline-none text-slate-900 dark:text-white';
	const selectCls = `${inputCls} appearance-none font-medium`;
	const labelCls =
		'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
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
									<span
										className={`w-3 h-3 rounded-full shadow-sm ${type === 'expense' ? 'bg-fuchsia-500' : 'bg-emerald-500'}`}
									/>
									{editItem ? 'Edit' : 'Add'}{' '}
									{type === 'expense' ? 'Regret' : 'Income'}
								</h2>
								<button
									onClick={onClose}
									className='p-2 text-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm rounded-full transition-colors hover:-translate-y-0.5 active:translate-y-0 active:translate-x-0'
								>
									<X
										size={18}
										strokeWidth={2}
									/>
								</button>
							</div>

							<form
								onSubmit={handleSubmit}
								className='p-4 sm:p-6 space-y-5 overflow-y-auto overflow-x-hidden md:overflow-x-visible max-h-[75vh]'
							>
								<div>
									<label className={labelCls}>Amount</label>
									<div className='relative'>
										<span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg'>
											₹
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
													₹{' '}
													{calculatedAmount.toLocaleString()}
												</span>
												<button
													type='button'
													onClick={() =>
														setAmount(
															calculatedAmount.toString(),
														)
													}
													className='text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm font-medium transition-all active:scale-95'
												>
													Use Value
												</button>
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								{type === 'expense' && (
									<div>
										<label className={labelCls}>
											What you wasted it on
										</label>
										<input
											type='text'
											required
											value={name}
											onChange={(e) =>
												setName(e.target.value)
											}
											className={inputCls}
											placeholder='e.g. Useless gadget'
										/>
									</div>
								)}

								<div>
									<label className={labelCls}>
										{type === 'expense' ?
											'Excuse'
										:	'Source'}
									</label>
									<select
										value={categorySource}
										onChange={(e) =>
											setCategorySource(e.target.value)
										}
										className={selectCls}
									>
										<option
											value=''
											disabled
										>
											Select{' '}
											{type === 'expense' ?
												'Category'
											:	'Source'}
										</option>
										{(type === 'expense' ?
											EXPENSE_CATEGORIES
										:	INCOME_SOURCES
										).map((opt) => (
											<option
												key={opt}
												value={opt}
											>
												{opt}
											</option>
										))}
									</select>
								</div>

								{categorySource === 'Other' && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
									>
										<input
											type='text'
											required
											value={otherCategory}
											onChange={(e) =>
												setOtherCategory(e.target.value)
											}
											className={`${inputCls} mt-2`}
											placeholder='Specify other...'
										/>
									</motion.div>
								)}

								{type === 'expense' && (
									<div>
										<label className={labelCls}>
											Payment Method
										</label>
										<select
											value={paymentType}
											onChange={(e) =>
												setPaymentType(e.target.value)
											}
											className={selectCls}
										>
											{PAYMENT_TYPES.map((opt) => (
												<option
													key={opt}
													value={opt}
												>
													{opt}
												</option>
											))}
										</select>
									</div>
								)}

								<div>
									<label className={labelCls}>Date</label>
									<input
										type="date"
										required
										value={date}
										onChange={(e) =>
											setDate(e.target.value)
										}
										inputMode="text"
										className={`font-medium ${inputCls}`}
									/>
								</div>

								<div className='pt-2'>
									<motion.button
										whileTap={{ scale: 0.98 }}
										type='submit'
										disabled={loading}
										className={`w-full py-3 text-white rounded-xl font-medium text-lg flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70 hover:shadow-md ${
											type === 'expense' ?
												'bg-fuchsia-600 dark:bg-fuchsia-500 hover:bg-fuchsia-700'
											:	'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700'
										}`}
									>
										{loading ?
											<div className='h-5 w-5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin' />
										:	<>
												<CheckCircle2
													size={20}
													strokeWidth={2}
												/>
												Save{' '}
												{type === 'expense' ?
													'Regret'
												:	'Income'}
											</>
										}
									</motion.button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
