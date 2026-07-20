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
	Flame,
	StickyNote,
	User,
	Search,
	Zap,
	Plus,
	LucideProps,
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

import AuthModal from './AuthModal';

import { HOW_IT_WORKS, PLATFORM_FEATURES, TESTIMONIALS } from '@/constants';
import { useCounter } from '@/hooks/useCounter';
import { handleSmooth } from '@/utils';

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
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-[200vw] max-w-[2000px] h-[60vh] opacity-[0.09] bg-[radial-gradient(40.9%_81.1%_at_50%_0%,#ffffff_0%,rgba(0,0,0,0)_100%)]' />
				<div className='absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#9294e5]/[0.02] blur-3xl rounded-full' />
				<div className='absolute top-[45%] left-[-10%] w-[40%] h-[40%] bg-[#d39dbd]/[0.02] blur-3xl rounded-full' />
			</div>

			{/* ─── Hero ─── */}
			<section className='relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 sm:pt-24 pb-32 min-h-screen overflow-hidden'>
				<div className='inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] text-white/80 font-medium text-sm mb-8 border border-white/10 rounded-full'>
					<span className='relative flex h-2 w-2'>
						<span className='animate-ping absolute inline-flex h-full w-full bg-accent-gradient opacity-75 rounded-full' />
						<span className='relative inline-flex h-2 w-2 bg-accent-gradient rounded-full' />
					</span>
					Expense Tracker, Ledger & Notes
				</div>

				<div className='max-w-4xl mx-auto'>
					<h1 className='text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight mb-6 text-white text-gradient leading-[1.1]'>
						Track Every Terrible <br className='hidden md:block' />
						<span className='text-accent-gradient'>
							Financial Decision
						</span>
					</h1>

					<p className='text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed'>
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
								session  ?
									router.push('/regrets')
								:	setIsAuthOpen(true)
							}
							disabled={status === "loading"}
							className='bg-white hover:bg-white/90 text-black glow-white px-8 py-4 rounded-xl font-medium text-lg flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed'
						>
							{session ? 'View My Regrets' : status=== "loading" ? "Loading...." :  'Start Regretting'}{' '}
							<ArrowRight size={20} />
						</motion.button>
						<motion.a
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							href='#features'
							onClick={(e) => handleSmooth(e, 'features')}
							className='bg-white/[0.08] hover:bg-white/[0.14] text-white/80 border border-white/10 px-8 py-4 rounded-xl font-medium text-lg flex items-center gap-2 transition-all'
						>
							See Features
						</motion.a>
					</div>
				</div>

				{/* Floating ghost */}
				<motion.div
					animate={{ y: [0, -12, 0] }}
					transition={{
						duration: 3,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					className='mt-16 bg-black p-6 rounded-full border border-white/15 shadow-[0_0_50px_rgba(255,255,255,0.15)] text-white'
				>
					<Ghost
						size={48}
						strokeWidth={1.5}
					/>
				</motion.div>

				{/* Glowing horizon dome — ultramail's signature hero element */}
				<div className='absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[69%] w-[160%] sm:w-[110%] max-w-[1600px] h-[280px] pointer-events-none'>
					<div className='w-full h-full rounded-[100%] bg-black shadow-[0_-90px_132px_0_rgba(255,255,255,0.15),inset_0_124px_250px_0_rgba(255,255,255,0.23),inset_0_20px_28px_0_#ffffff]' />
				</div>
			</section>

			{/* ─── Stats Bar ─── */}
			<section
				ref={statsRef}
				className='relative z-10 bg-white/[0.03] backdrop-blur-xl border-y border-white/10 py-14'
			>
				<div className='max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-10 text-center'>
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
				<div className='max-w-6xl mx-auto'>
					<div className='text-center mb-14'>
						<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient'>
							Platform Features
						</span>
						<h2 className='text-4xl md:text-5xl font-medium tracking-tight mt-4 mb-4 text-white'>
							Everything You Need to{' '}
							<span className='text-gradient'>
								Feel Horrible
							</span>
						</h2>
						<p className='text-white/60 text-lg max-w-xl mx-auto'>
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
			<section className='relative z-10 py-20 px-[4%] sm:px-6 bg-white/[0.03] backdrop-blur-xl border-y border-white/10'>
				<div className='max-w-6xl mx-auto text-center'>
					<div className='mb-14'>
						<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient'>
							How It Works
						</span>
						<h2 className='text-4xl font-medium tracking-tight mt-4 text-white'>
							4 Steps to Financial{' '}
							<span className='text-gradient'>
								Self-Awareness
							</span>
						</h2>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{HOW_IT_WORKS.map((s, i) => (
							<div
								key={i}
								className='relative card-ultra rounded-2xl p-8 text-left group hover:-translate-y-1'
							>
								<span className='absolute top-5 right-6 text-6xl font-semibold text-white/5 select-none'>
									{s.step}
								</span>
								<div
									className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
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
								<h3 className='text-xl font-semibold text-white mb-2'>
									{s.title}
								</h3>
								<p className='text-white/60'>
									{s.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── Testimonials ─── */}
			<section className='relative z-10 py-24 px-[4%] sm:px-6'>
				<div className='max-w-6xl mx-auto'>
					<div className='text-center mb-14'>
						<span className='text-xs font-semibold tracking-[0.25em] uppercase text-accent-gradient'>
							Testimonials
						</span>
						<h2 className='text-4xl font-medium tracking-tight mt-4 text-white'>
							Loved by{' '}
							<span className='text-gradient'>
								Overspenders
							</span>{' '}
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
			<section className='relative z-10 py-20 px-4 sm:px-6'>
				<div className='max-w-6xl mx-auto relative'>
					{/* Faint hill silhouette behind the card */}
					<div className='absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-56 rounded-[100%] bg-white/[0.04] blur-3xl pointer-events-none' />

					<div className='relative bg-[#0b0b0d] border border-white/[0.07] rounded-[32px] overflow-hidden shadow-2xl shadow-black/60'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 sm:p-12 lg:p-16'>
							{/* Left — copy + CTA */}
							<div className='text-left'>
								<div className='w-16 h-16 rounded-full border border-white/15 bg-black flex items-center justify-center mb-10 shadow-[0_0_44px_rgba(255,255,255,0.1)]'>
									<Ghost
										size={28}
										className='text-white'
									/>
								</div>
								<h2 className='text-4xl sm:text-5xl font-medium tracking-tight text-gradient mb-5 leading-[1.12]'>
									Ready to Face Your
									<br />
									Financial Regrets?
								</h2>
								<p className='text-white/60 text-lg mb-10 max-w-md leading-relaxed'>
									Join thousands of users who track every
									questionable purchase and settle debts with
									style. Your wallet has feelings. Document
									them.
								</p>
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() =>
										session ?
											router.push('/regrets')
										:	setIsAuthOpen(true)
									}
									className='w-full sm:max-w-md bg-white hover:bg-white/90 text-black font-medium px-8 py-5 rounded-2xl text-xl glow-white transition-all flex items-center justify-between gap-4'
								>
									<span>
										{session ?
											'Open My Wall of Regret'
										:	'Get started for free'}
									</span>
									<ArrowRight size={24} />
								</motion.button>
							</div>

							{/* Right — mock app preview, bleeding off the card edge */}
							<div className='relative hidden lg:block lg:translate-x-10 lg:translate-y-4'>
								<div className='bg-[#101013] border border-white/[0.08] rounded-2xl overflow-hidden text-left shadow-2xl shadow-black/60'>
									{/* Top bar */}
									<div className='flex items-center justify-between gap-4 px-4 py-3 border-b border-white/[0.06]'>
										<div className='bg-black border border-white/15 rounded-full p-1 text-white shrink-0'>
											<Ghost size={14} />
										</div>
										<div className='flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/40 flex-1 max-w-xs'>
											<Search size={12} />
											Search your regrets…
										</div>
									</div>

									<div className='grid grid-cols-[120px_1fr]'>
										{/* Sidebar */}
										<div className='border-r border-white/[0.06] p-3'>
											<div className='flex items-center justify-center gap-1 bg-[#9294e5] text-black text-xs font-semibold rounded-lg px-2 py-2 mb-3'>
												<Plus size={12} />
												Add Regret
											</div>
											{[
												{ icon: Flame, label: 'Regrets', count: '3', active: true },
												{ icon: BookOpen, label: 'Ledger', count: '', active: false },
												{ icon: StickyNote, label: 'Notes', count: '1', active: false },
												{ icon: User, label: 'Profile', count: '', active: false },
											].map((item) => (
												<div
													key={item.label}
													className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs mb-0.5 ${
														item.active ?
															'bg-white/[0.08] text-white'
														:	'text-white/50'
													}`}
												>
													<item.icon size={12} />
													<span className='flex-1'>
														{item.label}
													</span>
													{item.count && (
														<span className='text-white/40 text-[10px]'>
															{item.count}
														</span>
													)}
												</div>
											))}
										</div>

										{/* Main list */}
										<div className='p-4'>
											<div className='text-sm text-white font-medium mb-3'>
												☀️ Good Morning, Regretter.
											</div>
											<div className='flex items-center gap-1.5 text-xs text-white/50 mb-2'>
												<Zap size={11} />
												Latest regrets
											</div>
											{[
												{ title: 'Swiggy — ₹450', sub: 'midnight biryani, again' },
												{ title: 'Amazon — ₹2,199', sub: '3rd mechanical keyboard' },
												{ title: 'Zomato — ₹320', sub: '“last time, I swear”' },
											].map((row) => (
												<div
													key={row.title}
													className='card-lavender rounded-lg px-3 py-2 mb-2'
												>
													<div className='text-xs text-white/90 font-medium'>
														{row.title}
													</div>
													<div className='text-[10px] text-white/40 mt-0.5'>
														{row.sub} · 2m ago
													</div>
												</div>
											))}
											<div className='flex items-center gap-2 px-3 py-2 text-[10px] text-white/40'>
												<span className='text-[#b9baf1]'>
													Draft
												</span>
												note to future self…
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ─── Footer — ultramail-style pill bar ─── */}
			<footer className='relative z-10 px-4 sm:px-6 pb-10'>
				<div className='max-w-6xl mx-auto bg-[#0b0b0d] border border-white/[0.08] rounded-2xl px-6 sm:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6'>
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
					<span className='font-semibold text-white/70'>
						Shubhanshu Saxena
					</span>
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
			<div className='mb-1'>{icon}</div>
			<div className='text-4xl md:text-5xl font-semibold tracking-tight text-white tabular-nums'>
				{value.toLocaleString()}
				{suffix}
			</div>
			<div className='text-white/50 font-medium text-sm uppercase tracking-wider'>
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
			initial={{ y: 30 }}
			transition={{ duration: 0.5 }}
			whileHover={{ y: -4 }}
			className='card-ultra p-6 rounded-2xl group relative overflow-hidden'
		>
			<div className='absolute -inset-2 bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none' />
			<div
				className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colors[color]}`}
			>
				<Icon size={22} />
			</div>
			<h3 className='text-lg font-semibold text-white mb-2'>
				{title}
			</h3>
			<p className='text-white/60 text-sm leading-relaxed'>
				{desc}
			</p>
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
		<div className='card-ultra rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1'>
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
					<p className='text-sm font-semibold text-white'>
						{name}
					</p>
					<p className='text-xs text-white/40'>
						{role}
					</p>
				</div>
			</div>
		</div>
	);
}
