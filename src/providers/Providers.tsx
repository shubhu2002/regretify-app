'use client';

import { SessionProvider } from 'next-auth/react';
import React, { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
					},
				},
			}),
	);

	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='system'
			enableSystem
		>
			<QueryClientProvider client={queryClient}>
				<SessionProvider>{children}</SessionProvider>
				<Toaster
					position='top-right'
					toastOptions={{
						duration: 4000,
						className:
							'!bg-white/85 dark:!bg-slate-900/85 !backdrop-blur-xl !text-slate-900 dark:!text-white !border !border-violet-200 dark:!border-violet-800 !shadow-xl !py-2.5 !px-4',
						style: {
							minWidth: '350px',
							color: 'inherit',
						},
						success: {
							iconTheme: {
								primary: '#10b981',
								secondary: '#fff',
							},
						},
						error: {
							iconTheme: {
								primary: '#f43f5e',
								secondary: '#fff',
							},
						},
					}}
				/>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
