'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ghost, LogIn, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import AuthModal from './landing-page/AuthModal';
import ThemeToggle from './ThemeToggle';
import AddTransactionModal from './dashboard/AddTransactionModal';

export default function Navbar() {
	const { data: session, status } = useSession();
	const pathname = usePathname();
	const [isAuthOpen, setIsAuthOpen] = useState(false);
	const [transactionOpen, setTransactionOpen] = useState(false);

	const { data: dbUser } = useQuery({
		queryKey: ['userProfile'],
		queryFn: async () => {
			const res = await fetch('/api/user');
			if (!res.ok) return null;
			const data = await res.json();
			return data?.user || null;
		},
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	const displayName = dbUser?.name || session?.user?.name || 'User';
	
	const displayImage =
		dbUser?.profile ||
		session?.user?.image ||
		'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';

	// Only show Dashboard/AddRegret on non-landing pages
	const isLanding = pathname === '/';

	const navBtnCls =
		'flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all';

	return (
		<>
			<nav className='sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center h-20'>
						{/* Logo */}
						<Link
							href='/'
							className='flex items-center gap-2 group'
						>
							<motion.div
								whileHover={{ rotate: 15 }}
								whileTap={{ scale: 0.9 }}
								className='bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-violet-600 dark:text-violet-400'
							>
								<Ghost
									size={24}
									strokeWidth={2}
								/>
							</motion.div>
							<span className='text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
								Regretify
							</span>
						</Link>

						{/* Right side */}
						<div className='flex items-center gap-3'>
							{status === 'loading' ?
								<div className='h-8 w-8 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800' />
							: session ?
								<div className='flex items-center gap-3'>
									{/* Dashboard & Add Regret — only on non-landing pages */}
									{!isLanding && (
										<>
											<Link
												href='/dashboard'
												className={`${navBtnCls} hidden sm:flex`}
											>
												Dashboard
											</Link>
											<button
												onClick={() =>
													setTransactionOpen(true)
												}
												className='bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all'
											>
												<Plus
													size={16}
													strokeWidth={2.5}
												/>
												<span className='hidden sm:block'>
													Add Regret
												</span>
											</button>
										</>
									)}

									{/* Profile pill */}
									<Link
										href='/profile'
										className='flex items-center gap-2 p-1.5 pr-4 bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-full shadow-sm hover:bg-violet-100/60 dark:hover:bg-violet-800/30 transition-all'
									>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={displayImage}
											alt=''
											className='w-8 h-8 rounded-full object-cover bg-slate-100'
										/>
										<span className='text-sm font-semibold hidden sm:block text-slate-700 dark:text-slate-300'>
											{displayName}
										</span>
									</Link>
								</div>
							:	<button
									onClick={() => setIsAuthOpen(true)}
									className={navBtnCls}
								>
									<LogIn
										size={16}
										strokeWidth={2}
									/>
									<span>Sign In</span>
								</button>
							}

							{/* Theme toggle always visible */}
							<ThemeToggle />
						</div>
					</div>
				</div>
			</nav>

			{session && (
				<AddTransactionModal
					isOpen={transactionOpen}
					onClose={() => setTransactionOpen(false)}
					type='expense'
					userId={
						(session.user as any)?.id || session.user?.email || ''
					}
					onSuccess={() => setTransactionOpen(false)}
				/>
			)}
			<AuthModal
				isOpen={isAuthOpen}
				onClose={() => setIsAuthOpen(false)}
			/>
		</>
	);
}
