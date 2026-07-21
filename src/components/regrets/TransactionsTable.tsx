import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Search,
	ArrowUpDown,
	Filter,
	Edit2,
	Trash2,
	Download,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Expense, Income, Transaction } from '@/types';
import { MONTHS } from '@/constants';

export default function TransactionsTable({
	incomes,
	expenses,
	onEdit,
	onDelete,
	filterMonth,
	setFilterMonth,
}: {
	incomes: Income[];
	expenses: Expense[];
	onEdit: (item: Transaction) => void;
	onDelete: (id: string, type: 'income' | 'expense') => void;
	filterMonth: string;
	setFilterMonth: (val: string) => void;
}) {
	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
		'all',
	);
	const searchParams = useSearchParams();
	useEffect(() => {
		const q = searchParams.get('q');
		if (q !== null) setSearchTerm(q);
	}, [searchParams]);
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: 'asc' | 'desc';
	}>({
		key: 'date',
		direction: 'desc',
	});
	const itemsPerPage = 10;
	const [visibleCount, setVisibleCount] = useState(itemsPerPage);
	const [loadingMore, setLoadingMore] = useState(false);
	const desktopScrollRef = useRef<HTMLDivElement | null>(null);
	const desktopSentinelRef = useRef<HTMLDivElement | null>(null);
	const mobileScrollRef = useRef<HTMLDivElement | null>(null);
	const mobileSentinelRef = useRef<HTMLDivElement | null>(null);
	const loadingMoreRef = useRef(false);

	// Normalize data
	const normalizedData = useMemo(() => {
		const incs: Transaction[] = incomes.map((i) => ({
			id: i.id,
			user_id: i.user_id,
			type: 'income' as const,
			amount: i.amount,
			date: i.date,
			title: i.source,
			category: 'Income Source',
			payment_type: i.source,
		}));

		const exps: Transaction[] = expenses.map((e) => ({
			id: e.id,
			user_id: e.user_id,
			type: 'expense' as const,
			amount: e.amount,
			date: e.date,
			title: e.name,
			category: e.category,
			payment_type: e.payment_type,
		}));

		return [...incs, ...exps];
	}, [incomes, expenses]);

	// Handle Search, Filter and Sort
	const processedData = useMemo(() => {
		let result = [...normalizedData];

		// Filter by Search
		if (searchTerm) {
			const lowerSearch = searchTerm.toLowerCase();
			result = result.filter(
				(t) =>
					t.title.toLowerCase().includes(lowerSearch) ||
					t.category.toLowerCase().includes(lowerSearch),
			);
		}

		// Filter by Type
		if (filterType !== 'all') {
			result = result.filter((t) => t.type === filterType);
		}

		// Sort Data
		result.sort((a, b) => {
			let aValue = a[sortConfig.key as keyof Transaction];
			let bValue = b[sortConfig.key as keyof Transaction];

			if (sortConfig.key === 'date') {
				aValue = new Date(String(aValue)).getTime();
				bValue = new Date(String(bValue)).getTime();
			}

			if (aValue < bValue) {
				return sortConfig.direction === 'asc' ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortConfig.direction === 'asc' ? 1 : -1;
			}
			return 0;
		});

		return result;
	}, [normalizedData, searchTerm, filterType, sortConfig]);

	// Infinite scroll — reveal rows in batches as the sentinel comes into view
	const currentData = useMemo(
		() => processedData.slice(0, visibleCount),
		[processedData, visibleCount],
	);
	const hasMore = visibleCount < processedData.length;

	useEffect(() => {
		if (!hasMore) return;

		const loadNextBatch = () => {
			if (loadingMoreRef.current) return;
			loadingMoreRef.current = true;
			setLoadingMore(true);
			setTimeout(() => {
				setVisibleCount((c) => c + itemsPerPage);
				setLoadingMore(false);
				loadingMoreRef.current = false;
			}, 400);
		};

		// Sentinels are observed against their own scroll container (root),
		// so a batch loads only when that container is scrolled to its bottom.
		// Re-created after every batch (visibleCount dep) so a fresh observe()
		// re-reports the current intersection state.
		const pairs: [HTMLElement | null, HTMLElement | null][] = [
			[desktopScrollRef.current, desktopSentinelRef.current],
			[mobileScrollRef.current, mobileSentinelRef.current],
		];
		const observers = pairs
			.filter(([root, el]) => root && el)
			.map(([root, el]) => {
				const observer = new IntersectionObserver(
					(entries) => {
						if (entries[0].isIntersecting) loadNextBatch();
					},
					{ root },
				);
				observer.observe(el!);
				return observer;
			});
		return () => observers.forEach((o) => o.disconnect());
	}, [hasMore, visibleCount]);

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'asc';
		if (sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc';
		}
		setSortConfig({ key, direction });
	};

	const exportToPDF = () => {
		const doc = new jsPDF();
		doc.setFontSize(16);
		doc.text('Regretify - Filtered Financial History', 14, 15);
		doc.setFontSize(10);
		doc.text(
			`Generated on: ${format(new Date(), 'MMM dd, yyyy h:mm a')}`,
			14,
			22,
		);

		const tableColumn = [
			'Date',
			'Type',
			'Title',
			'Category',
			'Method',
			'Amount (Rs.)',
		];
		const tableRows = processedData.map((item) => [
			format(new Date(item.date), 'MMM dd, yyyy h:mm a'),
			item.type.charAt(0).toUpperCase() + item.type.slice(1),
			item.title,
			item.category,
			item.payment_type || '-',
			`${item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}`,
		]);

		autoTable(doc, {
			head: [tableColumn],
			body: tableRows,
			startY: 28,
			theme: 'striped',
			styles: { fontSize: 9 },
			headStyles: { fillColor: [16, 16, 19] }, // Near-black brand surface
			didParseCell: (data) => {
				if (data.section === 'body' && data.column.index === 5) {
					// Index 5 is the Amount column
					const rawVal = data.cell.raw as string;
					if (rawVal.startsWith('+')) {
						data.cell.styles.textColor = [16, 185, 129]; // Emerald 500
					} else if (rawVal.startsWith('-')) {
						data.cell.styles.textColor = [239, 68, 68]; // Red 500
					}
					data.cell.styles.fontStyle = 'bold';
				}
			},
		});

		// Add Summary Stats at the bottom structured as a formal autoTable UI box
		const totalIncome = processedData
			.filter((t) => t.type === 'income')
			.reduce((sum, t) => sum + Number(t.amount), 0);
		const totalExpense = processedData
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + Number(t.amount), 0);
		const remaining = totalIncome - totalExpense;
		const percentage =
			totalIncome > 0 ?
				((totalExpense / totalIncome) * 100).toFixed(1)
			:	'0';

		const finalY = (doc as any).lastAutoTable.finalY + 15;

		autoTable(doc, {
			startY: finalY,
			head: [['Financial Summary', 'Metrics']],
			body: [
				['Total Income', `+ ${totalIncome.toLocaleString()}`],
				['Total Expense', `- ${totalExpense.toLocaleString()}`],
				['Remaining Balance', `${remaining.toLocaleString()}`],
				['Damage Done', `${percentage}%`],
			],
			theme: 'grid',
			tableWidth: 100, // Compact boxed layout
			margin: { left: 14 },
			headStyles: {
				fillColor: [16, 16, 19],
				textColor: [255, 255, 255],
				fontStyle: 'bold',
			}, // Near-black matching main table
			columnStyles: {
				0: { fontStyle: 'normal', cellWidth: 55, halign: 'left' },
				1: { fontStyle: 'bold', cellWidth: 45, halign: 'right' },
			},
			didParseCell: (data) => {
				if (data.section === 'body' && data.column.index === 1) {
					// Income Row
					if (data.row.index === 0)
						data.cell.styles.textColor = [16, 185, 129]; // Emerald Green
					// Expense Row
					if (data.row.index === 1)
						data.cell.styles.textColor = [239, 68, 68]; // Red 500
				}
			},
		});

		doc.save(`Regretify_Export_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
	};

	const tableKey = `${searchTerm}-${filterType}-${filterMonth}-${sortConfig.key}-${sortConfig.direction}`;

	return (
		<motion.div
			layout
			className='card-aurora rounded-3xl p-4 sm:p-6 mt-6 relative z-10'
		>
			<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
				<h3 className='text-xl font-semibold tracking-tight text-white'>
					Regretify History
				</h3>

				<div className='flex flex-col sm:flex-row items-center gap-3'>
					<div className='relative w-full sm:w-auto'>
						<Search
							className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40'
							size={16}
						/>
						<input
							type='text'
							placeholder='Search Name or Category...'
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setVisibleCount(itemsPerPage);
							}}
							className='w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/6 text-white placeholder-white/35 focus:border-white/30 focus:ring-2 focus:ring-white/10 outline-none text-base md:text-sm transition-all'
						/>
					</div>

					<div className='relative w-full sm:w-auto flex items-center gap-1 sm:gap-2'>
						<Filter
							size={16}
							className='text-white/40 hidden sm:block'
						/>
						<CustomSelect
							value={filterMonth}
							onChange={(v) => { setFilterMonth(v); setVisibleCount(itemsPerPage); }}
							options={[
								{ value: 'all', label: 'All Months' },
								...MONTHS.map((m, i) => ({ value: i.toString(), label: m })),
							]}
							className='w-full flex-1 sm:w-auto'
						/>

						<CustomSelect
							value={filterType}
							onChange={(v) => { setFilterType(v as 'all' | 'income' | 'expense'); setVisibleCount(itemsPerPage); }}
							options={[
								{ value: 'all', label: 'All Types' },
								{ value: 'income', label: 'Incomes Only' },
								{ value: 'expense', label: 'Expenses Only' },
							]}
							className='w-full flex-1 sm:w-auto'
						/>

						<button
							onClick={exportToPDF}
							className='w-full flex-1 sm:w-auto flex items-center justify-center gap-2 group px-2 py-1.5 sm:px-3 sm:py-2 bg-white/8 hover:bg-white/[0.14] text-white/80 border border-white/10 rounded-xl text-sm font-semibold transition-all active:scale-95'
						>
							<Download
								size={16}
								className='group-hover:-translate-y-0.5 transition-transform'
							/>
							Export
						</button>
					</div>
				</div>
			</div>

			{/* ── Mobile: Card List — fixed height, loads 10 more at its bottom ── */}
			<div
				ref={mobileScrollRef}
				className='md:hidden max-h-120 overflow-y-auto pr-1'
			>
				<AnimatePresence mode='wait'>
					<motion.div
						key={tableKey}
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -5 }}
						transition={{ duration: 0.15 }}
						className='bg-[#1a191e] border border-white/6 rounded-2xl overflow-hidden divide-y divide-white/5'
					>
						{currentData.length > 0 ?
							currentData.map((item) => (
								<div
									key={`${item.type}-${item.id}`}
									className='px-4 py-3 transition-colors hover:bg-white/3'
								>
									{/* Row 1: dot + title + amount */}
									<div className='flex items-center justify-between gap-2'>
										<div className='flex items-center gap-2 flex-1 min-w-0 overflow-hidden'>
											<span
												className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}
											/>
											<span className='font-semibold text-sm text-white truncate min-w-0'>
												{item.title}
											</span>
										</div>
										<span
											className={`font-semibold text-sm shrink-0 ${item.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}
										>
											{item.type === 'income' ? '+' : '-'}
											₹{item.amount.toLocaleString()}
										</span>
									</div>

									{/* Row 2: badges + date + actions */}
									<div className='mt-2 flex items-center justify-between gap-2'>
										<div className='flex flex-wrap items-center gap-1.5 min-w-0'>
											<span className='inline-flex items-center gap-1.5 bg-white/6 border border-white/8 rounded-lg px-2.5 py-1 text-xs text-white/50'>
												{item.category}
											</span>
											{item.type === 'expense' &&
												item.payment_type && (
													<span className='inline-flex items-center gap-1.5 bg-white/6 border border-white/8 rounded-lg px-2.5 py-1 text-xs text-white/50'>
														{item.payment_type}
													</span>
												)}
											<span className='text-xs text-white/35'>
												{format(
													new Date(item.date),
													'MMM dd, yy',
												)}
											</span>
										</div>
										<div className='flex items-center gap-1 shrink-0'>
											<button
												onClick={() => onEdit(item)}
												className='p-1.5 text-white/40 hover:text-white hover:bg-white/8 rounded-lg transition-colors'
												title='Edit'
											>
												<Edit2 size={14} />
											</button>
											<button
												onClick={() =>
													onDelete(
														item.id,
														item.type as any,
													)
												}
												className='p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors'
												title='Delete'
											>
												<Trash2 size={14} />
											</button>
										</div>
									</div>
								</div>
							))
						:	<div className='py-12 text-center text-white/50 text-sm'>
								No transactions found. Look at you go.
							</div>
						}
					</motion.div>
				</AnimatePresence>

				{/* Sentinel + loader (inside the scroll container) */}
				<div
					ref={mobileSentinelRef}
					className='flex items-center justify-center min-h-1'
				>
					{loadingMore && hasMore && (
						<div className='flex items-center gap-2 py-3 text-sm font-medium text-white/50'>
							<div className='h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin' />
							Loading more regrets...
						</div>
					)}
				</div>
			</div>

			{/* ── Desktop: Full Table — fixed height, loads 10 more at its bottom.
			     No `layout` animation here: transform-based layout animations make
			     the sentinel briefly intersect the scroll root, cascading batches ── */}
			<div
				ref={desktopScrollRef}
				className='hidden md:block overflow-x-auto overflow-y-auto max-h-112 w-full rounded-2xl border border-white/6 bg-[#1a191e]'
			>
				<table className='w-full text-left text-sm whitespace-nowrap'>
					<thead className='sticky top-0 z-10 bg-[#141317] text-white/40 uppercase text-xs font-semibold'>
						<tr>
							<th
								className='px-4 py-3 cursor-pointer hover:bg-white/8 transition-colors'
								onClick={() => handleSort('date')}
							>
								<div className='flex items-center gap-1'>
									Date of Regret <ArrowUpDown size={12} />
								</div>
							</th>
							<th
								className='px-4 py-3 cursor-pointer hover:bg-white/8 transition-colors'
								onClick={() => handleSort('title')}
							>
								<div className='flex items-center gap-1'>
									What you wasted it on{' '}
									<ArrowUpDown size={12} />
								</div>
							</th>
							<th className='px-4 py-3'>Excuse</th>
							<th className='px-4 py-3'>Method</th>
							<th
								className='px-4 py-3 cursor-pointer hover:bg-white/8 transition-colors text-right'
								onClick={() => handleSort('amount')}
							>
								<div className='flex items-center justify-end gap-1'>
									Guilt Amount <ArrowUpDown size={12} />
								</div>
							</th>
							<th className='px-4 py-3 text-right'>Actions</th>
						</tr>
					</thead>
					<AnimatePresence mode='wait'>
						<motion.tbody
							key={tableKey}
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							transition={{ duration: 0.15 }}
							className='divide-y divide-white/5'
						>
							{currentData.length > 0 ?
								currentData.map((item) => (
									<tr
										key={`${item.type}-${item.id}`}
										className='hover:bg-white/3 transition-colors group'
									>
										<td className='px-4 py-3 text-white/50'>
											{format(
												new Date(item.date),
												'MMM dd, yyyy h:mm a',
											)}
										</td>
										<td className='px-4 py-3 font-semibold text-white'>
											<div className='flex items-center gap-2'>
												<span
													className={`w-2 h-2 rounded-full ${item.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}
												></span>
												{item.title}
											</div>
										</td>
										<td className='px-4 py-3'>
											<span className='inline-flex items-center gap-1.5 bg-white/6 border border-white/8 rounded-lg px-2.5 py-1 text-xs text-white/50'>
												{item.category}
											</span>
										</td>
										<td className='px-4 py-3 text-white/50 font-medium capitalize'>
											{item.payment_type}
										</td>
										<td
											className={`px-4 py-3 text-center font-medium text-base w-32 ${item.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}
										>
											{item.type === 'income' ? '+' : '-'}
											₹{item.amount.toLocaleString()}
										</td>
										<td className='px-4 py-3'>
											<div className='flex items-center justify-end gap-1'>
												<button
													onClick={() => onEdit(item)}
													className='p-1.5 text-white/40 hover:text-white hover:bg-white/8 rounded-lg transition-colors'
													title='Edit entry'
												>
													<Edit2 size={16} />
												</button>
												<button
													onClick={() =>
														onDelete(
															item.id,
															item.type as any,
														)
													}
													className='p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors'
													title='Delete entry'
												>
													<Trash2 size={16} />
												</button>
											</div>
										</td>
									</tr>
								))
							:	<tr>
									<td
										colSpan={6}
										className='px-4 py-12 text-center text-white/50 bg-transparent'
									>
										No transactions found. Look at you go.
									</td>
								</tr>
							}
						</motion.tbody>
					</AnimatePresence>
				</table>

				{/* Sentinel + loader (inside the scroll container) */}
				<div
					ref={desktopSentinelRef}
					className='flex items-center justify-center min-h-1'
				>
					{loadingMore && hasMore && (
						<div className='flex items-center gap-2 py-3 text-sm font-medium text-white/50'>
							<div className='h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin' />
							Loading more regrets...
						</div>
					)}
				</div>
			</div>

			<motion.div
				layout
				className='flex items-center justify-center mt-4'
			>
				<p className='text-sm font-medium text-white/50'>
					Showing{' '}
					<span className='font-semibold text-white'>
						{currentData.length}
					</span>{' '}
					of{' '}
					<span className='font-semibold text-white'>
						{processedData.length}
					</span>{' '}
					results
				</p>
			</motion.div>
		</motion.div>
	);
}
