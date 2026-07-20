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
						className='fixed inset-0 bg-black/60 backdrop-blur-md z-110 flex items-center justify-center p-4'
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0, y: 15 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.95, opacity: 0, y: 15 }}
							onClick={(e) => e.stopPropagation()}
							className='w-full max-w-sm bg-[#101013]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 p-6'
						>
							<div className='flex items-start gap-4'>
								<div
									className={`p-3 rounded-2xl shrink-0 ${isDanger ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.08] text-white/80'}`}
								>
									<AlertTriangle size={24} />
								</div>

								<div className='flex-1'>
									<h3 className='text-lg font-semibold text-white mb-1 tracking-tight'>
										{title}
									</h3>
									<p className='text-sm text-white/50 leading-relaxed'>
										{message}
									</p>
								</div>
							</div>

							<div className='mt-8 flex gap-3 w-full'>
								<button
									onClick={onClose}
									className='flex-1 px-4 py-2.5 rounded-xl font-medium text-white/80 bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 transition-colors'
								>
									{cancelLabel}
								</button>
								<button
									onClick={() => {
										onConfirm();
									}}
									className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${
										isDanger ?
											'bg-red-500 hover:bg-red-600 text-white'
										:	'bg-[#9294e5] hover:bg-[#a3a5ec] text-black glow-periwinkle-sm'
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
