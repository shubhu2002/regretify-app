import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { getCroppedImg } from '@/lib/cropImage';

interface Props {
	imageSrc: string;
	onComplete: (croppedBlob: Blob) => void;
	onCancel: () => void;
}

export default function ImageCropperModal({
	imageSrc,
	onComplete,
	onCancel,
}: Props) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [processing, setProcessing] = useState(false);

	const onCropComplete = useCallback(
		(croppedArea: any, croppedPixels: any) => {
			setCroppedAreaPixels(croppedPixels);
		},
		[],
	);

	const handleSave = async () => {
		if (!croppedAreaPixels) return;
		setProcessing(true);
		try {
			const croppedBlob = await getCroppedImg(
				imageSrc,
				croppedAreaPixels,
			);
			if (croppedBlob) {
				onComplete(croppedBlob);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				className='w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col'
			>
				<div className='p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50'>
					<h2 className='font-semibold text-slate-800 dark:text-slate-200'>
						Crop Profile Picture
					</h2>
					<button
						onClick={onCancel}
						className='p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition'
					>
						<X size={18} />
					</button>
				</div>

				<div className='relative w-full h-80 bg-slate-100 dark:bg-slate-950'>
					<Cropper
						image={imageSrc}
						crop={crop}
						zoom={zoom}
						aspect={1}
						cropShape='round'
						showGrid={false}
						onCropChange={setCrop}
						onCropComplete={onCropComplete}
						onZoomChange={setZoom}
					/>
				</div>

				<div className='p-6 bg-slate-50 dark:bg-slate-800/50 space-y-4'>
					<div>
						<label className='text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block'>
							Zoom Slider
						</label>
						<input
							type='range'
							value={zoom}
							min={1}
							max={3}
							step={0.1}
							aria-labelledby='Zoom'
							onChange={(e) => setZoom(Number(e.target.value))}
							className='w-full accent-violet-600'
						/>
					</div>

					<button
						onClick={handleSave}
						disabled={processing}
						className='w-full flex justify-center items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-70 shadow-sm'
					>
						{processing ?
							<div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
						:	<>
								<Check size={18} /> Save Photo
							</>
						}
					</button>
				</div>
			</motion.div>
		</div>
	);
}
