export const LedgerSkeletonMainLoading = () => {
	const shimmer =
		'animate-pulse bg-slate-200/80 dark:bg-slate-700/50 rounded-xl';
	return (
		<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
			<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
					<div>
						<div className={`${shimmer} h-8 w-28 mb-2`} />
						<div className={`${shimmer} h-4 w-64`} />
					</div>
					<div className={`${shimmer} h-11 w-36`} />
				</div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className='bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-6 shadow-sm'
						>
							<div className={`${shimmer} h-5 w-32 mb-3`} />
							<div className={`${shimmer} h-3 w-48 mb-4`} />
							<div className={`${shimmer} h-6 w-20`} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export const EntriesSkeletonLoading = () => {
	return (
		<div className='space-y-3'>
			{[...Array(5)].map((_, i) => (
				<div
					key={i}
					className='flex items-center gap-4 p-3.5 bg-white/50 dark:bg-slate-900/30 rounded-2xl'
				>
					<div className='animate-pulse bg-slate-200/80 dark:bg-slate-700/50 rounded-lg h-6 w-20' />
					<div className='animate-pulse bg-slate-200/80 dark:bg-slate-700/50 rounded-xl h-4 w-28' />
					<div className='flex-1' />
					<div className='animate-pulse bg-slate-200/80 dark:bg-slate-700/50 rounded-xl h-4 w-24' />
					<div className='animate-pulse bg-slate-200/80 dark:bg-slate-700/50 rounded-xl h-4 w-20' />
				</div>
			))}
		</div>
	);
};
