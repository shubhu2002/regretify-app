export const LedgerSkeletonMainLoading = () => {
	const shimmer = 'animate-pulse bg-white/[0.06] rounded-xl';
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
						<div key={i} className='card-ultra rounded-3xl p-6'>
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
		<div className='bg-[#1a191e] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.05]'>
			{[...Array(5)].map((_, i) => (
				<div key={i} className='flex items-center gap-4 px-4 py-3'>
					<div className='animate-pulse bg-white/[0.06] rounded-lg h-6 w-20' />
					<div className='animate-pulse bg-white/[0.06] rounded-xl h-4 w-28' />
					<div className='flex-1' />
					<div className='animate-pulse bg-white/[0.06] rounded-xl h-4 w-24' />
					<div className='animate-pulse bg-white/[0.06] rounded-xl h-4 w-20' />
				</div>
			))}
		</div>
	);
};
