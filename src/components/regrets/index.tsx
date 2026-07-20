'use client';

import { useState, useMemo } from 'react';
import { Session } from 'next-auth';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
	Plus,
	ArrowDownRight,
	ArrowUpRight,
	CalendarDays,
	Wallet,
	Percent,
	PieChart,
	BarChart3,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

import AddTransactionModal from './AddTransactionModal';
import { CategoriesChart, CategoryBars, TrendChart } from './ExpenseCharts';
import TransactionsTable from './TransactionsTable';
import ConfirmModal from '../ConfirmModal';
import { Expense, Income, Transaction } from '@/types';
import { MONTHS } from '@/constants';

export default function Regrets({ session }: { session: Session }) {
	const [modalOpen, setModalOpen] = useState(false);
	const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
	const [catView, setCatView] = useState<'donut' | 'bars'>('donut');
	const [editItem, setEditItem] = useState<Transaction | null>(null);
	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		id: string | null;
		type: 'income' | 'expense';
	}>({ isOpen: false, id: null, type: 'expense' });
	const [filterMonth, setFilterMonth] = useState<string>(
		new Date().getMonth().toString(),
	);

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

		// Sort latest month first (current month -> Jan)
		return Object.entries(map)
			.sort((a, b) => b[0].localeCompare(a[0]))
			.map(([key, val]) => ({
				key,
				month: new Date(key + '-02').toLocaleDateString('en-IN', {
					month: 'long',
					year: 'numeric',
				}),
				income: val.income,
				expense: val.expense,
				balance: val.income - val.expense,
				pct:
					val.income > 0 ?
						Math.min(
							Math.round((val.expense / val.income) * 100),
							999,
						)
					: val.expense > 0 ? 100
					: 0,
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
		totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1)
		: totalExpense > 0 ? '100'
		: '0';

	return (
		<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
			<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<motion.header
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					className='flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8'
				>
					<div>
						<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient'>
							Every rupee, remembered
						</span>
						<h1 className='text-4xl font-semibold tracking-tight text-gradient mt-2'>
							Wall of Regret
						</h1>
						<p className='text-white/50 mt-1.5'>
							Welcome back, {session.user?.name}
						</p>
					</div>
					<div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
						{/* Month filter */}
						<CustomSelect
							value={filterMonth}
							onChange={setFilterMonth}
							icon={<CalendarDays size={15} className='text-white/50' />}
							options={[
								{ value: 'all', label: 'All Time' },
								...MONTHS.map((m, i) => ({ value: i.toString(), label: m })),
							]}
							className='w-auto'
						/>

						<div className='flex items-center gap-1.5 sm:gap-3'>
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								onClick={() => {
									setModalType('income');
									setEditItem(null);
									setModalOpen(true);
								}}
								className='bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 px-4 py-2.5 rounded-xl font-medium text-white/80 flex items-center gap-2 transition-colors cursor-pointer'
							>
								<Plus
									size={18}
									className='text-emerald-400'
								/>
								<span>Rare Windfall</span>
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								onClick={() => {
									setModalType('expense');
									setEditItem(null);
									setModalOpen(true);
								}}
								className='bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer group/new'
							>
								<Plus
									size={18}
									className='transition-transform duration-300 group-hover/new:rotate-90'
								/>
								<span>Add Regret</span>
							</motion.button>
						</div>
					</div>
				</motion.header>

				{loading ?
					<RegretsSkeleton />
				:	<>
						{/* Stats Bar — one footer-style pill container */}
						<motion.div
							initial='hidden'
							animate='show'
							variants={{
								hidden: { opacity: 0, y: 14 },
								show: {
									opacity: 1,
									y: 0,
									transition: {
										staggerChildren: 0.07,
										delayChildren: 0.1,
									},
								},
							}}
							className='bg-[#0b0b0d] border border-white/[0.08] rounded-2xl px-2 sm:px-4 py-5 mb-8 relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-y-6 lg:gap-y-0 lg:divide-x divide-white/[0.06]'
						>
							<StatCard
								title='Brief Joy (Income)'
								amount={`₹${totalIncome.toLocaleString()}`}
								type='income'
								chipClass='bg-[#f0f8e8]/10 text-[#f0f8e8]'
								icon={
									<ArrowDownRight
										size={22}
										className='text-emerald-400'
									/>
								}
							/>
							<StatCard
								title='Money Wasted'
								amount={`₹${totalExpense.toLocaleString()}`}
								type='expense'
								chipClass='bg-[#d39dbd]/15 text-[#e7c1d8]'
								icon={
									<ArrowUpRight
										size={22}
										className='text-red-400'
									/>
								}
							/>
							<StatCard
								title='Remaining Illusion'
								amount={`₹${remaining.toLocaleString()}`}
								type='neutral'
								chipClass='bg-[#9294e5]/15 text-[#b9baf1]'
								icon={<Wallet size={22} />}
							/>
							<StatCard
								title='Damage Done (%)'
								amount={`${percentageUsed}%`}
								type='neutral'
								chipClass='bg-[#cbf1fd]/10 text-[#cbf1fd]'
								icon={<Percent size={22} />}
							/>
						</motion.div>

						{/* Charts Layout */}
						<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10'>
							<div className='lg:col-span-2 card-aurora rounded-3xl px-2 py-4 sm:p-6 min-h-100 flex flex-col'>
								<h3 className='text-lg font-semibold tracking-tight mb-6 text-white px-4'>
									Expense Over Time
								</h3>
								<div className='flex-1 relative'>
									<TrendChart expenses={expenses} />
								</div>
							</div>

							<div className='card-aurora rounded-3xl p-4 sm:p-6 min-h-100 flex flex-col'>
								<div className='flex items-center justify-between mb-6'>
									<h3 className='text-lg font-semibold tracking-tight text-white'>
										Categories
									</h3>
									<div className='flex items-center gap-0.5 bg-white/[0.06] border border-white/[0.08] rounded-lg p-1'>
										<button
											onClick={() => setCatView('donut')}
											title='Donut view'
											className={`p-1.5 rounded-md transition-colors cursor-pointer ${
												catView === 'donut' ?
													'bg-white/10 text-white'
												:	'text-white/40 hover:text-white/70'
											}`}
										>
											<PieChart size={14} />
										</button>
										<button
											onClick={() => setCatView('bars')}
											title='Bars view'
											className={`p-1.5 rounded-md transition-colors cursor-pointer ${
												catView === 'bars' ?
													'bg-white/10 text-white'
												:	'text-white/40 hover:text-white/70'
											}`}
										>
											<BarChart3 size={14} />
										</button>
									</div>
								</div>
								<div className='flex-1 relative'>
									{catView === 'donut' ?
										<CategoriesChart expenses={expenses} />
									:	<CategoryBars expenses={expenses} />}
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
					</>
				}

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
	chipClass = 'bg-[#9294e5]/15 text-[#b9baf1]',
}: {
	title: string;
	amount: string;
	type: 'income' | 'expense' | 'neutral';
	icon?: React.ReactNode;
	chipClass?: string;
}) {
	const colorClass =
		type === 'income' ? 'text-emerald-400'
		: type === 'expense' ? 'text-red-400'
		: 'text-white';

	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 14 },
				show: {
					opacity: 1,
					y: 0,
					transition: {
						type: 'spring' as const,
						bounce: 0.25,
						duration: 0.6,
					},
				},
			}}
			className='flex items-center gap-3.5 sm:gap-4 px-4 sm:px-6'
		>
			{icon && (
				<div
					className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${chipClass}`}
				>
					{icon}
				</div>
			)}
			<div className='min-w-0'>
				<h3 className='text-xs sm:text-sm font-medium text-white/50 truncate'>
					{title}
				</h3>
				<div
					className={`text-xl sm:text-2xl font-semibold tracking-tight tabular-nums ${colorClass}`}
				>
					{amount}
				</div>
			</div>
		</motion.div>
	);
}

function RegretsSkeleton() {
	const shimmer = 'animate-pulse bg-white/[0.06] rounded-xl';
	return (
		<div className='space-y-8'>
			{/* Stats Bar Skeleton */}
			<div className='bg-[#0b0b0d] border border-white/[0.08] rounded-2xl px-2 sm:px-4 py-5 grid grid-cols-2 lg:grid-cols-4 gap-y-6 lg:gap-y-0 lg:divide-x divide-white/[0.06]'>
				{[...Array(4)].map((_, i) => (
					<div
						key={i}
						className='flex items-center gap-4 px-4 sm:px-6'
					>
						<div className={`${shimmer} w-12 h-12 shrink-0`} />
						<div className='min-w-0 flex-1'>
							<div className={`${shimmer} h-3.5 w-24 mb-2`} />
							<div className={`${shimmer} h-7 w-28`} />
						</div>
					</div>
				))}
			</div>

			{/* Charts Skeleton */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<div className='lg:col-span-2 card-ultra rounded-3xl p-6 min-h-100'>
					<div className={`${shimmer} h-5 w-40 mb-6`} />
					<div className='relative h-52'>
						{/* Y-axis ticks */}
						<div className='absolute left-0 top-0 bottom-6 flex flex-col justify-between'>
							{[...Array(5)].map((_, i) => (
								<div key={i} className={`${shimmer} h-2.5 w-8`} />
							))}
						</div>
						{/* Grid lines */}
						<div className='absolute left-12 right-0 top-0 bottom-6 flex flex-col justify-between'>
							{[...Array(5)].map((_, i) => (
								<div key={i} className='h-px bg-white/[0.08]' />
							))}
						</div>
						{/* Area curve */}
						<svg className='absolute left-12 right-0 top-0 bottom-6 w-[calc(100%-3rem)] h-[calc(100%-1.5rem)]' viewBox='0 0 400 180' preserveAspectRatio='none'>
							<defs>
								<linearGradient id='skelGrad' x1='0' y1='0' x2='0' y2='1'>
									<stop offset='0%' stopColor='#ffffff' stopOpacity='0.12' />
									<stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
								</linearGradient>
							</defs>
							<path d='M0,140 C30,135 60,120 100,100 C140,80 160,30 200,50 C240,70 280,90 320,85 C360,80 380,75 400,80 L400,180 L0,180 Z' fill='url(#skelGrad)' className='animate-pulse' />
							<path d='M0,140 C30,135 60,120 100,100 C140,80 160,30 200,50 C240,70 280,90 320,85 C360,80 380,75 400,80' fill='none' className='stroke-white/20 animate-pulse' strokeWidth='2.5' />
						</svg>
						{/* X-axis ticks */}
						<div className='absolute left-12 right-0 bottom-0 flex justify-between'>
							{[...Array(6)].map((_, i) => (
								<div key={i} className={`${shimmer} h-2.5 w-5`} />
							))}
						</div>
					</div>
					{/* Footer */}
					<div className='flex items-center gap-2 mt-2 pl-12'>
						<div className={`${shimmer} h-3 w-20`} />
						<div className={`${shimmer} h-3 w-px`} />
						<div className={`${shimmer} h-3 w-8`} />
					</div>
				</div>
				<div className='card-ultra rounded-3xl p-6 min-h-100'>
					<div className={`${shimmer} h-5 w-28 mb-6`} />
					<div className='flex items-center justify-center py-8'>
						<div className={`${shimmer} w-40 h-40 rounded-full`} />
					</div>
					<div className='space-y-2 mt-4'>
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className='flex items-center gap-2'
							>
								<div
									className={`${shimmer} w-3 h-3 rounded-full`}
								/>
								<div className={`${shimmer} h-3 flex-1`} />
								<div className={`${shimmer} h-3 w-10`} />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Transactions Table Skeleton */}
			<div className='card-ultra rounded-3xl p-4 sm:p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className={`${shimmer} h-6 w-40`} />
					<div className='flex gap-3'>
						<div className={`${shimmer} h-10 w-48`} />
						<div className={`${shimmer} h-10 w-24`} />
					</div>
				</div>
				<div className='space-y-3'>
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className='flex items-center gap-4 p-4 bg-white/[0.04] rounded-2xl'
						>
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
			<div className='card-ultra rounded-3xl p-4 sm:p-6'>
				<div className={`${shimmer} h-6 w-56 mb-6`} />
				<div className='space-y-3'>
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className='flex items-center gap-4 p-4 bg-white/[0.04] rounded-2xl'
						>
							<div className={`${shimmer} h-4 w-28`} />
							<div className='flex-1' />
							<div className={`${shimmer} h-4 w-20`} />
							<div className={`${shimmer} h-4 w-20`} />
							<div className={`${shimmer} h-4 w-20`} />
							<div
								className={`${shimmer} h-2 w-24 rounded-full`}
							/>
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

const barClasses = (pct: number) =>
	pct > 80 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.45)]'
	: pct > 50 ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]'
	: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]';

function DamageBar({ pct, className }: { pct: number; className: string }) {
	return (
		<div
			className={`bg-white/10 rounded-full overflow-hidden ${className}`}
		>
			<motion.div
				initial={{ width: 0 }}
				whileInView={{ width: `${Math.min(pct, 100)}%` }}
				viewport={{ once: true }}
				transition={{ duration: 0.9, ease: 'easeOut' }}
				className={`h-full rounded-full ${barClasses(pct)}`}
			/>
		</div>
	);
}

function MonthlyBreakdown({ data }: { data: MonthRow[] }) {
	if (!data.length) return null;

	const currentYear = new Date().getFullYear();
	const totalIncomeYear = data.reduce((s, r) => s + r.income, 0);
	const totalSpentYear = data.reduce((s, r) => s + r.expense, 0);
	const anualBalance = totalIncomeYear - totalSpentYear;
	const anualDamage =
		totalIncomeYear > 0 ?
			Math.round((totalSpentYear / totalIncomeYear) * 100)
		: totalSpentYear > 0 ? 100
		: 0;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-60px' }}
			className='card-aurora rounded-3xl p-4 sm:p-6 mt-6 relative z-10'
		>
			<div className='flex items-center gap-3 mb-6 px-1'>
				<div className='w-10 h-10 rounded-xl bg-[#9294e5]/15 text-[#b9baf1] flex items-center justify-center'>
					<CalendarDays size={18} />
				</div>
				<h3 className='text-xl font-semibold tracking-tight text-white'>
					Annual Regret Timeline ({currentYear})
				</h3>
			</div>

			{/* Mobile cards */}
			<div className='md:hidden flex flex-col gap-3'>
				<div className='order-2 max-h-120 overflow-y-auto bg-[#1a191e] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.05]'>
				{data.map((row) => {
					return (
						<div
							key={row.key}
							className='px-4 py-3 transition-colors hover:bg-white/[0.03]'
						>
							<div className='flex items-center justify-between mb-3'>
								<span className='font-semibold text-sm text-white'>
									{row.month}
								</span>
								<span
									className={`text-sm font-semibold ${
										row.balance >= 0 ?
											'text-emerald-400'
										:	'text-red-400'
									}`}
								>
									{row.balance >= 0 ? '+' : ''}₹
									{row.balance.toLocaleString('en-IN')}
								</span>
							</div>
							<div className='grid grid-cols-3 gap-3 text-xs mb-3'>
								<div>
									<p className='text-white/40 mb-0.5'>
										Income
									</p>
									<p className='font-semibold text-emerald-400 tabular-nums'>
										₹{row.income.toLocaleString('en-IN')}
									</p>
								</div>
								<div>
									<p className='text-white/40 mb-0.5'>
										Spent
									</p>
									<p className='font-semibold text-red-400 tabular-nums'>
										₹{row.expense.toLocaleString('en-IN')}
									</p>
								</div>
								<div>
									<p className='text-white/40 mb-0.5'>
										Damage
									</p>
									<p className='font-semibold text-white/80'>
										{row.pct}%
									</p>
								</div>
							</div>
							<DamageBar pct={row.pct} className='h-1.5' />
						</div>
					);
				})}
				</div>

				{/* Summary card — rendered on top via order */}
				<div className='order-1 bg-white/[0.08] rounded-2xl p-4 border border-white/10 transition-all group overflow-hidden'>
					<h4 className='text-xs font-semibold text-white/50 uppercase mb-3 tracking-widest text-center'>
						Annual Summary ({currentYear})
					</h4>
					<div className='grid grid-cols-3 gap-2 text-center relative z-10'>
						<div>
							<p className='text-[10px] text-white/40 mb-1 font-medium'>
								Income
							</p>
							<p className='text-xs font-semibold text-emerald-400 tabular-nums'>
								₹{totalIncomeYear.toLocaleString('en-IN')}
							</p>
						</div>
						<div>
							<p className='text-[10px] text-white/40 mb-1 font-medium'>
								Spent
							</p>
							<p className='text-xs font-semibold text-red-400 tabular-nums'>
								₹{totalSpentYear.toLocaleString('en-IN')}
							</p>
						</div>
						<div>
							<p className='text-[10px] text-white/40 mb-1 font-medium'>
								Balance
							</p>
							<p
								className={`text-xs font-semibold tabular-nums ${
									anualBalance >= 0 ?
										'text-emerald-400'
									:	'text-red-400'
								}`}
							>
								₹
								{Math.abs(anualBalance).toLocaleString('en-IN')}
							</p>
						</div>
					</div>
					<div className='mt-4 px-2'>
						<div className='flex items-center justify-between text-[10px] text-white/40 mb-1 font-semibold italic uppercase tracking-tighter'>
							<span>Annual Damage</span>
							<span>{anualDamage}%</span>
						</div>
						<DamageBar pct={anualDamage} className='h-2' />
					</div>
				</div>
			</div>

			{/* Desktop table — fixed height, scrollable, header + aggregate pinned */}
			<div className='hidden md:block overflow-x-auto overflow-y-auto max-h-92 rounded-2xl border border-white/[0.06] bg-[#1a191e]'>
				<table className='w-full text-sm text-left table-auto'>
					<thead className='sticky top-0 z-20 bg-[#141317] text-white/40 uppercase text-xs font-semibold'>
						<tr>
							<th className='px-6 py-4'>Month</th>
							<th className='px-6 py-4 text-right'>Income</th>
							<th className='px-6 py-4 text-right'>Spent</th>
							<th className='px-6 py-4 text-right'>Balance</th>
							<th className='px-6 py-4'>Damage %</th>
						</tr>
					</thead>
					<tbody className='sticky top-12 z-10 font-semibold bg-[#141317]'>
						<tr>
							<td className='px-6 py-4 text-white uppercase text-[10px] tracking-wider'>
								Yearly Aggregate ({currentYear})
							</td>
							<td className='px-6 py-4 text-right text-emerald-400 tabular-nums text-base'>
								₹{totalIncomeYear.toLocaleString('en-IN')}
							</td>
							<td className='px-6 py-4 text-right text-red-400 tabular-nums text-base'>
								₹{totalSpentYear.toLocaleString('en-IN')}
							</td>
							<td
								className={`px-6 py-4 text-right tabular-nums text-base ${
									anualBalance >= 0 ?
										'text-emerald-400'
									:	'text-red-400'
								}`}
							>
								{anualBalance >= 0 ? '+' : ''}₹
								{anualBalance.toLocaleString('en-IN')}
							</td>
							<td className='px-6 py-4'>
								<div className='flex items-center gap-2'>
									<DamageBar
										pct={anualDamage}
										className='flex-1 min-w-15 h-2.5'
									/>
									<span className='text-xs font-semibold text-white/80 uppercase tabular-nums'>
										{anualDamage}%
									</span>
								</div>
							</td>
						</tr>
					</tbody>
					<tbody className='divide-y divide-white/[0.05]'>
						{data.map((row) => {
							return (
								<tr
									key={row.key}
									className='hover:bg-white/[0.03] transition-colors'
								>
									<td className='px-6 py-4 font-semibold text-white/80'>
										{row.month}
									</td>
									<td className='px-6 py-4 text-right font-semibold text-emerald-400 tabular-nums whitespace-nowrap'>
										₹{row.income.toLocaleString('en-IN')}
									</td>
									<td className='px-6 py-4 text-right font-semibold text-red-400 tabular-nums whitespace-nowrap'>
										₹{row.expense.toLocaleString('en-IN')}
									</td>
									<td
										className={`px-6 py-4 text-right font-semibold tabular-nums whitespace-nowrap ${
											row.balance >= 0 ?
												'text-emerald-400'
											:	'text-red-400'
										}`}
									>
										{row.balance >= 0 ? '+' : ''}₹
										{row.balance.toLocaleString('en-IN')}
									</td>
									<td className='px-6 py-4 min-w-30'>
										<div className='flex items-center gap-2'>
											<DamageBar
												pct={row.pct}
												className='flex-1 min-w-15 h-2'
											/>
											<span className='text-xs font-medium text-white/50 tabular-nums w-10'>
												{row.pct}%
											</span>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
}
