import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Search,
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Filter,
	Edit2,
	Trash2,
	Download,
} from 'lucide-react';
import { Expense, Income, Transaction } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: 'asc' | 'desc';
	}>({
		key: 'date',
		direction: 'desc',
	});
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

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

	// Pagination Logic
	const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;
	const currentData = useMemo(() => {
		const startIdx = (currentPage - 1) * itemsPerPage;
		return processedData.slice(startIdx, startIdx + itemsPerPage);
	}, [processedData, currentPage]);

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
			headStyles: { fillColor: [124, 58, 237] }, // Violet 600
			didParseCell: (data) => {
				if (data.section === 'body' && data.column.index === 5) {
					// Index 5 is the Amount column
					const rawVal = data.cell.raw as string;
					if (rawVal.startsWith('+')) {
						data.cell.styles.textColor = [16, 185, 129]; // Emerald 500
					} else if (rawVal.startsWith('-')) {
						data.cell.styles.textColor = [244, 63, 94]; // Rose 500
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
				fillColor: [124, 58, 237],
				textColor: [255, 255, 255],
				fontStyle: 'bold',
			}, // Violet matching main table
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
						data.cell.styles.textColor = [244, 63, 94]; // Rose Red
				}
			},
		});

		doc.save(`Regretify_Export_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
	};

	const tableKey = `${currentPage}-${searchTerm}-${filterType}-${filterMonth}-${sortConfig.key}-${sortConfig.direction}-${currentData.length}`;

	return (
		<motion.div
			layout
			className='bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-4 sm:p-6 shadow-sm mt-6 relative z-10'
		>
			<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
				<h3 className='text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'>
					Regretify History
				</h3>

				<div className='flex flex-col sm:flex-row items-center gap-3'>
					<div className='relative w-full sm:w-auto'>
						<Search
							className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
							size={16}
						/>
						<input
							type='text'
							placeholder='Search Name or Category...'
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setCurrentPage(1);
							}}
							className='w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all'
						/>
					</div>

					<div className='relative w-full sm:w-auto flex items-center gap-1 sm:gap-2'>
						<Filter
							size={16}
							className='text-slate-400 hidden sm:block'
						/>
						<select
							value={filterMonth}
							onChange={(e) => {
								setFilterMonth(e.target.value);
								setCurrentPage(1);
							}}
							className='w-full flex-1 sm:w-auto text-center items-center px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none text-sm appearance-none cursor-pointer relative'
						>
							<option value='all'>All Months</option>
							{[
								'January',
								'February',
								'March',
								'April',
								'May',
								'June',
								'July',
								'August',
								'September',
								'October',
								'November',
								'December',
							].map((m, i) => (
								<option
									key={i}
									value={i.toString()}
								>
									{m}
								</option>
							))}
						</select>

						<select
							value={filterType}
							onChange={(e) => {
								setFilterType(
									e.target.value as
										| 'all'
										| 'income'
										| 'expense',
								);
								setCurrentPage(1);
							}}
							className='w-full flex-1 sm:w-auto text-center items-center px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none text-sm appearance-none cursor-pointer'
						>
							<option value='all'>All Types</option>
							<option value='income'>Incomes Only</option>
							<option value='expense'>Expenses Only</option>
						</select>

						<button
							onClick={exportToPDF}
							className='w-full flex-1 sm:w-auto flex items-center justify-center gap-2 group px-2 py-1.5 sm:px-3 sm:py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl text-sm font-semibold transition-all active:scale-95'
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

			<motion.div
				layout
				className='overflow-x-auto rounded-xl border border-violet-100 dark:border-violet-800/30 shadow-sm bg-white/40 dark:bg-slate-950/40'
			>
				<table className='w-full text-left text-sm whitespace-nowrap'>
					<thead className='bg-violet-100/50 dark:bg-violet-800/30 border-b border-violet-100 dark:border-violet-800/30 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold'>
						<tr>
							<th
								className='px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
								onClick={() => handleSort('date')}
							>
								<div className='flex items-center gap-1'>
									Date of Regret <ArrowUpDown size={12} />
								</div>
							</th>
							<th
								className='px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
								onClick={() => handleSort('title')}
							>
								<div className='flex items-center gap-1'>
									What you wasted it on{' '}
									<ArrowUpDown size={12} />
								</div>
							</th>
							<th className='px-4 py-3'>Excuse</th>
							<th className='px-4 py-3 hidden sm:table-cell'>
								Method
							</th>
							<th
								className='px-4 py-3 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors text-right'
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
							className='divide-y divide-violet-200/50 dark:divide-violet-800/30 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm'
						>
							{currentData.length > 0 ?
								currentData.map((item) => (
									<tr
										key={`${item.type}-${item.id}`}
										className='hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors group'
									>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
											{format(
												new Date(item.date),
												'MMM dd, yyyy h:mm a',
											)}
										</td>
										<td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-200'>
											<div className='flex items-center gap-2'>
												<span
													className={`w-2 h-2 rounded-full ${item.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}
												></span>
												{item.title}
											</div>
										</td>
										<td className='px-4 py-3'>
											<span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
												{item.category}
											</span>
										</td>
										<td className='px-4 py-3 hidden sm:table-cell text-slate-500 dark:text-slate-400 font-medium capitalize'>
											{item.payment_type}
										</td>
										<td
											className={`px-4 py-3 text-center font-medium text-base w-32 ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}
										>
											{item.type === 'income' ? '+' : '-'}
											₹{item.amount.toLocaleString()}
										</td>
										<td className='px-4 py-3'>
											<div className='flex items-center justify-end gap-1'>
												<button
													onClick={() => onEdit(item)}
													className='p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors'
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
													className='p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors'
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
										className='px-4 py-12 text-center text-slate-500 dark:text-slate-400 bg-transparent'
									>
										No transactions found. Look at you go.
									</td>
								</tr>
							}
						</motion.tbody>
					</AnimatePresence>
				</table>
			</motion.div>

			<motion.div
				layout
				className='flex items-center justify-between mt-6'
			>
				<p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
					Showing{' '}
					<span className='font-semibold text-slate-900 dark:text-slate-200'>
						{currentData.length > 0 ?
							(currentPage - 1) * itemsPerPage + 1
						:	0}
					</span>{' '}
					to{' '}
					<span className='font-semibold text-slate-900 dark:text-slate-200'>
						{Math.min(
							currentPage * itemsPerPage,
							processedData.length,
						)}
					</span>{' '}
					of{' '}
					<span className='font-semibold text-slate-900 dark:text-slate-200'>
						{processedData.length}
					</span>{' '}
					results
				</p>

				<div className='flex items-center gap-2'>
					<button
						onClick={() =>
							setCurrentPage((p) => Math.max(1, p - 1))
						}
						disabled={currentPage === 1}
						className='p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					>
						<ChevronLeft
							size={16}
							strokeWidth={2}
						/>
					</button>

					<span className='text-sm font-medium text-slate-700 dark:text-slate-300 px-2 py-1 bg-transparent'>
						Page {currentPage} of {totalPages}
					</span>

					<button
						onClick={() =>
							setCurrentPage((p) => Math.min(totalPages, p + 1))
						}
						disabled={currentPage === totalPages}
						className='p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					>
						<ChevronRight
							size={16}
							strokeWidth={2}
						/>
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
