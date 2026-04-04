'use client';

import { useState, useMemo } from 'react';
import { Session } from 'next-auth';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Plus, ArrowDownRight, ArrowUpRight, CalendarDays } from 'lucide-react';

import AddTransactionModal from './AddTransactionModal';
import { CategoriesChart, TrendChart } from './ExpenseCharts';
import TransactionsTable from './TransactionsTable';
import ConfirmModal from '../ConfirmModal';
import { Expense, Income, Transaction } from '@/types';

export default function Dashboard({ session }: { session: Session }) {
	const [modalOpen, setModalOpen] = useState(false);
	const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
	const [editItem, setEditItem] = useState<Transaction | null>(null);
	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		id: string | null;
		type: 'income' | 'expense';
	}>({ isOpen: false, id: null, type: 'expense' });
	const [filterMonth, setFilterMonth] = useState<string>(
		new Date().getMonth().toString(),
	);

	const MONTHS = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December',
	];
	const monthLabel =
		filterMonth === 'all'
			? 'All Time'
			: `${MONTHS[parseInt(filterMonth)]} ${new Date().getFullYear()}`;

	const userId = session?.user?.id || session?.user?.email;

	const {
		data,
		isLoading: loading,
		refetch,
	} = useQuery({
		queryKey: ['transactions', userId, filterMonth],
		queryFn: async () => {
			if (!userId) return { incomes: [], expenses: [] };
			const { data } = await axios.get<{
				incomes: Income[];
				expenses: Expense[];
			}>(`/api/transactions/?month=${filterMonth}`);
			return data;
		},
		enabled: !!userId,
		refetchInterval: 3000,
	});

	// Always fetch all-time data for the monthly breakdown section
	const { data: allData, refetch: refetchAll } = useQuery({
		queryKey: ['transactions-all', userId],
		queryFn: async () => {
			if (!userId) return { incomes: [], expenses: [] };
			const { data } = await axios.get<{
				incomes: Income[];
				expenses: Expense[];
			}>(`/api/transactions/?month=all`);
			return data;
		},
		enabled: !!userId,
		refetchInterval: 60000,
	});

	const handleRefresh = () => {
		refetch();
		refetchAll();
	};

	const incomes = data?.incomes || [];
	const expenses = data?.expenses || [];

	const monthlyBreakdown = useMemo(() => {
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth(); // 0-indexed (0 to 11)
		const allIncomes = allData?.incomes || [];
		const allExpenses = allData?.expenses || [];
		const map: Record<string, { income: number; expense: number }> = {};

		// Pre-populate with months from January until the current month only
		for (let i = 0; i <= currentMonth; i++) {
			const date = new Date(currentYear, i, 2);
			const key = date.toISOString().slice(0, 7);
			map[key] = { income: 0, expense: 0 };
		}

		allIncomes.forEach((i) => {
			const d = new Date(i.date);
			if (d.getFullYear() === currentYear) {
				const key = d.toISOString().slice(0, 7);
				if (map[key]) map[key].income += i.amount;
			}
		});
		allExpenses.forEach((e) => {
			const d = new Date(e.date);
			if (d.getFullYear() === currentYear) {
				const key = d.toISOString().slice(0, 7);
				if (map[key]) map[key].expense += e.amount;
			}
		});

		// Sort chronologically (Jan -> current month)
		return Object.entries(map)
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([key, val]) => ({
				key,
				month: new Date(key + '-02').toLocaleDateString('en-IN', {
					month: 'long',
					year: 'numeric',
				}),
				income: val.income,
				expense: val.expense,
				balance: val.income - val.expense,
				pct: val.income > 0
					? Math.min(
							Math.round((val.expense / val.income) * 100),
							999,
						)
					: val.expense > 0 ? 100 : 0,
			}));
	}, [allData]);

	const handleDelete = (id: string, type: 'income' | 'expense') => {
		setConfirmModal({ isOpen: true, id, type });
	};

	const executeDelete = async () => {
		if (!confirmModal.id) return;
		setConfirmModal((prev) => ({ ...prev, isOpen: false }));

		const toastId = toast.loading('Deleting...');
		try {
			const res = await fetch(
				`/api/transactions?id=${confirmModal.id}&type=${confirmModal.type}`,
				{ method: 'DELETE' },
			);
			if (!res.ok) throw new Error('Delete failed');
			toast.success('Transaction deleted successfully', { id: toastId });
			handleRefresh();
		} catch {
			toast.error('Failed to delete transaction', { id: toastId });
		}
	};

	const handleEdit = (item: Transaction) => {
		setModalType(item.type);
		setEditItem(item);
		setModalOpen(true);
	};

	const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
	const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
	const remaining = totalIncome - totalExpense;
	const percentageUsed =
		totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : (totalExpense > 0 ? '100' : '0');

	return (
		<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
			<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<header className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
					<div>
						<h1 className='text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'>
							Wall of Regret
						</h1>
						<p className='text-slate-500 dark:text-slate-400 mt-1'>
							Welcome back, {session.user?.name}
						</p>
					</div>
					<div className='flex flex-wrap items-center gap-3'>
						{/* Month filter */}
						<div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-sm'>
							<CalendarDays size={15} className='text-violet-500 flex-shrink-0' />
							<span className='text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline'>
								{monthLabel}
							</span>
							<select
								value={filterMonth}
								onChange={(e) => setFilterMonth(e.target.value)}
								className='text-base md:text-sm font-medium text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer appearance-none pr-1'
							>
								<option value='all'>All Time</option>
								{MONTHS.map((m, i) => (
									<option key={i} value={i.toString()}>{m}</option>
								))}
							</select>
						</div>

						<button
							onClick={() => {
								setModalType('income');
								setEditItem(null);
								setModalOpen(true);
							}}
							className='bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors shadow-sm'
						>
							<Plus size={18} className='text-emerald-500' />
							<span>Rare Windfall</span>
						</button>
						<button
							onClick={() => {
								setModalType('expense');
								setEditItem(null);
								setModalOpen(true);
							}}
							className='bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all'
						>
							<Plus size={18} />
							<span>Add Regret</span>
						</button>
					</div>
				</header>

				{loading ? <DashboardSkeleton /> : <>
				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10'>
					<StatCard
						title='Brief Joy (Income)'
						amount={`₹${totalIncome.toLocaleString()}`}
						type='income'
						icon={
							<ArrowDownRight
								size={20}
								className='text-emerald-500'
							/>
						}
					/>
					<StatCard
						title='Money Wasted'
						amount={`₹${totalExpense.toLocaleString()}`}
						type='expense'
						icon={
							<ArrowUpRight
								size={20}
								className='text-rose-500'
							/>
						}
					/>
					<StatCard
						title='Remaining Illusion'
						amount={`₹${remaining.toLocaleString()}`}
						type='neutral'
					/>
					<StatCard
						title='Damage Done (%)'
						amount={`${percentageUsed}%`}
						type='neutral'
					/>
				</div>

				{/* Charts Layout */}
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10'>
					<div className='lg:col-span-2 bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl px-2 py-4 sm:p-6 min-h-100 shadow-sm flex flex-col'>
						<h3 className='text-lg font-semibold mb-6 text-slate-800 dark:text-slate-200 px-4'>
							Expense Over Time
						</h3>
						<div className='flex-1 relative'>
							<TrendChart expenses={expenses} />
						</div>
					</div>

					<div className='bg-fuchsia-50/60 backdrop-blur-xl dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/20 rounded-3xl p-4 sm:p-6 min-h-100 shadow-sm flex flex-col'>
						<h3 className='text-lg font-semibold mb-6 text-slate-800 dark:text-slate-200'>
							Categories
						</h3>
						<div className='flex-1 relative'>
							<CategoriesChart expenses={expenses} />
						</div>
					</div>
				</div>

				<TransactionsTable
					incomes={incomes}
					expenses={expenses}
					onEdit={handleEdit}
					onDelete={handleDelete}
					filterMonth={filterMonth}
					setFilterMonth={setFilterMonth}
				/>

				<MonthlyBreakdown data={monthlyBreakdown} />
				</>}

				<AddTransactionModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					type={modalType}
					userId={userId}
					onSuccess={handleRefresh}
					editItem={editItem!}
				/>

				<ConfirmModal
					isOpen={confirmModal.isOpen}
					onClose={() =>
						setConfirmModal((prev) => ({ ...prev, isOpen: false }))
					}
					onConfirm={executeDelete}
					title='Delete Record'
					message='Are you completely sure you want to delete this record from your history?'
					confirmLabel='Delete'
					isDanger={true}
				/>
			</div>
		</div>
	);
}

function StatCard({
	title,
	amount,
	type,
	icon,
}: {
	title: string;
	amount: string;
	type: 'income' | 'expense' | 'neutral';
	icon?: React.ReactNode;
}) {
	const colorClass =
		type === 'income' ? 'text-emerald-600 dark:text-emerald-400'
		: type === 'expense' ? 'text-rose-600 dark:text-rose-400'
		: 'text-slate-900 dark:text-white';

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ y: -4 }}
			className='bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 p-6 rounded-3xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group'
		>
			<div className='absolute -inset-2 bg-linear-to-r from-transparent via-white/40 to-transparent dark:via-white/5 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none' />
			<div className='flex items-center justify-between mb-2 relative z-10'>
				<h3 className='text-sm font-medium text-slate-500 dark:text-slate-400'>
					{title}
				</h3>
				{icon}
			</div>
			<div className={`text-3xl font-bold ${colorClass}`}>{amount}</div>
		</motion.div>
	);
}

function DashboardSkeleton() {
	const shimmer = 'animate-pulse bg-slate-200/80 dark:bg-slate-700/50 rounded-xl';
	return (
		<div className='space-y-8'>
			{/* Stat Cards Skeleton */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{[...Array(4)].map((_, i) => (
					<div key={i} className='bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 p-6 rounded-3xl shadow-sm'>
						<div className='flex items-center justify-between mb-3'>
							<div className={`${shimmer} h-4 w-24`} />
							<div className={`${shimmer} h-5 w-5 rounded-full`} />
						</div>
						<div className={`${shimmer} h-9 w-32`} />
					</div>
				))}
			</div>

			{/* Charts Skeleton */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<div className='lg:col-span-2 bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-6 min-h-100 shadow-sm'>
					<div className={`${shimmer} h-5 w-40 mb-6`} />
					<div className='flex items-end gap-3 h-52'>
						{[40, 65, 45, 80, 55, 70, 35, 60, 75, 50, 85, 45].map((h, i) => (
							<div key={i} className={`${shimmer} flex-1 rounded-t-lg`} style={{ height: `${h}%` }} />
						))}
					</div>
				</div>
				<div className='bg-fuchsia-50/60 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/20 rounded-3xl p-6 min-h-100 shadow-sm'>
					<div className={`${shimmer} h-5 w-28 mb-6`} />
					<div className='flex items-center justify-center py-8'>
						<div className={`${shimmer} w-40 h-40 rounded-full`} />
					</div>
					<div className='space-y-2 mt-4'>
						{[...Array(4)].map((_, i) => (
							<div key={i} className='flex items-center gap-2'>
								<div className={`${shimmer} w-3 h-3 rounded-full`} />
								<div className={`${shimmer} h-3 flex-1`} />
								<div className={`${shimmer} h-3 w-10`} />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Transactions Table Skeleton */}
			<div className='bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-4 sm:p-6 shadow-sm'>
				<div className='flex items-center justify-between mb-6'>
					<div className={`${shimmer} h-6 w-40`} />
					<div className='flex gap-3'>
						<div className={`${shimmer} h-10 w-48`} />
						<div className={`${shimmer} h-10 w-24`} />
					</div>
				</div>
				<div className='space-y-3'>
					{[...Array(5)].map((_, i) => (
						<div key={i} className='flex items-center gap-4 p-4 bg-white/50 dark:bg-slate-900/30 rounded-2xl'>
							<div className={`${shimmer} h-8 w-16 rounded-lg`} />
							<div className={`${shimmer} h-4 w-32`} />
							<div className='flex-1' />
							<div className={`${shimmer} h-4 w-24`} />
							<div className={`${shimmer} h-4 w-20`} />
						</div>
					))}
				</div>
			</div>

			{/* Monthly Breakdown Skeleton */}
			<div className='bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-4 sm:p-6 shadow-sm'>
				<div className={`${shimmer} h-6 w-56 mb-6`} />
				<div className='space-y-3'>
					{[...Array(4)].map((_, i) => (
						<div key={i} className='flex items-center gap-4 p-4 bg-white/50 dark:bg-slate-900/30 rounded-2xl'>
							<div className={`${shimmer} h-4 w-28`} />
							<div className='flex-1' />
							<div className={`${shimmer} h-4 w-20`} />
							<div className={`${shimmer} h-4 w-20`} />
							<div className={`${shimmer} h-4 w-20`} />
							<div className={`${shimmer} h-2 w-24 rounded-full`} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

type MonthRow = {
	key: string;
	month: string;
	income: number;
	expense: number;
	balance: number;
	pct: number;
};

function MonthlyBreakdown({ data }: { data: MonthRow[] }) {
	if (!data.length) return null;

	const currentYear = new Date().getFullYear();
	const totalIncomeYear = data.reduce((s, r) => s + r.income, 0);
	const totalSpentYear = data.reduce((s, r) => s + r.expense, 0);
	const anualBalance = totalIncomeYear - totalSpentYear;
	const anualDamage = totalIncomeYear > 0 ? Math.round((totalSpentYear / totalIncomeYear) * 100) : (totalSpentYear > 0 ? 100 : 0);

	return (
		<motion.div
			layout
			className='bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-4 sm:p-6 shadow-sm mt-6 relative z-10'
		>
			<h3 className='text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 mb-6 px-1'>
				Annual Regret Timeline ({currentYear})
			</h3>

			{/* Mobile cards */}
			<div className='md:hidden space-y-3'>
				{data.map((row) => {
					const barColor =
						row.pct > 80 ? 'bg-rose-500'
						: row.pct > 50 ? 'bg-amber-400'
						: 'bg-emerald-500';
					return (
						<div
							key={row.key}
							className='bg-white/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-violet-100 dark:border-violet-800/30 shadow-sm'
						>
							<div className='flex items-center justify-between mb-3'>
								<span className='font-semibold text-sm text-slate-800 dark:text-white'>
									{row.month}
								</span>
								<span
									className={`text-sm font-bold ${
										row.balance >= 0
											? 'text-emerald-600 dark:text-emerald-400'
											: 'text-rose-500 dark:text-rose-400'
									}`}
								>
									{row.balance >= 0 ? '+' : ''}₹
									{row.balance.toLocaleString('en-IN')}
								</span>
							</div>
							<div className='grid grid-cols-3 gap-3 text-xs mb-3'>
								<div>
									<p className='text-slate-400 mb-0.5'>Income</p>
									<p className='font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums'>
										₹{row.income.toLocaleString('en-IN')}
									</p>
								</div>
								<div>
									<p className='text-slate-400 mb-0.5'>Spent</p>
									<p className='font-semibold text-rose-500 dark:text-rose-400 tabular-nums'>
										₹{row.expense.toLocaleString('en-IN')}
									</p>
								</div>
								<div>
									<p className='text-slate-400 mb-0.5'>Damage</p>
									<p className='font-semibold text-slate-700 dark:text-slate-200'>
										{row.pct}%
									</p>
								</div>
							</div>
							<div className='h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden'>
								<div
									className={`h-full rounded-full ${barColor}`}
									style={{ width: `${Math.min(row.pct, 100)}%` }}
								/>
							</div>
						</div>
					);
				})}

				{/* Summary row for mobile */}
				<div className='bg-violet-100/90 dark:bg-violet-900/50 rounded-2xl p-4 border border-violet-200 dark:border-violet-700 shadow-md transition-all group overflow-hidden'>
					<h4 className='text-xs font-bold text-slate-500 dark:text-slate-300 uppercase mb-3 tracking-widest text-center'>
						Annual Summary ({currentYear})
					</h4>
					<div className='grid grid-cols-3 gap-2 text-center relative z-10'>
						<div>
							<p className='text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium'>Income</p>
							<p className='text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums'>
								₹{totalIncomeYear.toLocaleString('en-IN')}
							</p>
						</div>
						<div>
							<p className='text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium'>Spent</p>
							<p className='text-xs font-bold text-rose-500 dark:text-rose-400 tabular-nums'>
								₹{totalSpentYear.toLocaleString('en-IN')}
							</p>
						</div>
						<div>
							<p className='text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium'>Balance</p>
							<p className={`text-xs font-bold tabular-nums ${
								anualBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
							}`}>
								₹{Math.abs(anualBalance).toLocaleString('en-IN')}
							</p>
						</div>
					</div>
					<div className='mt-4 px-2'>
						<div className='flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold italic uppercase tracking-tighter'>
							<span>Annual Damage</span>
							<span>{anualDamage}%</span>
						</div>
						<div className='h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden'>
							<div
								className={`h-full rounded-full transition-all duration-1000 ${
									anualDamage > 80 ? 'bg-rose-500' : anualDamage > 50 ? 'bg-amber-400' : 'bg-emerald-500'
								}`}
								style={{ width: `${Math.min(anualDamage, 100)}%` }}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Desktop table */}
			<div className='hidden md:block overflow-x-auto rounded-xl border border-violet-100 dark:border-violet-800/30 bg-white/40 dark:bg-slate-950/40'>
				<table className='w-full text-sm text-left table-auto'>
					<thead className='bg-violet-100/50 dark:bg-violet-800/30 border-b border-violet-100 dark:border-violet-800/30 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold'>
						<tr>
							<th className='px-6 py-4'>Month</th>
							<th className='px-6 py-4 text-right'>Income</th>
							<th className='px-6 py-4 text-right'>Spent</th>
							<th className='px-6 py-4 text-right'>Balance</th>
							<th className='px-6 py-4'>Damage %</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-violet-200/50 dark:divide-violet-800/30 bg-white/20 dark:bg-slate-900/20'>
						{data.map((row) => {
							const barColor =
								row.pct > 80 ? 'bg-rose-500'
								: row.pct > 50 ? 'bg-amber-400'
								: 'bg-emerald-500';
							return (
								<tr
									key={row.key}
									className='hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors'
								>
									<td className='px-6 py-4 font-semibold text-slate-800 dark:text-slate-200'>
										{row.month}
									</td>
									<td className='px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap'>
										₹{row.income.toLocaleString('en-IN')}
									</td>
									<td className='px-6 py-4 text-right font-semibold text-rose-500 dark:text-rose-400 tabular-nums whitespace-nowrap'>
										₹{row.expense.toLocaleString('en-IN')}
									</td>
									<td
										className={`px-6 py-4 text-right font-bold tabular-nums whitespace-nowrap ${
											row.balance >= 0
												? 'text-emerald-600 dark:text-emerald-400'
												: 'text-rose-500 dark:text-rose-400'
										}`}
									>
										{row.balance >= 0 ? '+' : ''}₹
										{row.balance.toLocaleString('en-IN')}
									</td>
									<td className='px-6 py-4 min-w-[120px]'>
										<div className='flex items-center gap-2'>
											<div className='flex-1 min-w-[60px] h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden'>
												<div
													className={`h-full rounded-full ${barColor}`}
													style={{ width: `${Math.min(row.pct, 100)}%` }}
												/>
											</div>
											<span className='text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums w-10'>
												{row.pct}%
											</span>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot className='bg-violet-100/80 dark:bg-violet-900/40 font-bold border-t border-violet-200 dark:border-violet-700'>
						<tr>
							<td className='px-6 py-5 text-slate-800 dark:text-white uppercase text-[10px] tracking-wider'>
								Yearly Aggregate ({currentYear})
							</td>
							<td className='px-6 py-5 text-right text-emerald-600 dark:text-emerald-400 tabular-nums text-base'>
								₹{totalIncomeYear.toLocaleString('en-IN')}
							</td>
							<td className='px-6 py-5 text-right text-rose-500 dark:text-rose-400 tabular-nums text-base'>
								₹{totalSpentYear.toLocaleString('en-IN')}
							</td>
							<td
								className={`px-6 py-5 text-right tabular-nums text-base ${
									anualBalance >= 0
										? 'text-emerald-600 dark:text-emerald-400'
										: 'text-rose-500 dark:text-rose-400'
								}`}
							>
								{anualBalance >= 0 ? '+' : ''}₹
								{anualBalance.toLocaleString('en-IN')}
							</td>
							<td className='px-6 py-5'>
								<div className='flex items-center gap-2'>
									<div className='flex-1 min-w-[60px] h-2.5 bg-slate-300/50 dark:bg-slate-700/50 rounded-full overflow-hidden'>
										<div
											className={`h-full rounded-full ${
												anualDamage > 80 ? 'bg-rose-500' : anualDamage > 50 ? 'bg-amber-400' : 'bg-emerald-500'
											}`}
											style={{ width: `${Math.min(anualDamage, 100)}%` }}
										/>
									</div>
									<span className='text-xs font-black text-slate-700 dark:text-slate-200 uppercase tabular-nums'>
										{anualDamage}%
									</span>
								</div>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</motion.div>
	);
}
