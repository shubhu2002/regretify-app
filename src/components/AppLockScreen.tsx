'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete, Fingerprint } from 'lucide-react';

interface AppLockScreenProps {
	onUnlock: () => void;
	passcodeLength: 4 | 6;
}

export default function AppLockScreen({ onUnlock, passcodeLength }: AppLockScreenProps) {
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [verifying, setVerifying] = useState(false);
	const [shake, setShake] = useState(false);

	const verify = useCallback(
		async (passcode: string) => {
			setVerifying(true);
			setError('');
			try {
				const res = await fetch('/api/user/passcode/verify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ passcode }),
				});
				const data = await res.json();
				if (data.verified) {
					onUnlock();
				} else {
					setShake(true);
					setError('Wrong passcode');
					setTimeout(() => {
						setCode('');
						setShake(false);
					}, 500);
				}
			} catch {
				setError('Something went wrong');
				setCode('');
			} finally {
				setVerifying(false);
			}
		},
		[onUnlock],
	);

	const handlePress = useCallback(
		(digit: string) => {
			if (verifying) return;
			setError('');
			const next = code + digit;
			if (next.length > passcodeLength) return;
			setCode(next);
			if (next.length === passcodeLength) {
				verify(next);
			}
		},
		[code, verifying, verify, passcodeLength],
	);

	const handleDelete = useCallback(() => {
		if (verifying) return;
		setCode((prev) => prev.slice(0, -1));
		setError('');
	}, [verifying]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key >= '0' && e.key <= '9') {
				e.preventDefault();
				handlePress(e.key);
			} else if (e.key === 'Backspace') {
				e.preventDefault();
				handleDelete();
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [handlePress, handleDelete]);

	const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className='fixed inset-0 z-200 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950'
		>
			<div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]' />

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.1 }}
				className='relative flex flex-col items-center gap-8 w-full max-w-xs px-4'
			>
				<div className='flex flex-col items-center gap-3'>
					<div className='w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
						<Fingerprint
							size={32}
							className='text-violet-600 dark:text-violet-400'
						/>
					</div>
					<h1 className='text-xl font-bold text-slate-900 dark:text-white'>
						Enter Passcode
					</h1>
					<p className='text-sm text-slate-500 dark:text-slate-400 text-center'>
						Enter your {passcodeLength}-digit passcode to unlock
					</p>
				</div>

				{/* Dots */}
				<motion.div
					animate={shake ? { x: [0, -12, 12, -12, 12, 0] } : {}}
					transition={{ duration: 0.4 }}
					className='flex items-center gap-3'
				>
					{Array.from({ length: passcodeLength }).map((_, i) => (
						<motion.div
							key={i}
							animate={
								i < code.length ?
									{ scale: [1, 1.3, 1] }
								:	{ scale: 1 }
							}
							transition={{ duration: 0.15 }}
							className={`w-3.5 h-3.5 rounded-full transition-colors duration-150 ${
								i < code.length ?
									'bg-violet-600 dark:bg-violet-400'
								:	'border-2 border-slate-300 dark:border-slate-600'
							}`}
						/>
					))}
				</motion.div>

				{/* Error */}
				<AnimatePresence>
					{error && (
						<motion.p
							initial={{ opacity: 0, y: -4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className='text-sm text-rose-500 font-medium -mt-4'
						>
							{error}
						</motion.p>
					)}
				</AnimatePresence>

				{/* Numpad */}
				<div className='grid grid-cols-3 gap-3 w-full'>
					{keys.map((key, i) => {
						if (key === '') {
							return <div key={i} />;
						}
						if (key === 'del') {
							return (
								<button
									key={i}
									onClick={handleDelete}
									disabled={verifying || code.length === 0}
									className='h-16 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:bg-slate-200 dark:active:bg-slate-800 transition-colors disabled:opacity-30'
								>
									<Delete size={22} />
								</button>
							);
						}
						return (
							<motion.button
								key={i}
								whileTap={{ scale: 0.92 }}
								onClick={() => handlePress(key)}
								disabled={verifying || code.length >= passcodeLength}
								className='h-16 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-2xl font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-violet-50 dark:active:bg-violet-900/20 transition-colors shadow-sm disabled:opacity-40'
							>
								{key}
							</motion.button>
						);
					})}
				</div>

				{verifying && (
					<div className='flex items-center gap-2 text-sm text-slate-400'>
						<Lock size={14} className='animate-pulse' />
						Verifying...
					</div>
				)}
			</motion.div>
		</motion.div>
	);
}
