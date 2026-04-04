'use client';

import { useState, useMemo } from 'react';
import { Session } from 'next-auth';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
	Plus,
	ArrowUpRight,
	ArrowDownLeft,
	Phone,
	Trash2,
	ChevronRight,
	ChevronLeft,
	Users,
	Pencil,
	Star,
} from 'lucide-react';

import AddAccountModal from './AddAccountModal';
import AddEntryModal from './AddEntryModal';
import ConfirmModal from '../ConfirmModal';
import { LedgerAccount, LedgerEntry } from '@/types';

export default function Ledger({ session }: { session: Session }) {
	const queryClient = useQueryClient();
	const [accountModalOpen, setAccountModalOpen] = useState(false);
	const [editAccount, setEditAccount] = useState<LedgerAccount | null>(null);
	const [entryModalOpen, setEntryModalOpen] = useState(false);
	const [editEntry, setEditEntry] = useState<LedgerEntry | null>(null);
	const [selectedAccount, setSelectedAccount] =
		useState<LedgerAccount | null>(null);
	const [starLoading, setStarLoading] = useState<number | null>(null);
	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		id: number | null;
		type: 'account' | 'entry';
	}>({ isOpen: false, id: null, type: 'account' });

	const { data, isLoading } = useQuery({
		queryKey: ['ledger'],
		queryFn: async () => {
			const res = await fetch('/api/ledger');
			if (!res.ok) throw new Error('Failed to fetch');
			return res.json() as Promise<{
				accounts: LedgerAccount[];
				entries: LedgerEntry[];
			}>;
		},
		refetchInterval: 5000,
	});

	const accounts = data?.accounts || [];
	const allEntries = data?.entries || [];

	const accountEntries = useMemo(() => {
		if (!selectedAccount) return [];
		return allEntries
			.filter((e) => e.ledger_id === selectedAccount.id)
			.sort((a, b) => {
				if (a.starred && !b.starred) return -1;
				if (!a.starred && b.starred) return 1;
				return new Date(b.date).getTime() - new Date(a.date).getTime();
			});
	}, [selectedAccount, allEntries]);

	const toggleStar = async (entryId: number) => {
		setStarLoading(entryId);
		toast.loading('Please Wait !', { duration: 1500 });
		try {
			const res = await fetch('/api/ledger', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'toggle_star', id: entryId }),
			});
			if (!res.ok) {
				const data = await res.json();
				toast.error(data.message || 'Failed to toggle star');
				return;
			}
			queryClient.invalidateQueries({ queryKey: ['ledger'] });
		} catch {
			toast.error('Something went wrong');
		} finally {
			setStarLoading(null);
		}
	};

	const getAccountBalance = (accountId: number) => {
		const entries = allEntries.filter((e) => e.ledger_id === accountId);
		let balance = 0;
		for (const entry of entries) {
			if (entry.type === 'give') balance -= entry.amount;
			else balance += entry.amount;
		}
		return balance;
	};

	const handleDelete = async () => {
		if (!confirmModal.id) return;
		const toastId = toast.loading('Deleting...');
		try {
			const res = await fetch(
				`/api/ledger?id=${confirmModal.id}&type=${confirmModal.type}`,
				{ method: 'DELETE' },
			);
			if (!res.ok) throw new Error('Failed to delete');
			toast.success('Deleted!', { id: toastId });

			if (
				confirmModal.type === 'account' &&
				selectedAccount?.id === confirmModal.id
			) {
				setSelectedAccount(null);
			}

			queryClient.invalidateQueries({ queryKey: ['ledger'] });
		} catch {
			toast.error('Something went wrong', { id: toastId });
		} finally {
			setConfirmModal({ isOpen: false, id: null, type: 'account' });
		}
	};

	const openAddAccount = () => {
		setEditAccount(null);
		setAccountModalOpen(true);
	};

	const openEditAccount = (account: LedgerAccount, e: React.MouseEvent) => {
		e.stopPropagation();
		setEditAccount(account);
		setAccountModalOpen(true);
	};

	const openAddEntry = () => {
		setEditEntry(null);
		setEntryModalOpen(true);
	};

	const openEditEntry = (entry: LedgerEntry) => {
		setEditEntry(entry);
		setEntryModalOpen(true);
	};

	if (isLoading) {
		const shimmer = 'animate-pulse bg-slate-200/80 dark:bg-slate-700/50 rounded-xl';
		return (
			<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
				<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					{/* Header skeleton */}
					<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
						<div>
							<div className={`${shimmer} h-8 w-28 mb-2`} />
							<div className={`${shimmer} h-4 w-64`} />
						</div>
						<div className={`${shimmer} h-11 w-36`} />
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						{/* Accounts panel skeleton */}
						<div className='lg:col-span-1 bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-4 sm:p-5 shadow-sm h-[70vh]'>
							<div className={`${shimmer} h-4 w-24 mb-4`} />
							<div className='space-y-2'>
								{[...Array(6)].map((_, i) => (
									<div key={i} className='p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-violet-100 dark:border-violet-800/30'>
										<div className='flex items-center justify-between'>
											<div className='flex-1'>
												<div className={`${shimmer} h-4 w-28 mb-1.5`} />
												<div className={`${shimmer} h-3 w-20`} />
											</div>
											<div className={`${shimmer} h-5 w-16`} />
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Entries panel skeleton */}
						<div className='lg:col-span-2 bg-fuchsia-50/60 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/20 rounded-3xl p-4 sm:p-6 shadow-sm h-[70vh]'>
							{/* Header */}
							<div className='flex items-center justify-between mb-5'>
								<div>
									<div className={`${shimmer} h-5 w-32 mb-1.5`} />
									<div className={`${shimmer} h-3 w-24`} />
								</div>
								<div className='flex gap-2'>
									<div className={`${shimmer} h-9 w-9`} />
									<div className={`${shimmer} h-9 w-24`} />
									<div className={`${shimmer} h-9 w-9`} />
								</div>
							</div>
							{/* Balance card */}
							<div className='mb-5 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-fuchsia-100 dark:border-fuchsia-800/30'>
								<div className={`${shimmer} h-3 w-16 mb-2`} />
								<div className={`${shimmer} h-8 w-28`} />
							</div>
							{/* Table rows */}
							<div className='space-y-3'>
								{[...Array(5)].map((_, i) => (
									<div key={i} className='flex items-center gap-4 p-3.5 bg-white/50 dark:bg-slate-900/30 rounded-2xl'>
										<div className={`${shimmer} h-6 w-20 rounded-lg`} />
										<div className={`${shimmer} h-4 w-28`} />
										<div className='flex-1' />
										<div className={`${shimmer} h-4 w-24`} />
										<div className={`${shimmer} h-4 w-20`} />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Same outer wrapper as Dashboard */}
			<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
				<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					{/* Header — matches Dashboard header */}
					<header className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
						<div>
							<h1 className='text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'>
								Ledger
							</h1>
							<p className='text-slate-500 dark:text-slate-400 mt-1'>
								Track money you give & take from people
							</p>
						</div>
						<div className='flex items-center gap-3'>
							<button
								onClick={openAddAccount}
								className='bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all'
							>
								<Plus size={18} />
								<span>Add Account</span>
							</button>
						</div>
					</header>

					{accounts.length === 0 ?
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-12 shadow-sm text-center'
						>
							<Users
								className='mx-auto text-slate-300 dark:text-slate-600 mb-4'
								size={48}
							/>
							<p className='text-slate-500 dark:text-slate-400 text-lg font-medium'>
								No accounts yet
							</p>
							<p className='text-slate-400 dark:text-slate-500 text-sm mt-1'>
								Add an account to start tracking
							</p>
						</motion.div>
					:	<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10'>
							{/* Accounts Panel */}
							<div className='lg:col-span-1 bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-4 sm:p-5 shadow-sm h-[42vh] sm:h-[70vh] flex flex-col'>
								<h3 className='text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4 px-1 shrink-0'>
									Accounts ({accounts.length})
								</h3>
								<div className='space-y-2 overflow-y-auto flex-1 pr-1'>
									{accounts.map((account) => {
										const balance = getAccountBalance(
											account.id,
										);
										const isSelected =
											selectedAccount?.id === account.id;
										return (
											<motion.div
												key={account.id}
												whileTap={{ scale: 0.98 }}
												onClick={() =>
													setSelectedAccount(account)
												}
												className={`p-3.5 rounded-2xl border cursor-pointer transition-all group relative overflow-hidden ${
													isSelected ?
														'bg-white dark:bg-slate-800/80 border-violet-300 dark:border-violet-700 shadow-md shadow-violet-500/10'
													:	'bg-white/70 dark:bg-slate-900/50 border-violet-100 dark:border-violet-800/30 hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-sm'
												}`}
											>
												<div className='absolute -inset-2 bg-linear-to-r from-transparent via-white/40 to-transparent dark:via-white/5 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none' />
												<div className='flex items-center justify-between relative z-10'>
													<div className='flex-1 min-w-0'>
														<p className='font-semibold text-slate-900 dark:text-white truncate text-sm'>
															{account.name}
														</p>
														{account.contact_number && (
															<p className='text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5'>
																<Phone
																	size={9}
																/>
																{
																	account.contact_number
																}
															</p>
														)}
													</div>
													<div className='flex items-center gap-2'>
														<button
															onClick={(e) =>
																openEditAccount(
																	account,
																	e,
																)
															}
															className='p-1.5 text-slate-300 hover:text-violet-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100'
														>
															<Pencil size={13} />
														</button>
														<span
															className={`text-sm font-bold tabular-nums ${
																balance >= 0 ?
																	'text-emerald-600 dark:text-emerald-400'
																:	'text-rose-600 dark:text-rose-400'
															}`}
														>
															{balance >= 0 ?
																'+'
															:	'-'}
															₹
															{Math.abs(
																balance,
															).toLocaleString()}
														</span>
														<ChevronRight
															size={14}
															className='text-slate-400'
														/>
													</div>
												</div>
											</motion.div>
										);
									})}
								</div>
							</div>

							{/* Entries Panel */}
							<div className='lg:col-span-2 bg-fuchsia-50/60 backdrop-blur-xl dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/20 rounded-3xl p-4 sm:p-6 shadow-sm h-[70vh] flex flex-col'>
								{selectedAccount ?
									<div className='flex flex-col h-full'>
										{/* Account header */}
										<div className='flex items-center justify-between mb-5'>
											<div className='flex items-center gap-3'>
												<button
													onClick={() =>
														setSelectedAccount(null)
													}
													className='lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors'
												>
													<ChevronLeft size={18} />
												</button>
												<div>
													<h2 className='text-lg font-bold text-slate-900 dark:text-white'>
														{selectedAccount.name}
													</h2>
													{selectedAccount.contact_number && (
														<p className='text-xs text-slate-400 flex items-center gap-1'>
															<Phone size={10} />
															{
																selectedAccount.contact_number
															}
														</p>
													)}
												</div>
											</div>
											<div className='flex items-center gap-2'>
												<button
													onClick={(e) =>
														openEditAccount(
															selectedAccount,
															e,
														)
													}
													className='p-2 text-slate-400 hover:text-violet-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors'
												>
													<Pencil size={16} />
												</button>
												<button
													onClick={openAddEntry}
													className='bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all'
												>
													<Plus
														size={14}
														strokeWidth={2.5}
													/>
													<span className='hidden sm:block'>
														Add Entry
													</span>
												</button>
												<button
													onClick={() =>
														setConfirmModal({
															isOpen: true,
															id: selectedAccount.id,
															type: 'account',
														})
													}
													className='p-2 text-rose-400 hover:text-rose-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors'
												>
													<Trash2 size={16} />
												</button>
											</div>
										</div>

										{/* Balance Card */}
										{(() => {
											const balance = getAccountBalance(
												selectedAccount.id,
											);
											return (
												<div className='mb-5 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-fuchsia-100 dark:border-fuchsia-800/30'>
													<div className='flex items-center justify-between'>
														<div>
															<p className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>
																Balance
															</p>
															<p
																className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
															>
																{balance >= 0 ?
																	'+'
																:	'-'}
																₹
																{Math.abs(
																	balance,
																).toLocaleString()}
															</p>
														</div>
														<p className='text-xs text-slate-400 dark:text-slate-500 text-right max-w-[150px]'>
															{balance > 0 ?
																`${selectedAccount.name} owes you`
															: balance < 0 ?
																`You owe ${selectedAccount.name}`
															:	'All settled up!'}
														</p>
													</div>
												</div>
											);
										})()}

										{/* Entries List */}
										<div className='flex-1 overflow-y-auto'>
											{accountEntries.length === 0 ?
												<div className='text-center py-16'>
													<p className='text-slate-400 dark:text-slate-500 font-medium'>
														No entries yet
													</p>
													<p className='text-slate-300 dark:text-slate-600 text-sm mt-1'>
														Add an entry to get
														started
													</p>
												</div>
											:	<>
													{/* Desktop Table */}
													<div className='hidden md:block overflow-x-auto rounded-xl border border-fuchsia-100 dark:border-fuchsia-800/30 bg-white/40 dark:bg-slate-950/40'>
														<table className='w-full text-sm text-left table-auto'>
															<thead className='bg-fuchsia-100/50 dark:bg-fuchsia-800/20 border-b border-fuchsia-100 dark:border-fuchsia-800/30 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold'>
																<tr>
																	<th className='px-5 py-3.5'>
																		Type
																	</th>
																	<th className='px-5 py-3.5'>
																		Description
																	</th>
																	<th className='px-5 py-3.5'>
																		Date &
																		Time
																	</th>
																	<th className='px-5 py-3.5 text-right'>
																		Amount
																	</th>
																	<th className='px-5 py-3.5 w-20'></th>
																</tr>
															</thead>
															<tbody className='divide-y divide-fuchsia-200/50 dark:divide-fuchsia-800/30 bg-white/20 dark:bg-slate-900/20'>
																{accountEntries.map(
																	(entry) => (
																		<tr
																			key={
																				entry.id
																			}
																			className='hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors group/row'
																		>
																			<td className='px-5 py-3.5'>
																				<div
																					className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
																						(
																							entry.type ===
																							'give'
																						) ?
																							'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
																						:	'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
																					}`}
																				>
																					{(
																						entry.type ===
																						'give'
																					) ?
																						<ArrowUpRight
																							size={
																								12
																							}
																							strokeWidth={
																								2.5
																							}
																						/>
																					:	<ArrowDownLeft
																							size={
																								12
																							}
																							strokeWidth={
																								2.5
																							}
																						/>
																					}
																					{(
																						entry.type ===
																						'give'
																					) ?
																						'You Gave'
																					:	'You Got'
																					}
																				</div>
																			</td>
																			<td className='px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200'>
																				{entry.description ||
																					'-'}
																			</td>
																			<td className='px-5 py-3.5 text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap'>
																				<div>
																					{new Date(
																						entry.date,
																					).toLocaleDateString(
																						'en-IN',
																						{
																							day: 'numeric',
																							month: 'short',
																							year: 'numeric',
																						},
																					)}
																				</div>
																				<div className='text-[11px] text-slate-400 dark:text-slate-500'>
																					{new Date(
																						entry.date,
																					).toLocaleTimeString(
																						'en-IN',
																						{
																							hour: 'numeric',
																							minute: '2-digit',
																							hour12: true,
																						},
																					)}
																				</div>
																			</td>
																			<td
																				className={`px-5 py-3.5 text-right font-bold tabular-nums whitespace-nowrap ${
																					(
																						entry.type ===
																						'give'
																					) ?
																						'text-rose-600 dark:text-rose-400'
																					:	'text-emerald-600 dark:text-emerald-400'
																				}`}
																			>
																				{(
																					entry.type ===
																					'give'
																				) ?
																					'-'
																				:	'+'
																				}
																				₹
																				{Number(
																					entry.amount,
																				).toLocaleString()}
																			</td>
																			<td className='px-5 py-3.5'>
																				<div className='flex items-center gap-1'>
																					<button
																						onClick={() =>
																							toggleStar(
																								entry.id,
																							)
																						}
																						className={`p-1.5 rounded-lg transition-colors ${
																							(
																								entry.starred
																							) ?
																								'text-amber-400'
																							:	'text-slate-300 hover:text-amber-400 opacity-0 group-hover/row:opacity-100'
																						}`}
																					>
																						<Star
																							size={
																								14
																							}
																							fill={
																								(
																									entry.starred
																								) ?
																									'currentColor'
																								:	'none'
																							}
																						/>
																					</button>
																					<button
																						onClick={() =>
																							openEditEntry(
																								entry,
																							)
																						}
																						className='p-1.5 text-slate-300 hover:text-violet-500 rounded-lg transition-colors opacity-0 group-hover/row:opacity-100'
																					>
																						<Pencil
																							size={
																								14
																							}
																						/>
																					</button>
																					<button
																						onClick={() =>
																							setConfirmModal(
																								{
																									isOpen: true,
																									id: entry.id,
																									type: 'entry',
																								},
																							)
																						}
																						className='p-1.5 text-slate-300 hover:text-rose-400 rounded-lg transition-colors opacity-0 group-hover/row:opacity-100'
																					>
																						<Trash2
																							size={
																								14
																							}
																						/>
																					</button>
																				</div>
																			</td>
																		</tr>
																	),
																)}
															</tbody>
														</table>
													</div>

													{/* Mobile Cards */}
													<div className='md:hidden space-y-2'>
														{accountEntries.map(
															(entry) => (
																<motion.div
																	key={
																		entry.id
																	}
																	initial={{
																		opacity: 0,
																		y: 10,
																	}}
																	animate={{
																		opacity: 1,
																		y: 0,
																	}}
																	className='p-4 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-fuchsia-100 dark:border-fuchsia-800/30 shadow-sm'
																>
																	<div className='flex items-center justify-between mb-2'>
																		<div
																			className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
																				(
																					entry.type ===
																					'give'
																				) ?
																					'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
																				:	'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
																			}`}
																		>
																			{(
																				entry.type ===
																				'give'
																			) ?
																				<ArrowUpRight
																					size={
																						12
																					}
																					strokeWidth={
																						2.5
																					}
																				/>
																			:	<ArrowDownLeft
																					size={
																						12
																					}
																					strokeWidth={
																						2.5
																					}
																				/>
																			}
																			{(
																				entry.type ===
																				'give'
																			) ?
																				'You Gave'
																			:	'You Got'
																			}
																		</div>
																		<span
																			className={`font-bold text-sm tabular-nums ${
																				(
																					entry.type ===
																					'give'
																				) ?
																					'text-rose-600 dark:text-rose-400'
																				:	'text-emerald-600 dark:text-emerald-400'
																			}`}
																		>
																			{(
																				entry.type ===
																				'give'
																			) ?
																				'-'
																			:	'+'
																			}
																			₹
																			{Number(
																				entry.amount,
																			).toLocaleString()}
																		</span>
																	</div>
																	<div className='flex items-center justify-between'>
																		<div>
																			<p className='font-medium text-slate-800 dark:text-slate-200 text-sm'>
																				{entry.description ||
																					'-'}
																			</p>
																			<p className='text-[11px] text-slate-400 dark:text-slate-500 mt-0.5'>
																				{new Date(
																					entry.date,
																				).toLocaleDateString(
																					'en-IN',
																					{
																						day: 'numeric',
																						month: 'short',
																						year: 'numeric',
																					},
																				)}{' '}
																				{new Date(
																					entry.date,
																				).toLocaleTimeString(
																					'en-IN',
																					{
																						hour: 'numeric',
																						minute: '2-digit',
																						hour12: true,
																					},
																				)}
																			</p>
																		</div>
																		<div className='flex items-center gap-1'>
																			<button
																				onClick={() =>
																					toggleStar(
																						entry.id,
																					)
																				}
																				className={`p-1.5 rounded-lg transition-colors ${
																					(
																						entry.starred
																					) ?
																						'text-amber-400'
																					:	'text-slate-300 hover:text-amber-400'
																				}`}
																			>
																				<Star
																					size={
																						14
																					}
																					fill={
																						(
																							entry.starred
																						) ?
																							'currentColor'
																						:	'none'
																					}
																				/>
																			</button>
																			<button
																				onClick={() =>
																					openEditEntry(
																						entry,
																					)
																				}
																				className='p-1.5 text-slate-300 hover:text-violet-500 rounded-lg transition-colors'
																			>
																				<Pencil
																					size={
																						14
																					}
																				/>
																			</button>
																			<button
																				onClick={() =>
																					setConfirmModal(
																						{
																							isOpen: true,
																							id: entry.id,
																							type: 'entry',
																						},
																					)
																				}
																				className='p-1.5 text-slate-300 hover:text-rose-400 rounded-lg transition-colors'
																			>
																				<Trash2
																					size={
																						14
																					}
																				/>
																			</button>
																		</div>
																	</div>
																</motion.div>
															),
														)}
													</div>
												</>
											}
										</div>
									</div>
								:	<div className='flex items-center justify-center h-full min-h-[400px] text-slate-400 dark:text-slate-500'>
										<div className='text-center'>
											{/* Animated doodle figure */}
											<motion.div
												className='relative w-32 h-32 mx-auto mb-6'
												animate={{ y: [0, -8, 0] }}
												transition={{
													duration: 3,
													repeat: Infinity,
													ease: 'easeInOut',
												}}
											>
												{/* Clipboard body */}
												<svg
													viewBox='0 0 120 120'
													className='w-full h-full'
													fill='none'
													xmlns='http://www.w3.org/2000/svg'
												>
													{/* Clipboard */}
													<rect
														x='25'
														y='20'
														width='70'
														height='85'
														rx='8'
														className='fill-violet-100 dark:fill-violet-800/30 stroke-violet-300 dark:stroke-violet-700'
														strokeWidth='2'
													/>
													<rect
														x='40'
														y='12'
														width='40'
														height='14'
														rx='4'
														className='fill-violet-200 dark:fill-violet-700/40 stroke-violet-300 dark:stroke-violet-700'
														strokeWidth='2'
													/>
													{/* Lines on clipboard */}
													<motion.line
														x1='38'
														y1='45'
														x2='82'
														y2='45'
														className='stroke-violet-300 dark:stroke-violet-600'
														strokeWidth='2'
														strokeLinecap='round'
														animate={{
															opacity: [
																0.3, 1, 0.3,
															],
														}}
														transition={{
															duration: 2,
															repeat: Infinity,
															delay: 0,
														}}
													/>
													<motion.line
														x1='38'
														y1='58'
														x2='72'
														y2='58'
														className='stroke-violet-300 dark:stroke-violet-600'
														strokeWidth='2'
														strokeLinecap='round'
														animate={{
															opacity: [
																0.3, 1, 0.3,
															],
														}}
														transition={{
															duration: 2,
															repeat: Infinity,
															delay: 0.3,
														}}
													/>
													<motion.line
														x1='38'
														y1='71'
														x2='78'
														y2='71'
														className='stroke-violet-300 dark:stroke-violet-600'
														strokeWidth='2'
														strokeLinecap='round'
														animate={{
															opacity: [
																0.3, 1, 0.3,
															],
														}}
														transition={{
															duration: 2,
															repeat: Infinity,
															delay: 0.6,
														}}
													/>
													{/* Pencil */}
													<motion.g
														animate={{
															rotate: [-5, 5, -5],
															x: [0, 2, 0],
														}}
														transition={{
															duration: 1.5,
															repeat: Infinity,
															ease: 'easeInOut',
														}}
														style={{
															transformOrigin:
																'95px 30px',
														}}
													>
														<rect
															x='88'
															y='18'
															width='6'
															height='30'
															rx='2'
															className='fill-fuchsia-300 dark:fill-fuchsia-600'
														/>
														<polygon
															points='88,48 94,48 91,56'
															className='fill-fuchsia-400 dark:fill-fuchsia-500'
														/>
														<rect
															x='88'
															y='18'
															width='6'
															height='6'
															rx='1'
															className='fill-fuchsia-200 dark:fill-fuchsia-400'
														/>
													</motion.g>
												</svg>
											</motion.div>
											<p className='font-semibold text-slate-500 dark:text-slate-400 text-base'>
												Pick someone from the left
											</p>
											<p className='text-sm text-slate-400 dark:text-slate-500 mt-1'>
												Their entries will show up right
												here
											</p>
										</div>
									</div>
								}
							</div>
						</div>
					}
				</div>
			</div>

			<AddAccountModal
				isOpen={accountModalOpen}
				onClose={() => {
					setAccountModalOpen(false);
					setEditAccount(null);
				}}
				editAccount={editAccount}
			/>

			{selectedAccount && (
				<AddEntryModal
					isOpen={entryModalOpen}
					onClose={() => {
						setEntryModalOpen(false);
						setEditEntry(null);
					}}
					account={selectedAccount}
					editEntry={editEntry}
				/>
			)}

			<ConfirmModal
				isOpen={confirmModal.isOpen}
				onClose={() =>
					setConfirmModal({
						isOpen: false,
						id: null,
						type: 'account',
					})
				}
				onConfirm={handleDelete}
				title={
					confirmModal.type === 'account' ?
						'Delete Account'
					:	'Delete Entry'
				}
				message={
					confirmModal.type === 'account' ?
						'This will delete the account and all its entries. This cannot be undone.'
					:	'This entry will be permanently deleted.'
				}
				confirmLabel='Delete'
				isDanger
			/>
		</>
	);
}
