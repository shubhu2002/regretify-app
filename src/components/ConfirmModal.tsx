'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	isDanger?: boolean;
}

export default function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	isDanger = false,
}: ConfirmModalProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className='fixed inset-0 bg-slate-900/40 backdrop-blur-md z-110 flex items-center justify-center p-4'
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0, y: 15 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.95, opacity: 0, y: 15 }}
							onClick={(e) => e.stopPropagation()}
							className='w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6'
						>
							<div className='flex items-start gap-4'>
								<div
									className={`p-3 rounded-2xl shrink-0 ${isDanger ? 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400' : 'bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400'}`}
								>
									<AlertTriangle size={24} />
								</div>

								<div className='flex-1'>
									<h3 className='text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight'>
										{title}
									</h3>
									<p className='text-sm text-slate-500 dark:text-slate-400 leading-relaxed'>
										{message}
									</p>
								</div>
							</div>

							<div className='mt-8 flex gap-3 w-full'>
								<button
									onClick={onClose}
									className='flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors'
								>
									{cancelLabel}
								</button>
								<button
									onClick={() => {
										onConfirm();
									}}
									className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white shadow-sm transition-colors ${
										isDanger ?
											'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
										:	'bg-violet-600 hover:bg-violet-700'
									}`}
								>
									{confirmLabel}
								</button>
							</div>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
