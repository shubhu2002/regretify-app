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
			className='fixed inset-0 z-200 flex flex-col items-center justify-center bg-black'
		>
			<div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]' />

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.1 }}
				className='relative flex flex-col items-center gap-8 w-full max-w-xs px-4'
			>
				<div className='flex flex-col items-center gap-3'>
					<div className='w-16 h-16 bg-black rounded-full border border-white/15 shadow-[0_0_40px_rgba(255,255,255,0.12)] flex items-center justify-center'>
						<Fingerprint
							size={32}
							className='text-white/80'
						/>
					</div>
					<h1 className='text-xl font-semibold tracking-tight text-white'>
						Enter Passcode
					</h1>
					<p className='text-sm text-white/50 text-center'>
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
									'bg-white'
								:	'bg-white/[0.06] border border-white/10'
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
							className='text-sm text-red-400 font-medium -mt-4'
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
									className='h-16 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] active:bg-white/10 transition-colors disabled:opacity-30'
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
								className='h-16 rounded-2xl bg-white/[0.06] border border-white/10 text-2xl font-semibold text-white hover:bg-white/10 active:bg-white/[0.14] transition-colors disabled:opacity-40'
							>
								{key}
							</motion.button>
						);
					})}
				</div>

				{verifying && (
					<div className='flex items-center gap-2 text-sm text-white/40'>
						<Lock size={14} className='animate-pulse' />
						Verifying...
					</div>
				)}
			</motion.div>
		</motion.div>
	);
}
