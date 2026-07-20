export const NotesSkeletonLoading = () => {
	const shimmer = 'animate-pulse bg-white/[0.06] rounded-xl';
	return (
		<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
			<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
					<div>
						<div className={`${shimmer} h-8 w-28 mb-2`} />
						<div className={`${shimmer} h-4 w-64`} />
					</div>
					<div className={`${shimmer} h-11 w-36`} />
				</div>
				<div className='card-ultra rounded-3xl overflow-hidden flex h-[calc(100dvh-330px)] md:h-[calc(100dvh-250px)] min-h-105'>
					<div className='w-full md:w-72 lg:w-80 shrink-0 md:border-r border-white/10 p-3 space-y-3'>
						<div className={`${shimmer} h-9 w-full`} />
						<div className='bg-[#1a191e] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.05]'>
							{[...Array(5)].map((_, i) => (
								<div key={i} className='px-4 py-3 space-y-2'>
									<div className={`${shimmer} h-4 w-32`} />
									<div className={`${shimmer} h-3 w-full`} />
									<div className={`${shimmer} h-3 w-20`} />
								</div>
							))}
						</div>
					</div>
					<div className='hidden md:flex flex-1 flex-col bg-white/[0.02] p-6 space-y-4'>
						<div className='flex justify-between'>
							<div className={`${shimmer} h-4 w-40`} />
							<div className={`${shimmer} h-8 w-20`} />
						</div>
						<div className={`${shimmer} h-7 w-64`} />
						<div className={`${shimmer} h-3 w-full`} />
						<div className={`${shimmer} h-3 w-5/6`} />
						<div className={`${shimmer} h-3 w-3/4`} />
					</div>
				</div>
			</div>
		</div>
	);
};
