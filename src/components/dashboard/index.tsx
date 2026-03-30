'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';

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
	const [filterMonth, setFilterMonth] = useState<string>('all');

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

	const incomes = data?.incomes || [];
	const expenses = data?.expenses || [];

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
			refetch();
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
		totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : '0';

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
					<div className='flex items-center gap-4'>
						<button
							onClick={() => {
								setModalType('income');
								setEditItem(null);
								setModalOpen(true);
							}}
							className='bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors shadow-sm'
						>
							<Plus
								size={18}
								className='text-emerald-500'
							/>
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

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10'>
					<StatCard
						title='Brief Joy (Income)'
						amount={`₹${totalIncome.toLocaleString()}`}
						type='income'
						icon={
							<ArrowUpRight
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
							<ArrowDownRight
								size={20}
								className='text-fuchsia-500'
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
							{loading ?
								<ChartSkeleton />
							:	<TrendChart expenses={expenses} />}
						</div>
					</div>

					<div className='bg-fuchsia-50/60 backdrop-blur-xl dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/20 rounded-3xl p-4 sm:p-6 min-h-100 shadow-sm flex flex-col'>
						<h3 className='text-lg font-semibold mb-6 text-slate-800 dark:text-slate-200'>
							Categories
						</h3>
						<div className='flex-1 relative'>
							{loading ?
								<ChartSkeleton />
							:	<CategoriesChart expenses={expenses} />}
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

				<AddTransactionModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					type={modalType}
					userId={userId}
					onSuccess={refetch}
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
		: type === 'expense' ? 'text-fuchsia-600 dark:text-fuchsia-400'
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

function ChartSkeleton() {
	return (
		<div className='w-full h-full flex items-center justify-center'>
			<div className='w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin' />
		</div>
	);
}
