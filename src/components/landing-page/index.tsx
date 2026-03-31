'use client';

import { motion, useInView } from 'framer-motion';
import {
	ArrowRight,
	Ghost,
	BarChart3,
	ShieldCheck,
	Download,
	Filter,
	Calculator,
	Moon,
	Star,
	TrendingDown,
	PiggyBank,
	Zap,
	Users,
	Receipt,
	HeartCrack,
	CalendarDays,
	FileText,
	LucideProps,
} from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import {
	useState,
	useRef,
	useEffect,
	ForwardRefExoticComponent,
	RefAttributes,
} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import AuthModal from './AuthModal';

function useCounter(target: number, duration = 1000, inView = false) {
	const [count, setCount] = useState(0);
	useEffect(() => {
		if (!inView) return;
		let start = 0;
		const step = target / (duration / 16);
		const timer = setInterval(() => {
			start += step;
			if (start >= target) {
				setCount(target);
				clearInterval(timer);
			} else setCount(Math.floor(start));
		}, 16);
		return () => clearInterval(timer);
	}, [target, duration, inView]);
	return count;
}

export default function LandingPage() {
	const [isAuthOpen, setIsAuthOpen] = useState(false);
	const { data: session } = useSession();
	const router = useRouter();

	const handleSmooth = (
		e: React.MouseEvent<HTMLAnchorElement>,
		id: string,
	) => {
		e.preventDefault();
		document
			.getElementById(id)
			?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const statsRef = useRef(null);
	const statsInView = useInView(statsRef, { once: true });

	const users = useCounter(2400, 1000, statsInView);
	const transactions = useCounter(18500, 1000, statsInView);
	const saved = useCounter(94, 1000, statsInView);

	return (
		<div className='flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-x-hidden'>
			{/* Background blobs */}
			<div className='fixed inset-0 overflow-hidden pointer-events-none z-0'>
				<div className='absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 dark:bg-violet-500/5 blur-3xl rounded-full' />
				<div className='absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 dark:bg-fuchsia-500/5 blur-3xl rounded-full' />
				<div className='absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-indigo-500/5 blur-3xl rounded-full' />
			</div>

			{/* ─── Hero ─── */}
			<section className='relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 sm:pt-24 pb-20 min-h-screen'>
				<div
					className='inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium text-sm mb-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-full'
				>
					<span className='relative flex h-2 w-2'>
						<span className='animate-ping absolute inline-flex h-full w-full bg-violet-400 opacity-75 rounded-full' />
						<span className='relative inline-flex h-2 w-2 bg-violet-500 rounded-full' />
					</span>
					Next-Generation Financial Regret Tracker
				</div>

				<div

					className='max-w-4xl mx-auto'
				>
					<h1 className='text-4xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-[1.1]'>
						Track Every Terrible <br className='hidden md:block' />
						<span className='bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'>
							Financial Decision
						</span>
					</h1>

					<p className='text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed'>
						Log your regrets, visualize your despair, and export
						your financial trauma — all in one beautifully designed,
						painfully honest dashboard.
					</p>

					<div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
						<motion.button
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							onClick={() =>
								session ?
									router.push('/dashboard')
									: setIsAuthOpen(true)
							}
							className='bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/30 px-6 py-3 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all'
						>
							{session ? 'Go to Dashboard' : 'Start Regretting'}{' '}
							<ArrowRight size={20} />
						</motion.button>
						<motion.a
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							href='#features'
							onClick={(e) => handleSmooth(e, 'features')}
							className='bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-xl font-semibold text-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all'
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
					className='mt-16 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl text-violet-600 dark:text-violet-400'
				>
					<Ghost
						size={48}
						strokeWidth={1.5}
					/>
				</motion.div>
			</section>

			{/* ─── Stats Bar ─── */}
			<section
				ref={statsRef}
				className='relative z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-y border-slate-200 dark:border-slate-800 py-14'
			>
				<div className='max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center'>
					<StatItem
						value={users}
						suffix='+'
						label='Regretful Users'
						icon={
							<Users
								size={32}
								className='text-violet-500'
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
								className='text-fuchsia-500'
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
								className='text-rose-400'
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
					<div
						className='text-center mb-14'
					>
						<span className='text-sm font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-4 py-1.5 rounded-full'>
							Platform Features
						</span>
						<h2 className='text-4xl md:text-5xl font-extrabold mt-4 mb-4 text-slate-900 dark:text-white'>
							Everything You Need to{' '}
							<span className='bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'>
								Feel Horrible
							</span>
						</h2>
						<p className='text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto'>
							A full financial dashboard packed with every tool to
							track, visualize, and export your greatest money
							mistakes.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{[
							{
								icon: BarChart3,
								title: 'Live Charts & Trends',
								desc: 'Beautiful glassmorphism charts that update in real-time as you log your latest terrible decisions.',
								color: 'violet',
							},
							{
								icon: Filter,
								title: 'Month-Wise Filtering',
								desc: 'Filter transactions by any month of the year. See exactly how bad January really was.',
								color: 'fuchsia',
							},
							{
								icon: Download,
								title: 'Export to PDF',
								desc: 'Generate a polished PDF report of filtered transactions with color-coded amounts and a financial summary box.',
								color: 'indigo',
							},
							{
								icon: Calculator,
								title: 'Built-in Calculator',
								desc: 'Type expressions like 120+50 directly in the amount field. Perfect for splitting that Swiggy-binge guilt.',
								color: 'violet',
							},
							{
								icon: CalendarDays,
								title: 'Exact Timestamps',
								desc: 'Every transaction is saved with the current time down to the second — no more missing 00:00 times.',
								color: 'fuchsia',
							},
							{
								icon: Moon,
								title: 'Dark & Light Mode',
								desc: 'Because your financial regret should look good in any lighting. Polished theme toggle, no system default hassle.',
								color: 'indigo',
							},
							{
								icon: ShieldCheck,
								title: 'Secure Auth',
								desc: 'Powered by Google OAuth via NextAuth. Your financial misery is protected at the highest level.',
								color: 'violet',
							},
							{
								icon: FileText,
								title: 'Category Insights',
								desc: 'Track spending by category: Food, Bills, Vehicle, Entertainment, and more. Know whats eating you.',
								color: 'fuchsia',
							},
							{
								icon: Zap,
								title: 'Instant Updates',
								desc: 'TanStack Query keeps your dashboard blazing fast. Add a transaction, see it appear instantly everywhere.',
								color: 'indigo',
							},
						].map((f, i) => (
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
			<section className='relative z-10 py-20 px-[4%] sm:px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-y border-slate-200 dark:border-slate-800'>
				<div className='max-w-5xl mx-auto text-center'>
					<div
						className='mb-14'
					>
						<span className='text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-900/30 px-4 py-1.5 rounded-full'>
							How It Works
						</span>
						<h2 className='text-4xl font-extrabold mt-4 text-slate-900 dark:text-white'>
							3 Steps to Financial{' '}
							<span className='bg-clip-text text-transparent bg-linear-to-r from-fuchsia-600 to-violet-600 dark:from-fuchsia-400 dark:to-violet-400'>
								Self-Awareness
							</span>
						</h2>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						{[
							{
								step: '01',
								icon: ShieldCheck,
								title: 'Sign In Securely',
								desc: 'Login instantly using your Google account. No passwords, no fuss, no excuses.',
							},
							{
								step: '02',
								icon: TrendingDown,
								title: 'Log Your Regrets',
								desc: 'Add income and expenses with categories, payment methods, and the built-in calculator.',
							},
							{
								step: '03',
								icon: PiggyBank,
								title: 'Face the Truth',
								desc: 'View charts, filter by month, and export a PDF of your misery to share or cry over.',
							},
						].map((s, i) => (
							<div
								key={i}
								className='relative bg-violet-50/60 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 backdrop-blur-xl rounded-3xl p-8 text-left group hover:-translate-y-1 transition-all'
							>
								<span className='absolute top-5 right-6 text-6xl font-black text-slate-100 dark:text-slate-800 select-none'>
									{s.step}
								</span>
								<div className='w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-800/40 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-5'>
									<s.icon size={22} />
								</div>
								<h3 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>
									{s.title}
								</h3>
								<p className='text-slate-500 dark:text-slate-400'>
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
					<div
						className='text-center mb-14'
					>
						<span className='text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-4 py-1.5 rounded-full'>
							Testimonials
						</span>
						<h2 className='text-4xl font-extrabold mt-4 text-slate-900 dark:text-white'>
							Loved by{' '}
							<span className='bg-clip-text text-transparent bg-linear-to-r from-rose-500 to-fuchsia-600 dark:from-rose-400 dark:to-fuchsia-400'>
								Overspenders
							</span>{' '}
							Everywhere
						</h2>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{[
							{
								name: 'Aarav Mehta',
								role: 'Startup Founder & Impulsive Buyer',
								avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
								stars: 5,
								text: 'I cried when I saw 37% of my income went to Swiggy. But at least the chart was beautiful. Regretify is painfully honest and I love it.',
							},
							{
								name: 'Priya Sharma',
								role: 'Software Engineer & Coffee Addict',
								avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
								stars: 5,
								text: 'The PDF export is insanely good. I sent it to my CA and she was impressed. She also told me to stop buying so many courses I never finish.',
							},
							{
								name: 'Rahul Verma',
								role: 'Freelancer & Netflix Subscriber (5 accounts)',
								avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
								stars: 5,
								text: 'Month filter saved me. I filter by January to see my post-holiday damage. It screams louder than my mom. 10/10 regret tracking.',
							},
							{
								name: 'Sneha Patel',
								role: 'Designer & Impulse Shopper',
								avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
								stars: 4,
								text: 'The dark mode + glassmorphism aesthetic actually makes me feel better about my poor decisions. The ghost icon is my spirit animal at this point.',
							},
							{
								name: 'Karan Singh',
								role: 'Data Analyst & Part-time Petrol Buyer',
								avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karan',
								stars: 5,
								text: "Filtering by category showed me I spend more on Entertainment than rent. The charts don't lie. Regretify changed my financial consciousness.",
							},
							{
								name: 'Ananya Roy',
								role: 'Student & Future CTO (after saving money)',
								avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
								stars: 5,
								text: "The built-in calculator in the add modal is chef's kiss. I split bills instantly. The transitions are so smooth I keep adding expenses just to watch the table animate.",
							},
						].map((t, i) => (
							<TestimonialCard
								key={i}
								index={i}
								{...t}
							/>
						))}
					</div>
				</div>
			</section>

			{/* ─── CTA Banner ─── */}
			<section className='relative z-10 py-20 px-6'>
				<div

					className='max-w-4xl mx-auto bg-linear-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-12 text-center shadow-2xl shadow-violet-600/20 relative overflow-hidden'
				>
					<div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none' />
					<Ghost
						size={40}
						className='mx-auto mb-4 text-white/60'
					/>
					<h2 className='text-3xl md:text-4xl font-extrabold text-white mb-4'>
						Ready to Face Your Financial Regrets?
					</h2>
					<p className='text-violet-100 text-lg mb-8 max-w-xl mx-auto'>
						Join thousands of users who track every questionable
						purchase with style. Your wallet has feelings. Document
						them.
					</p>
					<motion.button
						whileHover={{ scale: 1.04 }}
						whileTap={{ scale: 0.96 }}
						onClick={() =>
							session ?
								router.push('/dashboard')
								: setIsAuthOpen(true)
						}
						className='bg-white text-violet-700 font-bold px-6 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto'
					>
						{session ? 'Go to Dashboard' : 'Get Started Free'}{' '}
						<ArrowRight size={20} />
					</motion.button>
				</div>
			</section>

			{/* ─── Footer ─── */}
			<footer className='relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl pt-10 pb-6 px-[4%] sm:px-6'>
				<div className='max-w-6xl mx-auto flex flex-col sm:flex-row  sm:justify-between items-center sm:items-end gap-4 text-center'>
					<div className='text-center sm:text-left flex flex-col items-center sm:items-start'>
						<div className='flex items-center gap-2 mb-4'>
							<div className='bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-violet-600 dark:text-violet-400'>
								<Ghost size={20} />
							</div>
							<span className='text-xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
								Regretify
							</span>
						</div>
						<p className='text-slate-500 dark:text-slate-400 text-sm'>
							Track regrets. Learn nothing. Repeat.
							<br />
							Your financial therapy, one dashboard at a time.
						</p>
					</div>
					<div className='sm:hidden w-16 h-px bg-slate-200 dark:bg-slate-700 mt-2' />
					<div>
						<div className='flex items-center justify-center gap-3 mb-2'>
							<div
								// href='https://github.com/shubhu2002'
								// target='_blank'
								// rel='noopener noreferrer'
								className='p-2 rounded-lg  text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-400 transition-all'
							>
								<FaGithub size={16} />
							</div>

							<div
								// href='https://twitter.com/your-username'
								// target='_blank'
								// rel='noopener noreferrer'
								className='p-2 rounded-lg  text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-400 transition-all'
							>
								<FaTwitter size={16} />
							</div>

							<div
								// href='https://linkedin.com/in/your-username'
								// target='_blank'
								// rel='noopener noreferrer'
								className='p-2 rounded-lg  text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-400 transition-all'
							>
								<FaLinkedin size={16} />
							</div>
						</div>

						<p className='text-slate-400 dark:text-slate-500 text-sm'>
							&copy; {new Date().getFullYear()} Regretify. All
							rights reserved.
						</p>
						<p className='text-slate-400 dark:text-slate-500 text-xs mt-1'>
							Designed &amp; Developed with 💜 by{' '}
							<span className='font-semibold text-violet-600 dark:text-violet-400'>
								Shubhanshu Saxena
							</span>
						</p>
					</div>
				</div>
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
		<div

			className='flex flex-col items-center gap-2'
		>
			<div className='mb-1'>{icon}</div>
			<div className='text-4xl md:text-5xl font-black text-slate-900 dark:text-white tabular-nums'>
				{value.toLocaleString()}
				{suffix}
			</div>
			<div className='text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider'>
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
	index,
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
		violet: 'bg-violet-100 dark:bg-violet-800/30 text-violet-600 dark:text-violet-400',
		fuchsia:
			'bg-fuchsia-100 dark:bg-fuchsia-800/30 text-fuchsia-600 dark:text-fuchsia-400',
		indigo: 'bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-400',
	};
	return (
		<motion.div
			initial={{ y: 30 }}
			transition={{ duration: 0.5 }}
			whileHover={{ y: -4 }}
			className='bg-violet-50/60 dark:bg-violet-900/20 backdrop-blur-xl border border-violet-100 dark:border-violet-800/30 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden'
		>
			<div className='absolute -inset-2 bg-linear-to-r from-transparent via-white/30 to-transparent dark:via-white/5 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none' />
			<div
				className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colors[color]}`}
			>
				<Icon size={22} />
			</div>
			<h3 className='text-lg font-bold text-slate-900 dark:text-white mb-2'>
				{title}
			</h3>
			<p className='text-slate-500 dark:text-slate-400 text-sm leading-relaxed'>
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
	index,
}: {
	name: string;
	role: string;
	avatar: string;
	stars: number;
	text: string;
	index: number;
}) {
	return (
		<div

			className='bg-violet-50/60 dark:bg-violet-900/20 backdrop-blur-xl border border-violet-100 dark:border-violet-800/30 rounded-3xl p-6 shadow-sm flex flex-col gap-4 hover:-translate-y-1 transition-all'
		>
			<div className='flex items-center gap-1'>
				{Array.from({ length: stars }).map((_, i) => (
					<Star
						key={i}
						size={14}
						fill='#f59e0b'
						stroke='none'
					/>
				))}
			</div>
			<p className='text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1'>
				&ldquo;{text}&rdquo;
			</p>
			<div className='flex items-center gap-3 pt-2 border-t border-violet-100 dark:border-violet-800/30'>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={avatar}
					alt={name}
					className='w-10 h-10 rounded-full bg-slate-100 object-cover'
				/>
				<div>
					<p className='text-sm font-semibold text-slate-900 dark:text-white'>
						{name}
					</p>
					<p className='text-xs text-slate-400 dark:text-slate-500'>
						{role}
					</p>
				</div>
			</div>
		</div>
	);
}
