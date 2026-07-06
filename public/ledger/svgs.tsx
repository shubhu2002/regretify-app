import { motion } from 'framer-motion';

export const NotesDoddle = () => {
	return (
		<svg
			viewBox='0 0 120 120'
			className='w-full h-full'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<rect
				x='25'
				y='20'
				width='70'
				height='85'
				rx='8'
				className='fill-violet-100 dark:fill-violet-800/30 stroke-violet-300 dark:stroke-violet-700'
				strokeWidth='2'
			/>
			<rect
				x='40'
				y='12'
				width='40'
				height='14'
				rx='4'
				className='fill-violet-200 dark:fill-violet-700/40 stroke-violet-300 dark:stroke-violet-700'
				strokeWidth='2'
			/>
			<motion.line
				x1='38'
				y1='45'
				x2='82'
				y2='45'
				className='stroke-violet-300 dark:stroke-violet-600'
				strokeWidth='2'
				strokeLinecap='round'
				animate={{
					opacity: [0.3, 1, 0.3],
				}}
				transition={{
					duration: 2,
					repeat: Infinity,
					delay: 0,
				}}
			/>
			<motion.line
				x1='38'
				y1='58'
				x2='72'
				y2='58'
				className='stroke-violet-300 dark:stroke-violet-600'
				strokeWidth='2'
				strokeLinecap='round'
				animate={{
					opacity: [0.3, 1, 0.3],
				}}
				transition={{
					duration: 2,
					repeat: Infinity,
					delay: 0.3,
				}}
			/>
			<motion.line
				x1='38'
				y1='71'
				x2='78'
				y2='71'
				className='stroke-violet-300 dark:stroke-violet-600'
				strokeWidth='2'
				strokeLinecap='round'
				animate={{
					opacity: [0.3, 1, 0.3],
				}}
				transition={{
					duration: 2,
					repeat: Infinity,
					delay: 0.6,
				}}
			/>
			<motion.g
				animate={{
					rotate: [-5, 5, -5],
					x: [0, 2, 0],
				}}
				transition={{
					duration: 1.5,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
				style={{
					transformOrigin: '95px 30px',
				}}
			>
				<rect
					x='88'
					y='18'
					width='6'
					height='30'
					rx='2'
					className='fill-fuchsia-300 dark:fill-fuchsia-600'
				/>
				<polygon
					points='88,48 94,48 91,56'
					className='fill-fuchsia-400 dark:fill-fuchsia-500'
				/>
				<rect
					x='88'
					y='18'
					width='6'
					height='6'
					rx='1'
					className='fill-fuchsia-200 dark:fill-fuchsia-400'
				/>
			</motion.g>
		</svg>
	);
};
