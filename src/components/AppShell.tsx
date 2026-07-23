'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Ghost,
	LogIn,
	BookOpen,
	Flame,
	StickyNote,
	Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import AuthModal from './landing-page/AuthModal';
import AddTransactionModal from './regrets/AddTransactionModal';

const NAV_LINKS = [
	{ href: '/regrets', label: 'Regrets', icon: Flame },
	{ href: '/ledger', label: 'Ledger', icon: BookOpen },
	{ href: '/notes', label: 'Notes', icon: StickyNote },
];

export default function AppShell({
	children,
}: {
	children: React.ReactNode;
}) {
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
	const isApp = !isLanding && !!session;

	/* Sidebar counts — share the pages' query caches so they stay in sync */
	const userId = (session?.user as any)?.id || session?.user?.email || '';

	// Current month's regrets — same key + endpoint as the regrets page's
	// default view, so both share one cache entry.
	const currentMonth = new Date().getMonth().toString();
	const { data: txData } = useQuery({
		queryKey: ['transactions', userId, currentMonth],
		queryFn: async () => {
			const res = await fetch(`/api/transactions/?month=${currentMonth}`);
			if (!res.ok) return null;
			return res.json() as Promise<{
				incomes: unknown[];
				expenses: unknown[];
			}>;
		},
		enabled: isApp,
		staleTime: 60 * 1000,
	});

	const { data: notesData } = useQuery({
		queryKey: ['notes'],
		queryFn: async () => {
			const res = await fetch('/api/notes');
			if (!res.ok) return null;
			return res.json() as Promise<{ notes: unknown[] }>;
		},
		enabled: isApp,
		staleTime: 60 * 1000,
	});

	const { data: ledgerData } = useQuery({
		queryKey: ['ledger', null],
		queryFn: async () => {
			const res = await fetch('/api/ledger');
			if (!res.ok) return null;
			return res.json() as Promise<{ books: unknown[] }>;
		},
		enabled: isApp,
		staleTime: 60 * 1000,
	});

	const navCounts: Record<string, number> = {
		'/regrets':
			(txData?.incomes?.length || 0) + (txData?.expenses?.length || 0),
		'/ledger': ledgerData?.books?.length || 0,
		'/notes': notesData?.notes?.length || 0,
	};

	/* ─── Marketing chrome (landing page / signed out) ─── */
	if (!isApp) {
		return (
			<>
				<nav className='fixed top-0 z-50 w-full bg-black/70 backdrop-blur-xl border-b border-white/8'>
					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
						<div className='flex justify-between items-center h-14 sm:h-16'>
							<Link
								href='/'
								className='flex items-center gap-2 group'
							>
								<motion.div
									whileHover={{ rotate: 15 }}
									whileTap={{ scale: 0.9 }}
									className='bg-black p-1.5 sm:p-2 border border-white/15 rounded-full text-white shadow-[0_0_20px_rgba(255,255,255,0.12)]'
								>
									<Ghost
										strokeWidth={2}
										className='size-4 sm:size-5'
									/>
								</motion.div>
								<span className='text-lg sm:text-xl font-semibold text-white tracking-tight'>
									Regretify
								</span>
							</Link>

							<div className='flex items-center gap-2 sm:gap-3'>
								{status === 'loading' ? (
									<div className='h-8 w-8 rounded-full animate-pulse bg-white/10' />
								) : session ? (
									<Link
										href='/profile'
										className='flex items-center gap-2 p-1 sm:p-1.5 sm:pr-4 bg-white/6 border border-white/10 rounded-full hover:bg-white/10 transition-all'
									>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={displayImage}
											alt=''
											className='w-8 h-8 rounded-full object-cover bg-white/10'
										/>
										<span className='text-sm font-medium hidden sm:block text-white/80'>
											{displayName}
										</span>
									</Link>
								) : (
									<button
										onClick={() => setIsAuthOpen(true)}
										className='flex items-center gap-2 bg-[#9294e5] hover:bg-[#a3a5ec] text-black px-4 py-2 rounded-xl text-sm font-semibold glow-periwinkle-sm transition-all cursor-pointer'
									>
										<LogIn size={16} strokeWidth={2} />
										<span>Sign In</span>
									</button>
								)}
							</div>
						</div>
					</div>
				</nav>

				{children}

				<AuthModal
					isOpen={isAuthOpen}
					onClose={() => setIsAuthOpen(false)}
				/>
			</>
		);
	}

	/* ─── App chrome (signed in, app pages) — ultramail-style shell ─── */
	return (
		<>
			{/* Soft white radial glow at the top, like the landing hero */}
			<div className='fixed inset-0 pointer-events-none z-0 overflow-hidden'>
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-[200vw] max-w-500 h-[50vh] opacity-[0.07] bg-[radial-gradient(40.9%_81.1%_at_50%_0%,#ffffff_0%,rgba(0,0,0,0)_100%)]' />
			</div>

			{/* Top bar: logo badge + global search + profile pill */}
			<header className='fixed top-0 inset-x-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/8'>
				<div className='flex items-center gap-3 sm:gap-6 h-14 sm:h-16 px-4 sm:px-6'>
					<Link
						href='/'
						className='flex items-center gap-2 group'
					>
						<motion.div
							whileHover={{ rotate: 15 }}
							whileTap={{ scale: 0.9 }}
							className='bg-black p-1.5 sm:p-2 border border-white/15 rounded-full text-white shadow-[0_0_20px_rgba(255,255,255,0.12)]'
						>
							<Ghost
								strokeWidth={2}
								className='size-4 sm:size-5'
							/>
						</motion.div>
						<span className='text-lg sm:text-xl font-semibold text-white tracking-tight'>
							Regretify
						</span>
					</Link>
					<Link
						href='/profile'
						className='flex shrink-0 items-center gap-2 p-1 pr-2 md:pr-3.5 bg-white/6 border border-white/10 rounded-full hover:bg-white/10 transition-all ml-auto'
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={displayImage}
							alt='Profile'
							className='w-7 h-7 rounded-full object-cover bg-white/10'
						/>
						<span className='block text-sm font-medium text-white/80'>
							{displayName}
						</span>
					</Link>
				</div>
			</header>

			{/* Desktop sidebar */}
			<aside className='hidden md:flex flex-col fixed left-0 top-14 sm:top-16 bottom-0 w-60 z-40 border-r border-white/8 bg-black/40 backdrop-blur-xl p-4'>
				<button
					onClick={() => setTransactionOpen(true)}
					className='w-full flex items-center justify-center gap-2 bg-[#9294e5] hover:bg-[#a3a5ec] text-black font-semibold rounded-xl px-4 py-3 mb-5 shadow-[0_2px_24px_rgba(146,148,229,0.35)] transition-colors cursor-pointer'
				>
					<Plus
						size={16}
						strokeWidth={2.5}
					/>
					Add Regret
				</button>

				<nav className='space-y-1'>
					{NAV_LINKS.map((link) => {
						const isActive = pathname === link.href;
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
									isActive ? 'text-white' : (
										'text-white/50 hover:text-white/80 hover:bg-white/4'
									)
								}`}
							>
								{isActive && (
									<motion.div
										layoutId='activeSidebarNav'
										className='absolute inset-0 bg-white/8 rounded-xl'
										transition={{
											type: 'spring',
											bounce: 0.2,
											duration: 0.4,
										}}
									/>
								)}
								<span className='relative z-10 flex items-center gap-3'>
									<link.icon
										size={16}
										strokeWidth={2}
									/>
									{link.label}
								</span>
								{navCounts[link.href] > 0 && (
									<span className='relative z-10 ml-auto text-xs tabular-nums text-white/35'>
										{navCounts[link.href]}
									</span>
								)}
							</Link>
						);
					})}
				</nav>
			</aside>

			{/* Content, offset for top bar + sidebar */}
			<div className='pt-14 sm:pt-16 md:pl-60 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0 flex-1 flex flex-col'>
				{children}
			</div>

			{/* Mobile bottom navigation */}
			<div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/8 px-2 pb-[env(safe-area-inset-bottom)]'>
				<div className='flex items-center justify-around h-14'>
					{NAV_LINKS.map((link) => {
						const isActive = pathname === link.href;
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
									isActive ? 'text-white' : 'text-white/40'
								}`}
							>
								{isActive && (
									<motion.div
										layoutId='activeMobileNav'
										className='absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-white rounded-full'
										transition={{
											type: 'spring',
											bounce: 0.2,
											duration: 0.4,
										}}
									/>
								)}
								<link.icon
									size={20}
									strokeWidth={isActive ? 2.5 : 2}
								/>
								<span className='text-[10px] font-semibold'>
									{link.label}
								</span>
							</Link>
						);
					})}
				</div>
			</div>

			<AddTransactionModal
				isOpen={transactionOpen}
				onClose={() => setTransactionOpen(false)}
				type='expense'
				userId={
					(session!.user as any)?.id || session!.user?.email || ''
				}
				onSuccess={() => setTransactionOpen(false)}
			/>
			<AuthModal
				isOpen={isAuthOpen}
				onClose={() => setIsAuthOpen(false)}
			/>
		</>
	);
}
