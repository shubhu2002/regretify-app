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
	const chipTints = [
		'bg-[#9294e5]/15 text-[#b9baf1]',
		'bg-[#d39dbd]/15 text-[#e7c1d8]',
		'bg-[#cbf1fd]/10 text-[#cbf1fd]',
		'bg-[#f0f8e8]/10 text-[#f0f8e8]',
	];
	return (
		<>
			<div className='relative flex-1 w-full min-h-[calc(100dvh-24px)] sm:min-h-[calc(100dvh-64px)] overflow-hidden'>
				<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<header className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
						<div>
							<h1 className='text-3xl font-semibold tracking-tight text-gradient'>
								Ledger
							</h1>
							<p className='text-white/50 mt-1'>
								Manage your ledger books, accounts & entries
							</p>
						</div>
						<button
							onClick={onCreate}
							className='w-fit bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors'
						>
							<Plus size={18} />
							<span>New Ledger</span>
						</button>
					</header>

					{books.length === 0 ?
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='card-aurora rounded-3xl p-12 text-center'
						>
							<div className='w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#9294e5]/15 text-[#b9baf1] flex items-center justify-center'>
								<BookOpen size={28} />
							</div>
							<p className='text-white/50 text-lg font-medium'>
								No ledgers yet
							</p>
							<p className='text-white/40 text-sm mt-1'>
								Create a ledger to start tracking money
							</p>
						</motion.div>
					:	<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
							{books.map((book, i) => (
								<motion.div
									key={book.id}
									whileTap={{ scale: 0.98 }}
									onClick={() => onSelect(book)}
									className='p-5 card-ultra rounded-3xl cursor-pointer transition-all group relative overflow-hidden'
								>
									<div className='absolute -inset-2 bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none' />
									<div className='relative z-10'>
										<div className='flex items-start justify-between mb-2'>
											<div className='flex items-center gap-2'>
												<div
													className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${chipTints[i % chipTints.length]}`}
												>
													<BookOpen size={16} />
												</div>
												<h3 className='font-semibold text-white text-lg'>
													{book.name}
												</h3>
											</div>
											<div className='flex items-center gap-1'>
												<button
													onClick={(e) =>
														onEdit(book, e)
													}
													className='p-1.5 text-white/30 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100'
												>
													<Pencil size={14} />
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														onDelete(book, e);
													}}
													className='p-1.5 text-white/30 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100'
												>
													<Trash2 size={14} />
												</button>
											</div>
										</div>
										{book.description && (
											<p className='text-sm text-white/40 mb-3 line-clamp-2'>
												{book.description}
											</p>
										)}
										<div className='flex items-center justify-between mt-3'>
											<span className='text-xs text-white/40'>
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
												className='text-white/40'
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
