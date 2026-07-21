/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
	Plus,
	ArrowUpRight,
	ArrowDownLeft,
	Phone,
	Trash2,
	ChevronLeft,
	Users,
	Pencil,
	Star,
	BookOpen,
} from 'lucide-react';

import AddLedgerModal from './AddLedgerModal';
import AddAccountModal from './AddAccountModal';
import AddEntryModal from './AddEntryModal';
import ConfirmModal from '../ConfirmModal';
import LedgerBooks from './LedgerBooks';
import {
	EntriesSkeletonLoading,
	LedgerSkeletonMainLoading,
	LedgerAccountsSkeletonLoading,
} from './skeleton';

import { useLedger } from '@/hooks/useLedger';
import { useLedgerEntries } from '@/hooks/useLedgerEntries';
import { useToggleStar } from '@/hooks/useToggleStar';

import { LedgerBook, LedgerAccount, LedgerEntry } from '@/types';
import { NotesDoddle } from '../../../public/ledger/svgs';
import Button from '../ui/Button';

export default function Ledger() {
	const queryClient = useQueryClient();

	// Navigation state
	const [selectedBook, setSelectedBook] = useState<LedgerBook | null>(null);
	const [selectedAccount, setSelectedAccount] =
		useState<LedgerAccount | null>(null);
	const [entriesPage, setEntriesPage] = useState(1);

	// Modal states
	const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
	const [editLedger, setEditLedger] = useState<LedgerBook | null>(null);
	const [accountModalOpen, setAccountModalOpen] = useState(false);
	const [editAccount, setEditAccount] = useState<LedgerAccount | null>(null);
	const [entryModalOpen, setEntryModalOpen] = useState(false);
	const [editEntry, setEditEntry] = useState<LedgerEntry | null>(null);

	const desktopScrollRef = useRef<HTMLDivElement | null>(null);
	const desktopSentinelRef = useRef<HTMLDivElement | null>(null);
	const mobileScrollRef = useRef<HTMLDivElement | null>(null);
	const mobileSentinelRef = useRef<HTMLDivElement | null>(null);
	const loadingMoreRef = useRef(false);

	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		id: number | null;
		type: 'book' | 'account' | 'entry';
	}>({ isOpen: false, id: null, type: 'book' });

	// Books + accounts query
	const { data, books, accounts, isLoading } = useLedger(selectedBook?.id);

	const {
		entries,
		balance,
		isLoading: entriesLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useLedgerEntries(selectedAccount?.id);

	const toggleStarMutation = useToggleStar();

	useEffect(() => {
		if (!hasNextPage) return;

		const loadMore = () => {
			if (loadingMoreRef.current) return;
			loadingMoreRef.current = true;
			fetchNextPage().finally(() => {
				loadingMoreRef.current = false;
			});
		};

		const pairs = [
			[desktopScrollRef.current, desktopSentinelRef.current],
			[mobileScrollRef.current, mobileSentinelRef.current],
		] as const;

		const observers = pairs
			.filter(([root, target]) => root && target)
			.map(([root, target]) => {
				const observer = new IntersectionObserver(
					(entries) => {
						if (entries[0].isIntersecting && !isFetchingNextPage) {
							loadMore();
						}
					},
					{
						root,
						rootMargin: '150px',

						threshold: 0,
					},
				);
				observer.observe(target!);
				return observer;
			});

		return () => observers.forEach((o) => o.disconnect());
	}, [hasNextPage, fetchNextPage, isFetchingNextPage]);

	const toggleStar = (id: number) => {
		const toastId = toast.loading('Please Wait!');

		toggleStarMutation.mutate(id, {
			onSettled: () => toast.dismiss(toastId),
		});
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
				confirmModal.type === 'book' &&
				selectedBook?.id === confirmModal.id
			) {
				setSelectedBook(null);
				setSelectedAccount(null);
			}
			if (
				confirmModal.type === 'account' &&
				selectedAccount?.id === confirmModal.id
			) {
				setSelectedAccount(null);
			}
			if (confirmModal.type === 'entry') {
				// If we deleted the last item on this page, go back one page
				if (entries.length === 1 && entriesPage > 1) {
					setEntriesPage(entriesPage - 1);
				}
			}

			queryClient.invalidateQueries({ queryKey: ['ledger'] });
			queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
		} catch {
			toast.error('Something went wrong', { id: toastId });
		} finally {
			setConfirmModal({ isOpen: false, id: null, type: 'book' });
		}
	};

	const openEditEntry = (entry: LedgerEntry) => {
		setEditEntry(entry);
		setEntryModalOpen(true);
	};

	// ---------- Loading Skeleton ----------
	// Match the skeleton to the view being loaded: books grid when no book is
	// selected, the two-panel accounts layout when entering a book.
	if (isLoading && !data) {
		return selectedBook ?
				<LedgerAccountsSkeletonLoading />
			:	<LedgerSkeletonMainLoading />;
	}

	// ---------- LEDGER BOOKS VIEW (no book selected) ----------
	if (!selectedBook) {
		return (
			<>
				<LedgerBooks
					books={books}
					onCreate={() => {
						setEditLedger(null);
						setLedgerModalOpen(true);
					}}
					onSelect={(book) => {
						setSelectedBook(book);
						setSelectedAccount(null);
					}}
					onEdit={(book, e) => {
						e.stopPropagation();
						setEditLedger(book);
						setLedgerModalOpen(true);
					}}
					onDelete={(book, e) => {
						e.stopPropagation();
						setConfirmModal({
							isOpen: true,
							id: book.id,
							type: 'book',
						});
					}}
				/>

				<AddLedgerModal
					isOpen={ledgerModalOpen}
					onClose={() => {
						setLedgerModalOpen(false);
						setEditLedger(null);
					}}
					editLedger={editLedger}
				/>

				<ConfirmModal
					isOpen={confirmModal.isOpen}
					onClose={() =>
						setConfirmModal({
							isOpen: false,
							id: null,
							type: 'book',
						})
					}
					onConfirm={handleDelete}
					title='Delete Ledger'
					message='This will delete the ledger and all its accounts & entries. This cannot be undone.'
					confirmLabel='Delete'
					isDanger
				/>
			</>
		);
	}

	// ---------- ACCOUNTS + ENTRIES VIEW (book selected) ----------
	return (
		<>
			<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
				<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					{/* Header */}
					<motion.header
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						className='flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8'
					>
						<div className='flex items-start gap-3'>
							<Button
								onClick={() => {
									setSelectedBook(null);
									setSelectedAccount(null);
								}}
							>
								<ChevronLeft size={18} />
							</Button>
							<div>
								<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient flex items-center gap-2'>
									<BookOpen size={12} className='text-[#b9baf1]' />
									Ledger book
								</span>
								<h1 className='text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1.5'>
									{selectedBook.name}
								</h1>
								{selectedBook.description && (
									<p className='text-white/50 mt-1'>
										{selectedBook.description}
									</p>
								)}
							</div>
						</div>
						<div className='flex items-center gap-3'>
							{accounts.length > 0 && (
								<span className='hidden sm:inline-flex items-center gap-1.5 bg-white/6 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-white/50'>
									<Users size={12} />
									{accounts.length}{' '}
									{accounts.length === 1 ?
										'account'
									:	'accounts'}
								</span>
							)}
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								onClick={() => {
									setEditAccount(null);
									setAccountModalOpen(true);
								}}
								className='cursor-pointer bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors group/new'
							>
								<Plus
									size={18}
									className='transition-transform duration-300 group-hover/new:rotate-90'
								/>
								<span>Add Account</span>
							</motion.button>
						</div>
					</motion.header>

					{accounts.length === 0 ?
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='card-aurora rounded-3xl p-12 text-center'
						>
							<motion.div
								animate={{ y: [0, -8, 0] }}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: 'easeInOut',
								}}
								className='w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#d39dbd]/15 text-[#e7c1d8] flex items-center justify-center'
							>
								<Users size={28} />
							</motion.div>
							<p className='text-white text-xl font-semibold tracking-tight'>
								No accounts yet
							</p>
							<p className='text-white/40 text-sm mt-1.5 max-w-xs mx-auto'>
								Add friends &amp; family to start logging every
								give and take.
							</p>
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								onClick={() => {
									setEditAccount(null);
									setAccountModalOpen(true);
								}}
								className='mt-7 bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer'
							>
								<Plus size={16} />
								Add your first account
							</motion.button>
						</motion.div>
					:	<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10'>
							{/* Accounts Panel */}
							<div className='lg:col-span-1 card-aurora rounded-3xl p-4 sm:p-5 h-[42vh] sm:h-[70vh] flex flex-col'>
								<div className='flex items-center justify-between mb-4 px-1 shrink-0'>
									<h3 className='text-sm font-semibold text-white/50 uppercase tracking-wide'>
										Accounts ({accounts.length})
									</h3>
									<button
										onClick={() => {
											setEditAccount(null);
											setAccountModalOpen(true);
										}}
										className='p-1.5 text-white/40 hover:text-white bg-white/6 hover:bg-white/10 rounded-lg transition-colors cursor-pointer'
										title='Add account'
									>
										<Plus size={14} />
									</button>
								</div>
								<div className='overflow-y-auto flex-1 pr-1'>
									<div className='bg-[#1a191e] border border-white/6 rounded-2xl overflow-hidden divide-y divide-white/5'>
										{accounts.map((account) => {
											const isSelected =
												selectedAccount?.id ===
												account.id;
											return (
												<motion.div
													key={account.id}
													whileTap={{ scale: 0.98 }}
													onClick={() =>
														setSelectedAccount(
															account,
														)
													}
													className={`relative px-4 py-3 cursor-pointer transition-colors ${
														isSelected ?
															'bg-white/6 text-white'
														:	'hover:bg-white/3'
													}`}
												>
													{isSelected && (
														<motion.div
															initial={{
																opacity: 0,
															}}
															animate={{
																opacity: 1,
															}}
															transition={{
																duration: 0.15,
															}}
															className='absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#9294e5]'
														/>
													)}
													<div className='flex items-center gap-3'>
														<img
															src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(account.name)}`}
															alt={account.name}
															className={`w-9 h-9 rounded-xl bg-white/10 shrink-0 transition-all ${isSelected ? 'ring-2 ring-[#9294e5]/50' : ''}`}
														/>
														<div className='flex-1 min-w-0'>
															<p className='font-medium text-white/90 truncate text-sm'>
																{account.name}
															</p>
															{account.contact_number && (
																<p className='text-[11px] text-white/40 flex items-center gap-1 mt-0.5'>
																	<Phone
																		size={9}
																	/>
																	{
																		account.contact_number
																	}
																</p>
															)}
														</div>
														<p
															className={`text-sm font-semibold ${
																(
																	account.balance >=
																	0
																) ?
																	'text-emerald-400'
																:	'text-red-400'
															}`}
														>
															{(
																account.balance >=
																0
															) ?
																'+'
															:	'-'}
															₹
															{Math.abs(
																account.balance,
															).toLocaleString()}
														</p>
													</div>
												</motion.div>
											);
										})}
									</div>
								</div>
							</div>

							{/* Entries Panel */}
							<div className='lg:col-span-2 card-aurora rounded-3xl p-4 sm:p-6 h-[70vh] flex flex-col'>
								{selectedAccount ?
									<div className='flex flex-col h-full'>
										{/* Account header */}
										<div className='flex items-center justify-between mb-5 shrink-0'>
											<div className='flex items-center gap-3'>
												<button
													onClick={() =>
														setSelectedAccount(null)
													}
													className='lg:hidden p-2 text-white/50 hover:text-white bg-white/8 hover:bg-white/[0.14] border border-white/10 rounded-xl transition-colors'
												>
													<ChevronLeft size={18} />
												</button>
												<img
													src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(selectedAccount.name)}`}
													alt={selectedAccount.name}
													className='w-10 h-10 rounded-xl bg-white/10 shrink-0'
												/>
												<div>
													<h2 className='text-lg font-semibold text-white'>
														{selectedAccount.name}
													</h2>
													{selectedAccount.contact_number && (
														<p className='text-xs text-white/40 flex items-center gap-1'>
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
													onClick={() => {
														setEditEntry(null);
														setEntryModalOpen(true);
													}}
													className='cursor-pointer bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors'
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
													onClick={(e) => {
														e.stopPropagation();
														setEditAccount(
															selectedAccount,
														);
														setAccountModalOpen(
															true,
														);
													}}
													className='p-2 text-white/50 hover:text-white bg-white/8 border border-white/10 rounded-xl hover:bg-white/[0.14] transition-colors'
												>
													<Pencil size={16} />
												</button>
												<button
													onClick={() =>
														setConfirmModal({
															isOpen: true,
															id: selectedAccount.id,
															type: 'account',
														})
													}
													className='p-2 text-red-400 hover:text-red-300 bg-white/8 border border-white/10 rounded-xl hover:bg-red-500/10 transition-colors'
												>
													<Trash2 size={16} />
												</button>
											</div>
										</div>

										{/* Balance Card */}
										<div className='mb-5 p-5 card-ultra rounded-2xl shrink-0 relative overflow-hidden'>
											<div
												className={`absolute inset-0 pointer-events-none ${
													balance > 0 ?
														'bg-[radial-gradient(90%_120%_at_0%_0%,rgba(16,185,129,0.12),transparent_60%)]'
													: balance < 0 ?
														'bg-[radial-gradient(90%_120%_at_0%_0%,rgba(239,68,68,0.12),transparent_60%)]'
													:	''
												}`}
											/>
											<div className='relative flex items-center justify-between'>
												<div>
													<p className='text-xs font-semibold text-white/50 uppercase tracking-[0.15em]'>
														Balance
													</p>
													<motion.p
														key={balance}
														initial={{
															opacity: 0,
															y: 6,
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														className={`text-3xl font-semibold tracking-tight mt-1 tabular-nums ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
													>
														{balance >= 0 ?
															'+'
														:	'-'}
														₹
														{Math.abs(
															balance,
														).toLocaleString()}
													</motion.p>
												</div>
												<span
													className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
														balance > 0 ?
															'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
														: balance < 0 ?
															'text-red-400 bg-red-500/10 border-red-500/20'
														:	'text-white/50 bg-white/6 border-white/10'
													}`}
												>
													{balance > 0 ?
														`${selectedAccount.name} owes you`
													: balance < 0 ?
														`You owe ${selectedAccount.name}`
													:	'All settled up!'}
												</span>
											</div>
										</div>

										{/* Entries List */}
										<div className='flex-1 overflow-y-auto min-h-0'>
											{entriesLoading ?
												<EntriesSkeletonLoading />
											: entries.length === 0 ?
												<div className='text-center py-16'>
													<div className='w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#cbf1fd]/10 text-[#cbf1fd] flex items-center justify-center'>
														<Plus size={24} />
													</div>
													<p className='text-white/60 font-semibold'>
														No entries yet
													</p>
													<p className='text-white/35 text-sm mt-1'>
														Log the first give or
														take with{' '}
														{selectedAccount.name}
													</p>
													<button
														onClick={() => {
															setEditEntry(null);
															setEntryModalOpen(
																true,
															);
														}}
														className='mt-6 bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer'
													>
														<Plus size={14} />
														Add first entry
													</button>
												</div>
											:	<>
													{/* Desktop Table */}
													<div
														ref={desktopScrollRef}
														className='hidden md:block overflow-x-auto overflow-y-auto flex-1 min-h-0 rounded-2xl border border-white/6 bg-[#1a191e]'
													>
														<table className='w-full text-sm text-left table-auto'>
															<thead className='bg-[#141317] border-b border-white/5 text-white/40 uppercase text-xs font-semibold'>
																<tr>
																	<th className='px-5 py-3.5'>
																		Type
																	</th>
																	<th className='px-5 py-3.5'>
																		Description
																	</th>
																	<th className='px-5 py-3.5 text-nowrap'>
																		Date &
																		Time
																	</th>
																	<th className='px-5 py-3.5 text-right'>
																		Amount
																	</th>
																	<th className='px-5 py-3.5 w-20'>
																		Actions
																	</th>
																</tr>
															</thead>
															<tbody className='divide-y divide-white/5'>
																{entries.map(
																	(entry) => (
																		<tr
																			key={
																				entry.id
																			}
																			className='hover:bg-white/3 transition-colors group/row'
																		>
																			<td className='px-5 py-3.5'>
																				<div
																					className={`inline-flex text-nowrap items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
																						(
																							entry.type ===
																							'give'
																						) ?
																							'bg-red-500/10 text-red-400'
																						:	'bg-emerald-500/10 text-emerald-400'
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
																			<td className='px-5 py-3.5 font-medium text-white/80'>
																				{entry.description ||
																					'-'}
																			</td>
																			<td className='px-5 py-3.5 text-white/50 tabular-nums whitespace-nowrap'>
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
																				<div className='text-[11px] text-white/40'>
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
																				className={`px-5 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap ${
																					(
																						entry.type ===
																						'give'
																					) ?
																						'text-red-400'
																					:	'text-emerald-400'
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
																							:	'text-white/30 hover:text-amber-400'
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
																						className='p-1.5 text-white/30 hover:text-white rounded-lg transition-colors'
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
																						className='p-1.5 text-white/30 hover:text-red-400 rounded-lg transition-colors'
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
														<div
															ref={
																desktopSentinelRef
															}
															className='hidden md:flex justify-center py-4'
														>
															{isFetchingNextPage && (
																<div className='flex items-center gap-2 text-sm text-white/50'>
																	<div className='h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin' />
																	Loading
																	more...
																</div>
															)}
														</div>
													</div>

													{/* Mobile Cards */}
													<div
														ref={mobileScrollRef}
														className='md:hidden overflow-y-auto flex-1 min-h-0'
													>
														<div
															ref={
																mobileSentinelRef
															}
															className='bg-[#1a191e] border border-white/6 rounded-2xl overflow-hidden divide-y divide-white/5'
														>
															{entries.map(
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
																		className='px-4 py-3 transition-colors hover:bg-white/3'
																	>
																		<div className='flex items-center justify-between mb-2'>
																			<div
																				className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
																					(
																						entry.type ===
																						'give'
																					) ?
																						'bg-red-500/10 text-red-400'
																					:	'bg-emerald-500/10 text-emerald-400'
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
																				className={`font-semibold text-sm tabular-nums ${
																					(
																						entry.type ===
																						'give'
																					) ?
																						'text-red-400'
																					:	'text-emerald-400'
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
																				<p className='font-medium text-white/80 text-sm'>
																					{entry.description ||
																						'-'}
																				</p>
																				<p className='text-[11px] text-white/40 mt-0.5'>
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
																						:	'text-white/30 hover:text-amber-400'
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
																					className='p-1.5 text-white/30 hover:text-white rounded-lg transition-colors'
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
																					className='p-1.5 text-white/30 hover:text-red-400 rounded-lg transition-colors'
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
													</div>
												</>
											}
											<div
												ref={desktopSentinelRef}
												className='flex md:hidden justify-center py-4'
											>
												{isFetchingNextPage && (
													<div className='flex items-center gap-2 text-sm text-white/50'>
														<div className='h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin' />
														Loading more...
													</div>
												)}
											</div>
										</div>

										{/* Pagination */}
									</div>
								:	<div className='flex items-center justify-center h-full min-h-100 text-white/40'>
										<div className='text-center'>
											<motion.div
												className='relative w-32 h-32 mx-auto mb-6'
												animate={{ y: [0, -8, 0] }}
												transition={{
													duration: 3,
													repeat: Infinity,
													ease: 'easeInOut',
												}}
											>
												<NotesDoddle />
											</motion.div>
											<p className='font-semibold text-white/50 text-base'>
												Pick someone from the left
											</p>
											<p className='text-sm text-white/40 mt-1'>
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

			<AddLedgerModal
				isOpen={ledgerModalOpen}
				onClose={() => {
					setLedgerModalOpen(false);
					setEditLedger(null);
				}}
				editLedger={editLedger}
			/>

			<AddAccountModal
				isOpen={accountModalOpen}
				onClose={() => {
					setAccountModalOpen(false);
					setEditAccount(null);
				}}
				editAccount={editAccount}
				ledgerBookId={selectedBook.id}
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
					setConfirmModal({ isOpen: false, id: null, type: 'book' })
				}
				onConfirm={handleDelete}
				title={
					confirmModal.type === 'book' ? 'Delete Ledger'
					: confirmModal.type === 'account' ?
						'Delete Account'
					:	'Delete Entry'
				}
				message={
					confirmModal.type === 'book' ?
						'This will delete the ledger and all its accounts & entries. This cannot be undone.'
					: confirmModal.type === 'account' ?
						'This will delete the account and all its entries. This cannot be undone.'
					:	'This entry will be permanently deleted.'
				}
				confirmLabel='Delete'
				isDanger
			/>
		</>
	);
}
