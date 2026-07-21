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
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md'>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				className='w-full max-w-md bg-[#1a191e]/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/60 overflow-hidden border border-white/10 flex flex-col'
			>
				<div className='p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.04]'>
					<h2 className='font-semibold tracking-tight text-white'>
						Crop Profile Picture
					</h2>
					<button
						onClick={onCancel}
						className='p-1.5 text-white/50 hover:text-white rounded-full hover:bg-white/[0.08] transition'
					>
						<X size={18} />
					</button>
				</div>

				<div className='relative w-full h-80 bg-black'>
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

				<div className='p-6 bg-white/[0.04] space-y-4'>
					<div>
						<label className='text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block'>
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
							className='w-full accent-[#9294e5]'
						/>
					</div>

					<button
						onClick={handleSave}
						disabled={processing}
						className='w-full flex justify-center items-center gap-2 bg-[#9294e5] hover:bg-[#a3a5ec] text-black py-3 rounded-xl font-semibold transition-colors shadow-[0_2px_24px_rgba(146,148,229,0.35)] disabled:opacity-70'
					>
						{processing ?
							<div className='w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin' />
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
