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
	title: 'Regretify | Track your poor decisions',
	description: 'A funny way to track how much money you regret spending.',
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
