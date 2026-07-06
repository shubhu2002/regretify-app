import { LedgerBook } from '@/types';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Pencil, Trash2, ChevronRight } from 'lucide-react';

interface LedgerBooksProps {
	books: LedgerBook[];
	onSelect: (book: LedgerBook) => void;
	onCreate: () => void;
	onEdit: (book: LedgerBook, e: React.MouseEvent) => void;
	onDelete: (book: LedgerBook, e: React.MouseEvent) => void;
}

export default function LedgerBooks({
	books,
	onSelect,
	onCreate,
	onEdit,
	onDelete,
}: LedgerBooksProps) {
	return (
		<>
			<div className='relative flex-1 w-full min-h-[calc(100dvh-24px)] sm:min-h-[calc(100dvh-64px)] overflow-hidden'>
				<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<header className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
						<div>
							<h1 className='text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'>
								Ledger
							</h1>
							<p className='text-slate-500 dark:text-slate-400 mt-1'>
								Manage your ledger books, accounts & entries
							</p>
						</div>
						<button
							onClick={onCreate}
							className='w-fit bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all'
						>
							<Plus size={18} />
							<span>New Ledger</span>
						</button>
					</header>

					{books.length === 0 ?
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-12 shadow-sm text-center'
						>
							<BookOpen
								className='mx-auto text-slate-300 dark:text-slate-600 mb-4'
								size={48}
							/>
							<p className='text-slate-500 dark:text-slate-400 text-lg font-medium'>
								No ledgers yet
							</p>
							<p className='text-slate-400 dark:text-slate-500 text-sm mt-1'>
								Create a ledger to start tracking money
							</p>
						</motion.div>
					:	<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
							{books.map((book) => (
								<motion.div
									key={book.id}
									whileTap={{ scale: 0.98 }}
									onClick={() => onSelect(book)}
									className='p-5 rounded-3xl border cursor-pointer transition-all group relative overflow-hidden bg-white/70 dark:bg-slate-900/50 border-violet-100 dark:border-violet-800/30 hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-md'
								>
									<div className='absolute -inset-2 bg-linear-to-r from-transparent via-white/40 to-transparent dark:via-white/5 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none' />
									<div className='relative z-10'>
										<div className='flex items-start justify-between mb-2'>
											<div className='flex items-center gap-2'>
												<BookOpen
													size={18}
													className='text-violet-500'
												/>
												<h3 className='font-bold text-slate-900 dark:text-white text-lg'>
													{book.name}
												</h3>
											</div>
											<div className='flex items-center gap-1'>
												<button
													onClick={(e) =>
														onEdit(book, e)
													}
													className='p-1.5 text-slate-300 hover:text-violet-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100'
												>
													<Pencil size={14} />
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														onDelete(book, e);
													}}
													className='p-1.5 text-slate-300 hover:text-rose-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100'
												>
													<Trash2 size={14} />
												</button>
											</div>
										</div>
										{book.description && (
											<p className='text-sm text-slate-400 dark:text-slate-500 mb-3 line-clamp-2'>
												{book.description}
											</p>
										)}
										<div className='flex items-center justify-between mt-3'>
											<span className='text-xs text-slate-400 dark:text-slate-500'>
												{new Date(
													book.created_at,
												).toLocaleDateString('en-IN', {
													day: 'numeric',
													month: 'short',
													year: 'numeric',
												})}
											</span>
											<ChevronRight
												size={16}
												className='text-slate-400'
											/>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					}
				</div>
			</div>
		</>
	);
}
