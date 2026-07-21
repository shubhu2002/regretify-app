import { LedgerBook } from '@/types';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Pencil, Trash2, ArrowRight } from 'lucide-react';

interface LedgerBooksProps {
	books: LedgerBook[];
	onSelect: (book: LedgerBook) => void;
	onCreate: () => void;
	onEdit: (book: LedgerBook, e: React.MouseEvent) => void;
	onDelete: (book: LedgerBook, e: React.MouseEvent) => void;
}

const gridVariants = {
	hidden: {},
	show: {
		transition: { staggerChildren: 0.07, delayChildren: 0.05 },
	},
};

const cardVariants = {
	hidden: { opacity: 0, y: 24 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring' as const, bounce: 0.25, duration: 0.6 },
	},
};

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
	const spineTints = [
		'bg-[#9294e5]/60',
		'bg-[#d39dbd]/60',
		'bg-[#cbf1fd]/50',
		'bg-[#f0f8e8]/50',
	];
	const glowTints = [
		'group-hover:shadow-[0_8px_48px_rgba(146,148,229,0.18)]',
		'group-hover:shadow-[0_8px_48px_rgba(211,157,189,0.18)]',
		'group-hover:shadow-[0_8px_48px_rgba(203,241,253,0.14)]',
		'group-hover:shadow-[0_8px_48px_rgba(240,248,232,0.14)]',
	];

	return (
		<>
			<div className='relative flex-1 w-full min-h-[calc(100dvh-24px)] sm:min-h-[calc(100dvh-64px)] overflow-hidden'>
				<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					{/* Header */}
					<motion.header
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						className='flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10'
					>
						<div>
							<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient'>
								Your money, organised
							</span>
							<h1 className='text-4xl font-semibold tracking-tight text-gradient mt-2'>
								Ledger
							</h1>
							<p className='text-white/50 mt-1.5'>
								Manage your ledger books, accounts &amp; entries
							</p>
						</div>

						<div className='flex items-center gap-3'>
							{books.length > 0 && (
								<span className='hidden sm:inline-flex items-center gap-1.5 bg-white/6 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-white/50'>
									<BookOpen size={12} />
									{books.length}{' '}
									{books.length === 1 ? 'book' : 'books'}
								</span>
							)}
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								onClick={onCreate}
								className='w-fit bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors group/new cursor-pointer'
							>
								<Plus
									size={18}
									className='transition-transform duration-300 group-hover/new:rotate-90'
								/>
								<span>New Ledger</span>
							</motion.button>
						</div>
					</motion.header>

					{books.length === 0 ?
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='card-aurora rounded-3xl p-14 text-center'
						>
							<motion.div
								animate={{ y: [0, -8, 0] }}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: 'easeInOut',
								}}
								className='w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#9294e5]/15 text-[#b9baf1] flex items-center justify-center'
							>
								<BookOpen size={28} />
							</motion.div>
							<p className='text-white text-xl font-semibold tracking-tight'>
								No ledgers yet
							</p>
							<p className='text-white/40 text-sm mt-1.5 max-w-xs mx-auto'>
								Create a ledger book to start tracking who owes
								you and who you owe.
							</p>
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								onClick={onCreate}
								className='mt-7 bg-[#9294e5] hover:bg-[#a3a5ec] text-black shadow-[0_2px_24px_rgba(146,148,229,0.35)] px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer'
							>
								<Plus size={16} />
								Create your first ledger
							</motion.button>
						</motion.div>
					:	<motion.div
							variants={gridVariants}
							initial='hidden'
							animate='show'
							className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
						>
							{books.map((book, i) => (
								<motion.div
									key={book.id}
									variants={cardVariants}
									whileHover={{ y: -6 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => onSelect(book)}
									className={`p-6 card-aurora rounded-3xl cursor-pointer group relative overflow-hidden transition-shadow duration-300 ${glowTints[i % glowTints.length]}`}
								>
									{/* Shine sweep */}
									<div className='absolute -inset-2 bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none' />

									{/* Book spine accent */}
									<div
										className={`absolute left-0 top-7 bottom-7 w-1 rounded-r-full ${spineTints[i % spineTints.length]}`}
									/>

									<div className='relative z-10'>
										<div className='flex items-start justify-between mb-3'>
											<div
												className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${chipTints[i % chipTints.length]}`}
											>
												<BookOpen size={20} />
											</div>
											<div className='flex items-center gap-1'>
												<button
													onClick={(e) =>
														onEdit(book, e)
													}
													className='p-2 text-white/40 hover:text-white bg-white/6 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer'
												>
													<Pencil size={13} />
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														onDelete(book, e);
													}}
													className='p-2 text-white/40 hover:text-red-400 bg-white/6 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer'
												>
													<Trash2 size={13} />
												</button>
											</div>
										</div>

										<h3 className='font-semibold text-white text-lg tracking-tight'>
											{book.name}
										</h3>
										{book.description && (
											<p className='text-sm text-white/40 mt-1 line-clamp-2 leading-relaxed'>
												{book.description}
											</p>
										)}

										<div className='flex items-center justify-between mt-5 pt-4 border-t border-white/6'>
											<span className='text-xs text-white/35'>
												{new Date(
													book.created_at,
												).toLocaleDateString('en-IN', {
													day: 'numeric',
													month: 'short',
													year: 'numeric',
												})}
											</span>
											<span className='flex items-center gap-1 text-xs font-medium text-white/40 group-hover:text-white transition-colors'>
												<span className='opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300'>
													Open
												</span>
												<ArrowRight
													size={14}
													className='group-hover:translate-x-0.5 transition-transform duration-300'
												/>
											</span>
										</div>
									</div>
								</motion.div>
							))}
						</motion.div>
					}
				</div>
			</div>
		</>
	);
}
