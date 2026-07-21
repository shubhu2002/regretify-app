'use client';

import {
	useState,
	useRef,
	ForwardRefExoticComponent,
	RefAttributes,
} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import {
	ArrowRight,
	Ghost,
	Star,
	Users,
	Receipt,
	HeartCrack,
	BookOpen,
	StickyNote,
	LucideProps,
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

import AuthModal from './AuthModal';

import { HOW_IT_WORKS, PLATFORM_FEATURES, TESTIMONIALS } from '@/constants';
import { useCounter } from '@/hooks/useCounter';
import { handleSmooth } from '@/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
	const [isAuthOpen, setIsAuthOpen] = useState(false);
	const { data: session, status } = useSession();

	const router = useRouter();

	const statsRef = useRef(null);
	const statsInView = useInView(statsRef, { once: true });

	const users = useCounter(2400, 1000, statsInView);
	const transactions = useCounter(18500, 1000, statsInView);
	const ledgerEntries = useCounter(6200, 1000, statsInView);
	const saved = useCounter(94, 1000, statsInView);

	return (
		<div className='flex-1 flex flex-col bg-transparent overflow-x-hidden'>
			{/* Background — ultramail-style: white radial glow at top + faint pastel washes */}
			<div className='fixed inset-0 overflow-hidden pointer-events-none z-0'>
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-[200vw] max-w-500 h-[60vh] opacity-[0.09] bg-[radial-gradient(40.9%_81.1%_at_50%_0%,#ffffff_0%,rgba(0,0,0,0)_100%)]' />
				<div className='absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#9294e5]/2 blur-3xl rounded-full' />
				<div className='absolute top-[45%] left-[-10%] w-[40%] h-[40%] bg-[#d39dbd]/2 blur-3xl rounded-full' />
			</div>

			{/* ─── Hero ─── */}
			<section className='relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 sm:pt-48 pb-32 min-h-screen'>
				<div className='inline-flex items-center gap-2 px-4 py-2 bg-white/3 text-white/80 font-medium text-sm mb-6 sm:mb-8 border border-white/10 rounded-full'>
					<span className='relative flex h-2 w-2'>
						<span className='animate-ping absolute inline-flex h-full w-full bg-accent-gradient opacity-75 rounded-full' />
						<span className='relative inline-flex h-2 w-2 bg-accent-gradient rounded-full' />
					</span>
					Expense Tracker, Ledger & Notes
				</div>

				<div className='max-w-4xl mx-auto'>
					<h1 className='text-4xl md:text-7xl font-medium tracking-tight mb-4 sm:mb-6 text-white text-gradient leading-[1.1]'>
						Track Every Terrible <br className='hidden md:block' />
						<span className='text-accent-gradient'>
							Financial Decision
						</span>
					</h1>

					<p className='text-base sm:text-lg md:text-xl text-white/70 mb-8 sm:mb-10 max-w-2xl mx-auto'>
						Log your regrets, track who owes you (and who you owe),
						scribble notes & checklists, visualize your despair, and
						export your financial trauma — all in one beautifully
						designed, painfully honest app.
					</p>

					<div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
						<motion.button
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							onClick={() =>
								session ?
									router.push('/regrets')
								:	setIsAuthOpen(true)
							}
							disabled={status === 'loading'}
							className='bg-[#9294e5] hover:bg-[#a3a5ec] text-black glow-periwinkle px-4 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed'
						>
							{session ?
								'View My Regrets'
							: status === 'loading' ?
								'Loading....'
							:	'Start Regretting'}{' '}
							<ArrowRight size={20} />
						</motion.button>
						<motion.a
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							href='#features'
							onClick={(e) => handleSmooth(e, 'features')}
							className='bg-white/8 hover:bg-white/[0.14] text-white/80 border border-white/10 px-4 py-3 sm:px-8 sm:py-4 rounded-xl font-medium text-base sm:text-lg flex items-center gap-2 transition-all'
						>
							See Features
						</motion.a>
					</div>
				</div>

				{/* Glowing horizon dome — ultramail's signature hero element */}
				<div className='fixed -z-50 bottom-0 left-1/2 -translate-x-1/2 translate-y-[69%] w-[160%] sm:w-[110%] max-w-400 h-70 pointer-events-none'>
					<div className='w-full h-full rounded-[100%] bg-black shadow-[0_-90px_132px_0_rgba(255,255,255,0.15),inset_0_124px_250px_0_rgba(255,255,255,0.23),inset_0_20px_28px_0_#ffffff]' />
				</div>

				<motion.div
					initial={{ opacity: 0, y: 48 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						delay: 0.25,
						duration: 0.8,
						ease: 'easeOut',
					}}
					className='relative z-10 w-full mx-auto mt-12 sm:mt-28 flex justify-center'
				>
					<div className='relative rounded-2xl max-w-310 sm:rounded-[40px] border border-white/6 overflow-hidden bg-[#050506]'>
						<div className='flex items-center justify-center'>
							<Image
								width={9999}
								height={9999}
								src='/dashboard-preview.png'
								alt='Regretify dashboard — Wall of Regret with live charts, categories and history'
								className='w-full h-auto '
							/>
						</div>
						{/* Gentle overall dim so it sits back into the canvas */}
						<div className='absolute inset-0 bg-linear-180 from-transparent via-black/10 to-black/80 pointer-events-none mix' />
					</div>
				</motion.div>
			</section>

			{/* ─── Stats Bar ─── */}
			<section
				ref={statsRef}
				className='relative z-10 bg-white/3 backdrop-blur-xl border-y border-white/10 py-14'
			>
				<div className='max-w-310 mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-10 text-center'>
					<StatItem
						value={users}
						suffix='+'
						label='Regretful Users'
						icon={
							<Users
								size={32}
								className='text-[#b9baf1]'
							/>
						}
					/>
					<StatItem
						value={transactions}
						suffix='+'
						label='Transactions Saved'
						icon={
							<Receipt
								size={32}
								className='text-[#e7c1d8]'
							/>
						}
					/>
					<StatItem
						value={ledgerEntries}
						suffix='+'
						label='Ledger Entries'
						icon={
							<BookOpen
								size={32}
								className='text-[#cbf1fd]'
							/>
						}
					/>
					<StatItem
						value={saved}
						suffix='%'
						label='Users Cry Less'
						icon={
							<HeartCrack
								size={32}
								className='text-[#f0f8e8]'
							/>
						}
					/>
				</div>
			</section>

			{/* ─── Features ─── */}
			<section
				id='features'
				className='relative z-10 py-24 px-[4%] sm:px-6'
			>
				<div className='max-w-310 mx-auto'>
					<div className='text-center mb-14'>
						<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient'>
							Platform Features
						</span>
						<h2 className='text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mt-4 mb-4 text-white'>
							Everything You Need to{' '}
							<span className='text-gradient'>Feel Horrible</span>
						</h2>
						<p className='text-white/60 text-base sm:text-lg max-w-xl mx-auto'>
							A full financial regrets dashboard, personal ledger,
							and notes app — packed with every tool to track,
							visualize, and settle your greatest money mistakes.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{PLATFORM_FEATURES.map((f, i) => (
							<FeatureCard
								key={i}
								index={i}
								icon={f.icon}
								title={f.title}
								desc={f.desc}
								color={f.color}
							/>
						))}
					</div>
				</div>
			</section>

			{/* ─── How it works ─── */}
			<section className='relative z-10 py-20 px-[4%] sm:px-6 bg-white/3 backdrop-blur-xl border-y border-white/10'>
				<div className='max-w-310 mx-auto text-center'>
					<div className='mb-14'>
						<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient'>
							How It Works
						</span>
						<h2 className='text-3xl sm:text-4xl font-medium tracking-tight mt-4 text-white'>
							4 Steps to Financial{' '}
							<span className='text-gradient'>
								Self-Awareness
							</span>
						</h2>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{HOW_IT_WORKS.map((s, i) => (
							<motion.div
								key={i}
								initial={{ scale: 1 }}
								transition={{
									duration: 0.2,
									ease: 'easeInOut',
								}}
								whileHover={{ scale: 1.02 }}
								className='relative card-ultra rounded-2xl p-4 sm:p-6 text-left'
							>
								<span className='absolute top-5 right-6 text-310 font-semibold text-white/5 select-none'>
									{s.step}
								</span>
								<div
									className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 sm:mb-5 ${
										[
											'bg-[#f0f8e8]/10 text-[#f0f8e8]',
											'bg-[#d39dbd]/15 text-[#e7c1d8]',
											'bg-[#9294e5]/15 text-[#b9baf1]',
											'bg-[#cbf1fd]/10 text-[#cbf1fd]',
										][i % 4]
									}`}
								>
									<s.icon size={22} />
								</div>
								<h3 className='text-lg sm:text-xl font-semibold text-white mb-2'>
									{s.title}
								</h3>
								<p className='text-sm text-white/60'>{s.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* ─── Testimonials ─── */}
			<section className='relative z-10 pb-14 sm:py-20 px-[4%] sm:px-6'>
				<div className='max-w-310 mx-auto'>
					<div className='text-center mb-14'>
						<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient'>
							Testimonials
						</span>
						<h2 className='text-3xl sm:text-4xl font-medium tracking-tight mt-4 text-white'>
							Loved by{' '}
							<span className='text-gradient'>Overspenders</span>{' '}
							Everywhere
						</h2>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{TESTIMONIALS.map((t, i) => (
							<TestimonialCard
								key={i}
								index={i}
								{...t}
							/>
						))}
					</div>
				</div>
			</section>

			{/* ─── CTA Banner — ultramail-style closing card ─── */}
			<section className='relative z-10 pb-14 sm:py-20 px-4 sm:px-6'>
				<div className='max-w-310 mx-auto relative'>
					{/* Faint hill silhouette behind the card */}
					<div className='absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-56 rounded-[100%] bg-white/4 blur-3xl pointer-events-none' />

					<div className='relative bg-[#0b0b0d] border border-white/[0.07] rounded-4xl overflow-hidden shadow-2xl shadow-black/60'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 sm:p-12 lg:p-16'>
							{/* Left — copy + CTA */}
							<div className='text-left'>
								<div className='w-16 h-16 rounded-full border border-white/15 bg-black flex items-center justify-center mb-6 sm:mb-10 shadow-[0_0_44px_rgba(255,255,255,0.1)]'>
									<Ghost
										size={28}
										className='text-white'
									/>
								</div>
								<h2 className='text-3xl sm:text-5xl font-medium tracking-tight text-gradient mb-5 leading-[1.12]'>
									Track it. Settle it.
									<br />
									<span className='text-accent-gradient'>
										Regret it beautifully.
									</span>
								</h2>
								<p className='text-white/60 text-base sm:text-lg mb-7 sm:mb-10 max-w-md'>
									Log the splurges, settle the debts, pin the
									promises — regrets, ledger &amp; notes in
									one painfully honest app. Your wallet has
									feelings. Document them.
								</p>
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() =>
										session ?
											router.push('/regrets')
										:	setIsAuthOpen(true)
									}
									className='w-full sm:max-w-md cursor-pointer bg-[#9294e5] hover:bg-[#a3a5ec] text-black font-semibold px-6 py-4 sm:px-8 sm:py-5 rounded-2xl text-base sm:text-xl glow-periwinkle transition-all flex items-center justify-between gap-4'
								>
									<span>
										{session ?
											'Open My Wall of Regret'
										:	'Get started for free'}
									</span>
									<ArrowRight size={24} />
								</motion.button>
							</div>

							{/* Right — layered app showcase: real dashboard + floating ledger & notes cards */}
							<div className='relative hidden lg:block lg:translate-x-6 lg:translate-y-2'>
								{/* Real dashboard screenshot (Regrets) */}
								<div className='relative rounded-2xl border border-white/8 overflow-hidden bg-[#0b0b0d] shadow-2xl shadow-black/70'>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src='/dashboard-preview.png'
										alt='Regretify dashboard — Wall of Regret with charts and history'
										className='w-full h-auto'
									/>
									<div className='absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20 pointer-events-none' />
								</div>

								{/* Floating ledger mini-card */}
								<motion.div
									animate={{ y: [0, -7, 0] }}
									transition={{
										duration: 4,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
									className='absolute -left-12 -bottom-8 w-60 bg-[#101013] border border-white/8 rounded-xl p-3.5 shadow-2xl shadow-black/80 text-left'
								>
									<div className='flex items-center gap-2 mb-2.5'>
										<div className='w-7 h-7 rounded-lg bg-[#9294e5]/15 text-[#b9baf1] flex items-center justify-center shrink-0'>
											<BookOpen size={13} />
										</div>
										<span className='text-xs font-semibold text-white'>
											Ledger · Sara
										</span>
									</div>
									<div className='space-y-1.5'>
										<div className='flex items-center justify-between text-[11px]'>
											<span className='px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold'>
												You Got
											</span>
											<span className='text-emerald-400 font-semibold tabular-nums'>
												+₹2,000
											</span>
										</div>
										<div className='flex items-center justify-between text-[11px]'>
											<span className='px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold'>
												You Gave
											</span>
											<span className='text-red-400 font-semibold tabular-nums'>
												-₹10,048
											</span>
										</div>
									</div>
									<div className='mt-2.5 pt-2 border-t border-white/6 flex items-center justify-between text-[11px]'>
										<span className='text-white/40'>
											Balance
										</span>
										<span className='text-red-400 font-semibold tabular-nums'>
											-₹8,048
										</span>
									</div>
								</motion.div>

								{/* Floating notes mini-card */}
								<motion.div
									animate={{ y: [0, -6, 0] }}
									transition={{
										duration: 3.2,
										repeat: Infinity,
										ease: 'easeInOut',
										delay: 0.6,
									}}
									className='absolute -right-8 -top-8 w-52 bg-[#101013] border border-white/8 rounded-xl p-3.5 shadow-2xl shadow-black/80 text-left'
								>
									<div className='flex items-center gap-2 mb-2'>
										<div className='w-7 h-7 rounded-lg bg-[#f0f8e8]/10 text-[#f0f8e8] flex items-center justify-center shrink-0'>
											<StickyNote size={13} />
										</div>
										<span className='text-xs font-semibold text-white flex-1'>
											Movies To Watch
										</span>
										<Star
											size={11}
											className='text-amber-400 fill-amber-400 shrink-0'
										/>
									</div>
									<div className='space-y-1 text-[11px] text-white/60'>
										<p>
											☑{' '}
											<span className='line-through text-white/35'>
												I want to eat your pancreas
											</span>
										</p>
										<p>☐ Young Sheldon S2</p>
										<p>☐ Interstellar</p>
									</div>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ─── Footer — ultramail-style pill bar ─── */}
			<footer className='relative z-10 px-4 sm:px-6 pb-10'>
				<div className='max-w-310 mx-auto bg-[#0b0b0d] border border-white/8 rounded-2xl px-6 sm:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6'>
					<div className='flex items-center gap-2'>
						<div className='bg-black p-2 border border-white/15 rounded-full text-white shadow-[0_0_16px_rgba(255,255,255,0.1)]'>
							<Ghost size={18} />
						</div>
						<span className='text-lg font-semibold text-white tracking-tight'>
							Regretify
						</span>
					</div>

					<div className='flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-white/80'>
						<div className='flex items-center gap-2 hover:text-white transition-colors cursor-pointer'>
							<FaGithub size={14} />
							GitHub
						</div>
						<div className='flex items-center gap-2 hover:text-white transition-colors cursor-pointer'>
							<FaTwitter size={14} />
							Twitter
						</div>
						<div className='flex items-center gap-2 hover:text-white transition-colors cursor-pointer'>
							<FaLinkedin size={14} />
							LinkedIn
						</div>
						<span className='text-white/40'>
							&copy; {new Date().getFullYear()} Regretify
						</span>
					</div>
				</div>
				<p className='text-center text-white/40 text-xs mt-4'>
					Track regrets. Settle debts. Learn nothing. Repeat. —
					Designed &amp; Developed with 💜 by{' '}
					<Link suppressHydrationWarning href={"https://github.com/shubhu2002"} target='_blank' className='font-semibold text-white/70 hover:underline'>
						Shubhanshu Saxena
					</Link>
				</p>
			</footer>

			<AuthModal
				isOpen={isAuthOpen}
				onClose={() => setIsAuthOpen(false)}
			/>
		</div>
	);
}

// ─── Sub Components ───

function StatItem({
	value,
	suffix,
	label,
	icon,
}: {
	value: number;
	suffix: string;
	label: string;
	icon: React.ReactNode;
}) {
	return (
		<div className='flex flex-col items-center gap-2'>
			<div className='sm:mb-1'>{icon}</div>
			<div className='text-[28px] sm:text-4xl md:text-5xl font-semibold tracking-tight text-white tabular-nums'>
				{value.toLocaleString()}
				{suffix}
			</div>
			<div className='text-white/50 font-medium text-xs -mt-1 sm:mt-0 sm:text-sm uppercase tracking-wider'>
				{label}
			</div>
		</div>
	);
}

function FeatureCard({
	icon: Icon,
	title,
	desc,
	color,
}: {
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
	>;
	title: string;
	desc: string;
	color: string;
	index: number;
}) {
	const colors: Record<string, string> = {
		violet: 'bg-[#9294e5]/15 text-[#b9baf1]',
		fuchsia: 'bg-[#d39dbd]/15 text-[#e7c1d8]',
		indigo: 'bg-[#cbf1fd]/10 text-[#cbf1fd]',
	};
	return (
		<motion.div
			initial={{ scale: 1 }}
			transition={{ duration: 0.2, ease: 'easeInOut' }}
			whileHover={{ scale: 1.02 }}
			className='card-ultra p-4 sm:p-6 rounded-2xl group relative overflow-hidden'
		>
			<div className='absolute -inset-2 bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none' />
			<div
				className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colors[color]}`}
			>
				<Icon size={22} />
			</div>
			<h3 className='text-lg font-semibold text-white mb-2'>{title}</h3>
			<p className='text-white/60 text-sm leading-relaxed'>{desc}</p>
		</motion.div>
	);
}

function TestimonialCard({
	name,
	role,
	avatar,
	stars,
	text,
}: {
	name: string;
	role: string;
	avatar: string;
	stars: number;
	text: string;
	index: number;
}) {
	return (
		<motion.div
			initial={{ scale: 1 }}
			transition={{ duration: 0.2, ease: 'easeInOut' }}
			whileHover={{ scale: 1.02 }}
			className='card-ultra rounded-2xl p-4 sm:p-6 flex flex-col gap-4'
		>
			<div className='flex items-center gap-1'>
				{Array.from({ length: stars }).map((_, i) => (
					<Star
						key={i}
						size={14}
						fill='#d39dbd'
						stroke='none'
					/>
				))}
			</div>
			<p className='text-white/75 text-sm leading-relaxed flex-1'>
				&ldquo;{text}&rdquo;
			</p>
			<div className='flex items-center gap-3 pt-2 border-t border-white/10'>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={avatar}
					alt={name}
					className='w-10 h-10 rounded-full bg-white/10 object-cover'
				/>
				<div>
					<p className='text-sm font-semibold text-white'>{name}</p>
					<p className='text-xs text-white/40'>{role}</p>
				</div>
			</div>
		</motion.div>
	);
}
