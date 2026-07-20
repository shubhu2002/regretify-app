'use client';

import { SessionProvider } from 'next-auth/react';
import React, { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppLockProvider } from '@/providers/AppLockProvider';

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
			defaultTheme='dark'
			forcedTheme='dark'
		>
			<QueryClientProvider client={queryClient}>
				<SessionProvider>
						<AppLockProvider>
							{children}
						</AppLockProvider>
					</SessionProvider>
				<Toaster
					position='top-right'
					toastOptions={{
						duration: 4000,
						className:
							'!bg-[#101013]/90 !backdrop-blur-xl !text-white !border !border-white/10 !shadow-2xl !shadow-black/60 !py-2.5 !px-4',
						style: {
							minWidth: '350px',
							color: 'inherit',
						},
						success: {
							iconTheme: {
								primary: '#ffffff',
								secondary: '#000000',
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
