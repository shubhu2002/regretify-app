export const ProfilePageSkeletonLoading = () => {
	const shimmer = 'animate-pulse bg-white/[0.06] rounded-xl';
	return (
		<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
			<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Back link skeleton */}
				<div className={`${shimmer} h-5 w-40 mb-6`} />

				<div className='flex flex-col md:flex-row gap-8'>
					{/* Profile form skeleton */}
					<div className='flex-1 bg-[#1a191e] border border-white/[0.06] rounded-3xl p-6 sm:p-8'>
						<div className='flex items-center gap-4 mb-8'>
							<div
								className={`${shimmer} w-20 h-20 rounded-full`}
							/>
							<div className='flex-1'>
								<div className={`${shimmer} h-6 w-32 mb-2`} />
								<div className={`${shimmer} h-4 w-48`} />
							</div>
							<div className={`${shimmer} h-9 w-20`} />
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
							{[...Array(5)].map((_, i) => (
								<div key={i}>
									<div
										className={`${shimmer} h-4 w-20 mb-2`}
									/>
									<div className={`${shimmer} h-11 w-full`} />
								</div>
							))}
						</div>
					</div>

					{/* Right sidebar skeleton */}
					<div className='md:w-80 flex flex-col gap-6'>
						<div className='bg-[#1a191e] border border-white/[0.06] rounded-3xl p-6'>
							<div className='flex items-center gap-3 mb-4'>
								<div
									className={`${shimmer} w-5 h-5 rounded-full`}
								/>
								<div className={`${shimmer} h-5 w-28`} />
							</div>
							<div className={`${shimmer} h-4 w-full mb-2`} />
							<div className={`${shimmer} h-4 w-3/4 mb-6`} />
							<div className={`${shimmer} h-11 w-full`} />
						</div>
						<div className='bg-[#1a191e] border border-white/[0.06] rounded-3xl p-6 flex-1'>
							<div className='flex items-center gap-2 mb-6'>
								<div
									className={`${shimmer} w-5 h-5 rounded-full`}
								/>
								<div className={`${shimmer} h-5 w-36`} />
							</div>
							<div className={`${shimmer} h-11 w-full`} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
