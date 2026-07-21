'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import { Transaction } from '@/types';
import { PAYMENT_TYPES, EXPENSE_CATEGORIES, INCOME_SOURCES } from '@/constants';
import CustomSelect from '@/components/ui/CustomSelect';
import { getLocalDateString, getLocalTimeString } from '@/utils';

type Type = 'income' | 'expense';

interface AddTransactionModalProps {
	isOpen: boolean;
	onClose: () => void;
	type: Type;
	userId: string;
	onSuccess: () => void;
	editItem?: Transaction;
}

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

	const [date, setDate] = useState(getLocalDateString());
	const [time, setTime] = useState(getLocalTimeString());

	const resetForm = () => {
		setAmount('');
		setName('');
		setCategorySource('');
		setOtherCategory('');
		setPaymentType(PAYMENT_TYPES[0]);
		setDate(getLocalDateString());
		setTime(getLocalTimeString());
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
				const entryDate = new Date(editItem.date);
				setDate(getLocalDateString(entryDate));
				setTime(getLocalTimeString(entryDate));
			} else {
				resetForm();
			}
		}
	}, [isOpen, editItem, type]);

	// Digits and calculator operators only (e.g. 120+50)
	const AMOUNT_ALLOWED = /^[\d.+\-*/()\s]*$/;

	const handleAmountChange = (val: string) => {
		setAmount(val);
		if (val && !AMOUNT_ALLOWED.test(val)) {
			toast.error(
				'Amounts take digits only — plus + - × ÷ for quick maths.',
				{ id: 'amount-invalid' },
			);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!amount) return;

		if (!AMOUNT_ALLOWED.test(amount)) {
			toast.error(
				'Amount has letters or symbols in it — enter a number or an expression like 120+50.',
				{ id: 'amount-invalid' },
			);
			return;
		}

		let finalAmount = parseFloat(amount);
		if (Number.isNaN(finalAmount)) {
			try {
				const sanitized = amount.replace(/[^\d.+\-*/()]/g, '');
				finalAmount = new Function(`return ${sanitized}`)();
			} catch {
				finalAmount = 0;
			}
		}

		if (
			!finalAmount ||
			Number.isNaN(Number(finalAmount)) ||
			finalAmount <= 0
		) {
			toast.error(
				'That amount doesn’t add up — enter a value greater than 0.',
				{ id: 'amount-invalid' },
			);
			return;
		}

		setLoading(true);
		const toastId = toast.loading(editItem ? 'Updating...' : 'Saving...');
		const finalCategory =
			categorySource === 'Other' ? otherCategory : (
				categorySource ||
				(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_SOURCES[0])
			);

		const [year, month, day] = date.split('-').map(Number);
		const [hours, minutes] = time.split(':').map(Number);
		const finalDateObj = new Date(year, month - 1, day, hours, minutes, 0);
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

	const isInvalid = useMemo(() => {
		if (!amount || !date || !categorySource) return true;
		if (categorySource === 'Other' && !otherCategory) return true;
		if (type === 'expense' && !name) return true;
		return false;
	}, [amount, date, categorySource, otherCategory, type, name]);

	const inputCls =
		'w-full px-4 py-3 text-base md:text-sm bg-white/6 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-shadow outline-none text-white placeholder-white/30';

	const labelCls = 'block text-sm font-semibold text-white/80 mb-1.5';

	return (
		<AnimatePresence>
			{isOpen && (
				<>
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
								<h2 className='text-xl font-semibold tracking-tight text-white flex items-center gap-2'>
									<span
										className={`w-3 h-3 rounded-full ${type === 'expense' ? 'bg-red-500' : 'bg-emerald-500'}`}
									/>
									{editItem ? 'Edit' : 'Add'}{' '}
									{type === 'expense' ? 'Regret' : 'Income'}
								</h2>
								<button
									onClick={onClose}
									className='p-2 text-white/50 hover:text-white border border-white/10 bg-white/8 hover:bg-white/[0.14] rounded-full transition-colors hover:-translate-y-0.5 active:translate-y-0 active:translate-x-0'
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
										<span className='absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold text-lg'>
											₹
										</span>
										<input
											type='text'
											inputMode='decimal'
											required
											value={amount}
											onChange={(e) =>
												handleAmountChange(
													e.target.value,
												)
											}
											className='w-full pl-9 pr-4 py-3 bg-white/6 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 font-semibold text-base md:text-lg transition-shadow outline-none text-white placeholder-white/30'
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
												className='mt-2 flex items-center justify-between bg-white/6 px-4 py-2.5 rounded-xl border border-white/10 overflow-hidden'
											>
												<span className='text-sm text-white/80 font-semibold flex items-center gap-2'>
													<span className='text-white/50 font-semibold'>
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
													className='text-xs px-3 py-1.5 bg-white/8 border border-white/10 text-white/80 rounded-lg hover:bg-white/[0.14] font-medium transition-all active:scale-95'
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
									<CustomSelect
										value={categorySource}
										onChange={setCategorySource}
										placeholder={`Select ${type === 'expense' ? 'Category' : 'Source'}`}
										options={(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_SOURCES).map((opt) => ({
											value: opt,
											label: opt,
										}))}
									/>
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
										<CustomSelect
											value={paymentType}
											onChange={setPaymentType}
											options={PAYMENT_TYPES.map((opt) => ({
												value: opt,
												label: opt,
											}))}
										/>
									</div>
								)}

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
										whileTap={{ scale: 0.98 }}
										type='submit'
										disabled={loading || isInvalid}
										className={`w-full py-3 text-white rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
											type === 'expense' ?
												'bg-red-500 hover:bg-red-600'
											:	'bg-emerald-500 hover:bg-emerald-600'
										}`}
									>
										{loading ?
											<div className='h-5 w-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin' />
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
