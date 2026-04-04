'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ghost, LogIn, Plus, BookOpen, Flame, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import AuthModal from './landing-page/AuthModal';
import ThemeToggle from './ThemeToggle';
import AddTransactionModal from './dashboard/AddTransactionModal';

const NAV_LINKS = [
	{ href: '/dashboard', label: 'Regrets', icon: Flame },
	{ href: '/ledger', label: 'Ledger', icon: BookOpen },
	{ href: '/profile', label: 'Profile', icon: User },
];

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

	const isLanding = pathname === '/';

	return (
		<>
			<nav className='sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center h-14 sm:h-16'>
						{/* Logo */}
						<Link
							href='/'
							className='flex items-center gap-2 group'
						>
							<motion.div
								whileHover={{ rotate: 15 }}
								whileTap={{ scale: 0.9 }}
								className='bg-white dark:bg-slate-800 p-1.5 sm:p-2 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-violet-600 dark:text-violet-400'
							>
								<Ghost
									strokeWidth={2}
									className='size-4 sm:size-5'
								/>
							</motion.div>
							<span className='text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
								Regretify
							</span>
						</Link>

						{/* Center nav links — only on non-landing pages when logged in */}
						{!isLanding && session && (
							<div className='hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50'>
								{NAV_LINKS.map((link) => {
									const isActive = pathname === link.href;
									return (
										<Link
											key={link.href}
											href={link.href}
											className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
												isActive
													? 'text-violet-700 dark:text-violet-300'
													: 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
											}`}
										>
											{isActive && (
												<motion.div
													layoutId='activeNav'
													className='absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-600/50'
													transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
												/>
											)}
											<span className='relative z-10 flex items-center gap-1.5'>
												<link.icon size={15} strokeWidth={2} />
												{link.label}
											</span>
										</Link>
									);
								})}
							</div>
						)}

						{/* Right side */}
						<div className='flex items-center gap-2 sm:gap-3'>
							{status === 'loading' ? (
								<div className='h-8 w-8 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800' />
							) : session ? (
								<div className='flex items-center gap-2 sm:gap-3'>
									{/* Mobile bottom bar handles nav, so just show profile pill on desktop */}
									{!isLanding && (
										<Link
											href='/profile'
											className='hidden md:flex items-center gap-2 p-1 pr-3.5 bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-full shadow-sm hover:bg-violet-100/60 dark:hover:bg-violet-800/30 transition-all'
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={displayImage}
												alt=''
												className='w-7 h-7 rounded-full object-cover bg-slate-100'
											/>
											<span className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
												{displayName}
											</span>
										</Link>
									)}

									{/* Landing page — just profile pill */}
									{isLanding && (
										<Link
											href='/profile'
											className='flex items-center gap-2 p-1 sm:p-1.5 sm:pr-4 bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-full shadow-sm hover:bg-violet-100/60 dark:hover:bg-violet-800/30 transition-all'
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
									)}
								</div>
							) : (
								<button
									onClick={() => setIsAuthOpen(true)}
									className='flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer'
								>
									<LogIn size={16} strokeWidth={2} />
									<span>Sign In</span>
								</button>
							)}

							<ThemeToggle />
						</div>
					</div>
				</div>
			</nav>

			{/* Mobile bottom navigation — only on non-landing pages when logged in */}
			{!isLanding && session && (
				<div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 pb-[env(safe-area-inset-bottom)]'>
					<div className='flex items-center justify-around h-14'>
						{NAV_LINKS.map((link) => {
							const isActive = pathname === link.href;
							return (
								<Link
									key={link.href}
									href={link.href}
									className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
										isActive
											? 'text-violet-600 dark:text-violet-400'
											: 'text-slate-400 dark:text-slate-500'
									}`}
								>
									{isActive && (
										<motion.div
											layoutId='activeMobileNav'
											className='absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-violet-500 rounded-full'
											transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
										/>
									)}
									<link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
									<span className='text-[10px] font-semibold'>{link.label}</span>
								</Link>
							);
						})}
					</div>
				</div>
			)}

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
