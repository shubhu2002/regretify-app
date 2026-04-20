import {
	BarChart3,
	ShieldCheck,
	Download,
	Filter,
	Calculator,
	Moon,
	TrendingDown,
	PiggyBank,
	Zap,
	CalendarDays,
	BookOpen,
	ArrowUpRight,
} from 'lucide-react';

export const PLATFORM_FEATURES = [
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
		icon: BookOpen,
		title: 'Personal Ledger',
		desc: 'Add accounts for friends, family, or anyone. Track money you give and take with a dedicated ledger page.',
		color: 'violet',
	},
	{
		icon: ArrowUpRight,
		title: 'Give & Take Tracking',
		desc: 'Log every "I\'ll pay you back" with amounts, dates, and descriptions. Red for given, green for received — no more guessing.',
		color: 'fuchsia',
	},
	{
		icon: Zap,
		title: 'Instant Sync',
		desc: 'TanStack Query keeps everything blazing fast. Add an entry, see balances update instantly across the app.',
		color: 'indigo',
	},
];

export const HOW_IT_WORKS = [
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
		icon: BookOpen,
		title: 'Track Who Owes Who',
		desc: 'Add people to your ledger. Log every give & take with amounts, dates, and running balances.',
	},
	{
		step: '04',
		icon: PiggyBank,
		title: 'Face the Truth',
		desc: 'View charts, settle debts, filter by month, and export a PDF of your misery.',
	},
];

export const TESTIMONIALS = [
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
		role: 'Designer & Group Trip Organizer',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
		stars: 5,
		text: 'The Ledger feature is a lifesaver. I added all my flatmates and now I know exactly who owes me for groceries. No more awkward "bro, transfer karna" texts.',
	},
	{
		name: 'Karan Singh',
		role: 'Data Analyst & Part-time Petrol Buyer',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karan',
		stars: 5,
		text: "I track every give & take with my friends in the Ledger. The running balance per person is *chef's kiss*. Regretify turned me into the group accountant nobody asked for.",
	},
	{
		name: 'Ananya Roy',
		role: 'Student & Future CTO (after saving money)',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
		stars: 5,
		text: "The built-in calculator in the add modal is chef's kiss. I split bills instantly. The transitions are so smooth I keep adding expenses just to watch the table animate.",
	},
];

// Regrets Page
export const EXPENSE_CATEGORIES = [
	'Food',
	'Clothes/Fashion',
	'Electronics',
	'Bills',
	'Travel',
	'Devotional',
	'Vehicle',
	'Misc.',
	'Entertainment',
	'Other',
];
export const PAYMENT_TYPES = [
	'Cash',
	'Credit Card',
	'UPI',
	'Debit Card',
	'Other',
];
export const INCOME_SOURCES = [
	'Salary',
	'Gifts',
	'Investment Return',
	'Freelance',
];

export const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
