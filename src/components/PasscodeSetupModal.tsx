'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete, ShieldCheck, X } from 'lucide-react';

interface PasscodeSetupModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

type Step = 'choose' | 'enter' | 'confirm';

export default function PasscodeSetupModal({
	isOpen,
	onClose,
	onSuccess,
}: PasscodeSetupModalProps) {
	const [step, setStep] = useState<Step>('choose');
	const [length, setLength] = useState<4 | 6>(4);
	const [code, setCode] = useState('');
	const [firstCode, setFirstCode] = useState('');
	const [error, setError] = useState('');
	const [shake, setShake] = useState(false);
	const [saving, setSaving] = useState(false);

	const reset = useCallback(() => {
		setStep('choose');
		setLength(4);
		setCode('');
		setFirstCode('');
		setError('');
		setShake(false);
		setSaving(false);
	}, []);

	const handleClose = useCallback(() => {
		reset();
		onClose();
	}, [reset, onClose]);

	const savePasscode = useCallback(
		async (passcode: string) => {
			setSaving(true);
			try {
				const res = await fetch('/api/user/passcode', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ passcode }),
				});
				if (!res.ok) throw new Error();
				reset();
				onSuccess();
			} catch {
				setError('Failed to set passcode');
				setCode('');
				setSaving(false);
			}
		},
		[onSuccess, reset],
	);

	const handleSubmit = useCallback(
		(passcode: string) => {
			if (step === 'enter') {
				setFirstCode(passcode);
				setCode('');
				setStep('confirm');
			} else {
				if (passcode !== firstCode) {
					setShake(true);
					setError("Passcodes don't match");
					setTimeout(() => {
						setCode('');
						setShake(false);
					}, 500);
				} else {
					savePasscode(passcode);
				}
			}
		},
		[step, firstCode, savePasscode],
	);

	const handlePress = useCallback(
		(digit: string) => {
			if (saving) return;
			setError('');
			const next = code + digit;
			if (next.length > length) return;
			setCode(next);
			if (next.length === length) {
				handleSubmit(next);
			}
		},
		[code, saving, handleSubmit, length],
	);

	const handleDelete = useCallback(() => {
		if (saving) return;
		setCode((prev) => prev.slice(0, -1));
		setError('');
	}, [saving]);

	useEffect(() => {
		if (!isOpen || step === 'choose') return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key >= '0' && e.key <= '9') {
				e.preventDefault();
				handlePress(e.key);
			} else if (e.key === 'Backspace') {
				e.preventDefault();
				handleDelete();
			} else if (e.key === 'Escape') {
				handleClose();
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [isOpen, step, handlePress, handleDelete, handleClose]);

	const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

	const stepNumber = step === 'choose' ? 0 : step === 'enter' ? 1 : 2;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-4'
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0, y: 15 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.95, opacity: 0, y: 15 }}
						onClick={(e) => e.stopPropagation()}
						className='w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6'
					>
						{/* Header */}
						<div className='flex items-center justify-between mb-5'>
							<div className='flex items-center gap-3'>
								<div className='p-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/10'>
									<ShieldCheck
										size={20}
										className='text-violet-600 dark:text-violet-400'
									/>
								</div>
								<div>
									<h3 className='text-lg font-bold text-slate-900 dark:text-white tracking-tight'>
										{step === 'choose' && 'Set Up App Lock'}
										{step === 'enter' && 'Create Passcode'}
										{step === 'confirm' && 'Confirm Passcode'}
									</h3>
									<p className='text-xs text-slate-500 dark:text-slate-400'>
										{step === 'choose' && 'Choose your passcode length'}
										{step === 'enter' && `Enter a ${length}-digit passcode`}
										{step === 'confirm' && 'Re-enter to confirm'}
									</p>
								</div>
							</div>
							<button
								onClick={handleClose}
								className='p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
							>
								<X size={18} className='text-slate-400' />
							</button>
						</div>

						{/* Step indicator */}
						<div className='flex items-center gap-1.5 mb-6'>
							{[0, 1, 2].map((s) => (
								<div
									key={s}
									className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
										s <= stepNumber ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'
									}`}
								/>
							))}
						</div>

						{/* Step: Choose length */}
						{step === 'choose' && (
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								className='space-y-3'
							>
								<button
									onClick={() => { setLength(4); setStep('enter'); }}
									className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
										length === 4
											? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
											: 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700'
									}`}
								>
									<div className='flex gap-1.5'>
										{[0, 1, 2, 3].map((d) => (
											<div
												key={d}
												className='w-3 h-3 rounded-full bg-violet-500'
											/>
										))}
									</div>
									<div className='text-left flex-1'>
										<p className='text-sm font-semibold text-slate-800 dark:text-slate-200'>
											4-Digit Passcode
										</p>
										<p className='text-xs text-slate-500 dark:text-slate-400'>
											Quick and easy to remember
										</p>
									</div>
								</button>

								<button
									onClick={() => { setLength(6); setStep('enter'); }}
									className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
										length === 6
											? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
											: 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700'
									}`}
								>
									<div className='flex gap-1.5'>
										{[0, 1, 2, 3, 4, 5].map((d) => (
											<div
												key={d}
												className='w-3 h-3 rounded-full bg-violet-500'
											/>
										))}
									</div>
									<div className='text-left flex-1'>
										<p className='text-sm font-semibold text-slate-800 dark:text-slate-200'>
											6-Digit Passcode
										</p>
										<p className='text-xs text-slate-500 dark:text-slate-400'>
											More secure, recommended
										</p>
									</div>
								</button>
							</motion.div>
						)}

						{/* Step: Enter / Confirm */}
						{(step === 'enter' || step === 'confirm') && (
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
							>
								{/* Dots */}
								<motion.div
									animate={shake ? { x: [0, -12, 12, -12, 12, 0] } : {}}
									transition={{ duration: 0.4 }}
									className='flex items-center justify-center gap-3 mb-2'
								>
									{Array.from({ length }).map((_, i) => (
										<motion.div
											key={i}
											animate={
												i < code.length
													? { scale: [1, 1.3, 1] }
													: { scale: 1 }
											}
											transition={{ duration: 0.15 }}
											className={`w-3 h-3 rounded-full transition-colors duration-150 ${
												i < code.length
													? 'bg-violet-600 dark:bg-violet-400'
													: 'border-2 border-slate-300 dark:border-slate-600'
											}`}
										/>
									))}
								</motion.div>

								{/* Error */}
								<div className='h-6 flex items-center justify-center'>
									<AnimatePresence>
										{error && (
											<motion.p
												initial={{ opacity: 0, y: -4 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0 }}
												className='text-xs text-rose-500 font-medium'
											>
												{error}
											</motion.p>
										)}
									</AnimatePresence>
								</div>

								{/* Numpad */}
								<div className='grid grid-cols-3 gap-2.5 mt-2'>
									{keys.map((key, i) => {
										if (key === '') {
											return <div key={i} />;
										}
										if (key === 'del') {
											return (
												<button
													key={i}
													onClick={handleDelete}
													disabled={saving || code.length === 0}
													className='h-14 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:bg-slate-200 dark:active:bg-slate-800 transition-colors disabled:opacity-30'
												>
													<Delete size={20} />
												</button>
											);
										}
										return (
											<motion.button
												key={i}
												whileTap={{ scale: 0.92 }}
												onClick={() => handlePress(key)}
												disabled={saving || code.length >= length}
												className='h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 text-xl font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:bg-violet-50 dark:active:bg-violet-900/20 transition-colors disabled:opacity-40'
											>
												{key}
											</motion.button>
										);
									})}
								</div>

								{saving && (
									<div className='flex items-center justify-center gap-2 mt-4 text-sm text-slate-400'>
										<Lock size={14} className='animate-pulse' />
										Setting up...
									</div>
								)}
							</motion.div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
