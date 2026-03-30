'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800' />
		);
	}

	const toggleTheme = () => {
		if (resolvedTheme === 'dark') setTheme('light');
		else setTheme('dark');
	};

	return (
		<button
			onClick={toggleTheme}
			className='relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors shadow-sm overflow-hidden'
			title={`Theme: ${resolvedTheme}`}
		>
			<AnimatePresence mode='wait'>
				{resolvedTheme === 'dark' ?
					<motion.div
						key='dark'
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 20, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<Moon size={18} />
					</motion.div>
				:	<motion.div
						key='light'
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 20, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<Sun size={18} />
					</motion.div>
				}
			</AnimatePresence>
		</button>
	);
}
