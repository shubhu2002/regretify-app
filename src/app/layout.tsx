import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers/Providers';
import Navbar from '@/components/Navbar';
import Background from '@/components/background';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	metadataBase: new URL('https://regretify-app.vercel.app'),
	title: {
		default: 'Regretify | Track Your Poor Decisions',
		template: '%s | Regretify',
	},
	description:
		'Regretify is a fun expense tracker that helps you see exactly how much money you regret spending. Log your regrets, track your impulse buys, and maybe — just maybe — spend smarter.',
	keywords: [
		'expense tracker',
		'spending tracker',
		'budget app',
		'regret tracker',
		'personal finance',
		'money management',
		'impulse buys',
	],
	authors: [{ name: 'Regretify' }],
	creator: 'Regretify',
	openGraph: {
		type: 'website',
		locale: 'en_IN',
		url: 'https://regretify-app.vercel.app',
		siteName: 'Regretify',
		title: 'Regretify | Track Your Poor Decisions',
		description:
			'Log your spending regrets, track impulse buys, and see where your money went. A fun take on personal finance.',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'Regretify — Track your poor decisions',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Regretify | Track Your Poor Decisions',
		description:
			'Log your spending regrets, track impulse buys, and see where your money went. A fun take on personal finance.',
		images: ['/og-image.png'],
		creator: '@regretify',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			className={`${geistSans.variable} ${geistMono.variable} antialiased`}
		>
			<body className='relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col mb-0'>
				<Providers>
					<Background />
					<main className='flex-1 flex flex-col relative'>
					<Navbar />
						{children}
					</main>
				</Providers>
			</body>
		</html>
	);
}
