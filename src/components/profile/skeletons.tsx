export const ProfilePageSkeletonLoading = () => {
	const shimmer = 'animate-pulse bg-white/[0.06] rounded-xl';
	return (
		<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
			<div className='relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8'>
				{/* Back link */}
				<div className={`${shimmer} h-5 w-20 mb-6`} />

				{/* Hero card — avatar + name + edit button */}
				<div className='card-aurora rounded-3xl p-4 sm:p-6 mb-6'>
					<div className='flex items-center gap-5'>
						<div
							className={`${shimmer} w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0`}
						/>
						<div className='flex-1 min-w-0'>
							<div className={`${shimmer} h-7 w-40 mb-2.5`} />
							<div className={`${shimmer} h-4 w-56`} />
						</div>
						<div className={`${shimmer} h-9 w-20 shrink-0`} />
					</div>
				</div>

				{/* Content grid — form left, action cards right */}
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Personal information */}
					<div className='lg:col-span-2'>
						<div className='bg-[#1a191e] border border-white/[0.06] rounded-2xl p-5 sm:p-6'>
							<div className={`${shimmer} h-5 w-44 mb-6`} />
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								{[...Array(4)].map((_, i) => (
									<div key={i}>
										<div
											className={`${shimmer} h-3 w-16 mb-2`}
										/>
										<div
											className={`${shimmer} h-10 w-full`}
										/>
									</div>
								))}
								<div className='sm:col-span-2'>
									<div
										className={`${shimmer} h-3 w-28 mb-2`}
									/>
									<div className={`${shimmer} h-10 w-full`} />
								</div>
							</div>
						</div>
					</div>

					{/* Right column — app lock, danger zone, sign out */}
					<div className='flex flex-col gap-4'>
						<div className='bg-[#1a191e] border border-white/[0.06] rounded-2xl p-5'>
							<div className='flex items-center gap-2.5 mb-3'>
								<div
									className={`${shimmer} w-8 h-8 rounded-lg shrink-0`}
								/>
								<div className={`${shimmer} h-4 w-20`} />
							</div>
							<div className={`${shimmer} h-3 w-full mb-2`} />
							<div className={`${shimmer} h-3 w-2/3 mb-4`} />
							<div className={`${shimmer} h-10 w-full`} />
						</div>

						<div className='bg-[#1a191e] border border-red-500/20 rounded-2xl p-5'>
							<div className='flex items-center gap-2.5 mb-3'>
								<div
									className={`${shimmer} w-8 h-8 rounded-lg shrink-0`}
								/>
								<div className={`${shimmer} h-4 w-24`} />
							</div>
							<div className={`${shimmer} h-3 w-full mb-2`} />
							<div className={`${shimmer} h-3 w-3/4 mb-4`} />
							<div className={`${shimmer} h-10 w-full`} />
						</div>

						<div className='bg-[#1a191e] border border-white/[0.06] rounded-2xl px-5 py-3.5 flex items-center gap-2.5'>
							<div
								className={`${shimmer} w-5 h-5 rounded-md shrink-0`}
							/>
							<div className={`${shimmer} h-4 w-20`} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
