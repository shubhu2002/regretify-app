'use client';

const Background = () => {
	return (
		<div className='fixed inset-0 z-0 pointer-events-none overflow-hidden'>
			{/* Soft white radial glow at the top, fading into pure black */}
			<div className='absolute -top-[35%] left-1/2 -translate-x-1/2 w-[120%] h-[70%] rounded-full bg-white/[0.07] blur-[140px]' />

			{/* Faint horizon glow near the bottom */}
			<div className='absolute -bottom-[45%] left-1/2 -translate-x-1/2 w-[100%] h-[60%] rounded-full bg-white/[0.04] blur-[160px]' />

			{/* Subtle dot grid, masked to the top */}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA2KSIvPjwvc3ZnPg==')] mask-[radial-gradient(ellipse_at_top,white,transparent_70%)]" />
		</div>
	);
};

export default Background;
