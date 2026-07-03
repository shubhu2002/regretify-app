'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface CustomSelectProps {
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	icon?: React.ReactNode;
}

export default function CustomSelect({
	value,
	onChange,
	options,
	placeholder = 'Select...',
	className = '',
	disabled = false,
	icon,
}: CustomSelectProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, []);

	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('keydown', handleKey);
		return () => document.removeEventListener('keydown', handleKey);
	}, [open]);

	const selected = options.find((o) => o.value === value);

	return (
		<div ref={ref} className={`relative ${className}`}>
			<button
				type='button'
				onClick={() => !disabled && setOpen(!open)}
				className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all text-left ${
					disabled
						? 'border-transparent bg-slate-100/80 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 cursor-default'
						: open
							? 'border-violet-500 ring-2 ring-violet-500/20 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white'
							: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600'
				}`}
			>
				{icon && <span className='text-slate-400 shrink-0'>{icon}</span>}
				<span className={`flex-1 truncate ${!selected ? 'text-slate-400' : ''}`}>
					{selected?.label || placeholder}
				</span>
				{!disabled && (
					<ChevronDown
						size={14}
						className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
					/>
				)}
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -4, scale: 0.98 }}
						transition={{ duration: 0.15 }}
						className='absolute z-50 mt-1.5 w-full min-w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 overflow-hidden'
					>
						<div className='max-h-56 overflow-y-auto py-1 scrollbar-thin'>
							{options.map((opt) => {
								const isActive = opt.value === value;
								return (
									<button
										key={opt.value}
										type='button'
										disabled={opt.disabled}
										onClick={() => {
											if (!opt.disabled) {
												onChange(opt.value);
												setOpen(false);
											}
										}}
										className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
											opt.disabled
												? 'text-slate-400 dark:text-slate-500 cursor-default'
												: isActive
													? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300'
													: 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
										}`}
									>
										<span className='flex-1 text-left truncate'>{opt.label}</span>
										{isActive && (
											<Check size={14} className='text-violet-500 shrink-0' />
										)}
									</button>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
