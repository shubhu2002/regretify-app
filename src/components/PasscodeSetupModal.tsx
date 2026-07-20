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
					className='fixed inset-0 bg-black/60 backdrop-blur-md z-150 flex items-center justify-center p-4'
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0, y: 15 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.95, opacity: 0, y: 15 }}
						onClick={(e) => e.stopPropagation()}
						className='w-full max-w-sm bg-[#101013]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 p-6'
					>
						{/* Header */}
						<div className='flex items-center justify-between mb-5'>
							<div className='flex items-center gap-3'>
								<div className='p-2.5 rounded-xl bg-[#cbf1fd]/10'>
									<ShieldCheck
										size={20}
										className='text-[#cbf1fd]'
									/>
								</div>
								<div>
									<h3 className='text-lg font-semibold text-white tracking-tight'>
										{step === 'choose' && 'Set Up App Lock'}
										{step === 'enter' && 'Create Passcode'}
										{step === 'confirm' && 'Confirm Passcode'}
									</h3>
									<p className='text-xs text-white/50'>
										{step === 'choose' && 'Choose your passcode length'}
										{step === 'enter' && `Enter a ${length}-digit passcode`}
										{step === 'confirm' && 'Re-enter to confirm'}
									</p>
								</div>
							</div>
							<button
								onClick={handleClose}
								className='p-2 rounded-xl hover:bg-white/[0.08] transition-colors'
							>
								<X size={18} className='text-white/50' />
							</button>
						</div>

						{/* Step indicator */}
						<div className='flex items-center gap-1.5 mb-6'>
							{[0, 1, 2].map((s) => (
								<div
									key={s}
									className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
										s <= stepNumber ? 'bg-[#9294e5]' : 'bg-white/10'
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
											? 'border-[#9294e5]/60 bg-[#9294e5]/10'
											: 'border-white/10 hover:border-white/25'
									}`}
								>
									<div className='flex gap-1.5'>
										{[0, 1, 2, 3].map((d) => (
											<div
												key={d}
												className='w-3 h-3 rounded-full bg-white'
											/>
										))}
									</div>
									<div className='text-left flex-1'>
										<p className='text-sm font-semibold text-white'>
											4-Digit Passcode
										</p>
										<p className='text-xs text-white/50'>
											Quick and easy to remember
										</p>
									</div>
								</button>

								<button
									onClick={() => { setLength(6); setStep('enter'); }}
									className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
										length === 6
											? 'border-[#9294e5]/60 bg-[#9294e5]/10'
											: 'border-white/10 hover:border-white/25'
									}`}
								>
									<div className='flex gap-1.5'>
										{[0, 1, 2, 3, 4, 5].map((d) => (
											<div
												key={d}
												className='w-3 h-3 rounded-full bg-white'
											/>
										))}
									</div>
									<div className='text-left flex-1'>
										<p className='text-sm font-semibold text-white'>
											6-Digit Passcode
										</p>
										<p className='text-xs text-white/50'>
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
													? 'bg-white'
													: 'bg-white/[0.06] border border-white/10'
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
												className='text-xs text-red-400 font-medium'
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
													className='h-14 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] active:bg-white/10 transition-colors disabled:opacity-30'
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
												className='h-14 rounded-2xl bg-white/[0.06] border border-white/10 text-xl font-semibold text-white hover:bg-white/10 active:bg-white/[0.14] transition-colors disabled:opacity-40'
											>
												{key}
											</motion.button>
										);
									})}
								</div>

								{saving && (
									<div className='flex items-center justify-center gap-2 mt-4 text-sm text-white/40'>
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
