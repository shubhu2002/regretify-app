export const LedgerSkeletonMainLoading = () => {
	const shimmer = 'animate-pulse bg-white/6 rounded-xl';
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
						<div key={i} className='card-aurora rounded-3xl p-6'>
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

/* Skeleton matching the accounts + entries two-panel view, shown while a
   selected book's data loads (so the layout doesn't flash the books grid). */
export const LedgerAccountsSkeletonLoading = () => {
	const shimmer = 'animate-pulse bg-white/6 rounded-xl';
	return (
		<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
			<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Header */}
				<div className='flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8'>
					<div className='flex items-start gap-3'>
						<div className={`${shimmer} h-10 w-10 rounded-xl`} />
						<div>
							<div className={`${shimmer} h-3 w-28 mb-2.5`} />
							<div className={`${shimmer} h-9 w-48 mb-2`} />
							<div className={`${shimmer} h-4 w-32`} />
						</div>
					</div>
					<div className='flex items-center gap-3'>
						<div className={`${shimmer} h-8 w-28 rounded-lg`} />
						<div className={`${shimmer} h-11 w-40`} />
					</div>
				</div>

				{/* Two panels */}
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Accounts panel */}
					<div className='lg:col-span-1 card-aurora rounded-3xl p-4 sm:p-5 h-[42vh] sm:h-[70vh] flex flex-col'>
						<div className='flex items-center justify-between mb-4 px-1'>
							<div className={`${shimmer} h-4 w-28`} />
							<div className={`${shimmer} h-7 w-7 rounded-lg`} />
						</div>
						<div className='bg-[#1a191e] border border-white/6 rounded-2xl overflow-hidden divide-y divide-white/5'>
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className='flex items-center gap-3 px-4 py-3'
								>
									<div
										className={`${shimmer} w-9 h-9 rounded-xl shrink-0`}
									/>
									<div className='flex-1 min-w-0'>
										<div
											className={`${shimmer} h-3.5 w-24 mb-1.5`}
										/>
										<div className={`${shimmer} h-3 w-16`} />
									</div>
									<div className={`${shimmer} h-4 w-16`} />
								</div>
							))}
						</div>
					</div>

					{/* Entries panel placeholder */}
					<div className='lg:col-span-2 card-aurora rounded-3xl p-4 sm:p-6 h-[70vh] hidden lg:flex flex-col items-center justify-center'>
						<div
							className={`${shimmer} w-24 h-24 rounded-2xl mb-6`}
						/>
						<div className={`${shimmer} h-4 w-48 mb-2.5`} />
						<div className={`${shimmer} h-3 w-36`} />
					</div>
				</div>
			</div>
		</div>
	);
};

export const EntriesSkeletonLoading = () => {
	return (
		<div className='bg-[#1a191e] border border-white/6 rounded-2xl overflow-hidden divide-y divide-white/5'>
			{[...Array(5)].map((_, i) => (
				<div key={i} className='flex items-center gap-4 px-4 py-3'>
					<div className='animate-pulse bg-white/6 rounded-lg h-6 w-20' />
					<div className='animate-pulse bg-white/6 rounded-xl h-4 w-28' />
					<div className='flex-1' />
					<div className='animate-pulse bg-white/6 rounded-xl h-4 w-24' />
					<div className='animate-pulse bg-white/6 rounded-xl h-4 w-20' />
				</div>
			))}
		</div>
	);
};
