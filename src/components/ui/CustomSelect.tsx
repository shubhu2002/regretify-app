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
						? 'border-transparent bg-white/4 text-white/60 cursor-default'
						: open
							? 'border-white/30 ring-2 ring-white/10 bg-white/6 text-white'
							: 'border-white/10 bg-white/6 text-white hover:border-white/20'
				}`}
			>
				{icon && <span className='text-white/40 shrink-0'>{icon}</span>}
				<span className={`flex-1 truncate ${!selected ? 'text-white/40' : ''}`}>
					{selected?.label || placeholder}
				</span>
				{!disabled && (
					<ChevronDown
						size={14}
						className={`shrink-0 text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
						className='absolute z-50 mt-1.5 w-full min-w-40 bg-[#1a191e] border border-white/10 rounded-xl shadow-xl shadow-black/60 overflow-hidden'
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
												? 'text-white/30 cursor-default'
												: isActive
													? 'bg-white/10 text-white'
													: 'text-white/70 hover:bg-white/6'
										}`}
									>
										<span className='flex-1 text-left truncate'>{opt.label}</span>
										{isActive && (
											<Check size={14} className='text-white shrink-0' />
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
