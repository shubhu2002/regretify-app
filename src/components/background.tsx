'use client';

const Background = () => {
	return (
		<div className='fixed inset-0 z-0 pointer-events-none'>
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgxNDgsIDE2MywgMTg0LCAwLjIyKSIvPjwvc3ZnPg==')] mask-[radial-gradient(ellipse_at_top,white,transparent_80%)]" />

			<div className='absolute -top-[10%] -left-[5%] w-125 h-125 rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen' />
			<div className='absolute top-[20%] -right-[10%] w-150 h-150 rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-600/10 blur-[130px] mix-blend-multiply dark:mix-blend-screen' />

			<svg
				className='absolute top-[15%] left-[8%] w-96 h-96 text-violet-300/30 dark:text-violet-800/20'
				viewBox='0 0 200 200'
				xmlns='http://www.w3.org/2000/svg'
			>
				<path
					fill='currentColor'
					d='M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,95.5,-2.9C94.2,12.2,85.6,26.8,75.2,38.9C64.8,51,52.6,60.6,39.5,68.4C26.4,76.2,12.3,82.2,-2.1,85.8C-16.5,89.4,-31.1,90.6,-43.3,83.9C-55.5,77.2,-65.3,62.6,-73.4,47.9C-81.5,33.2,-87.9,18.4,-88.7,3.2C-89.5,-12.1,-84.7,-27.8,-75.4,-40.4C-66.1,-53,-52.3,-62.5,-38.3,-69.5C-24.3,-76.5,-10.1,-81,4.4,-86.3C18.9,-91.6,29.8,-83.6,44.7,-76.4Z'
					transform='translate(100 100)'
				/>
			</svg>
			<svg
				className='absolute bottom-[20%] right-[5%] w-80 h-80 text-fuchsia-300/30 dark:text-fuchsia-800/20'
				viewBox='0 0 200 200'
				xmlns='http://www.w3.org/2000/svg'
			>
				<path
					fill='currentColor'
					d='M39.6,-65.4C51.6,-57.1,61.9,-46.1,70.6,-33.5C79.3,-20.9,86.4,-6.7,85.6,7.1C84.8,20.9,76.1,34.3,65.3,45.2C54.5,56.1,41.6,64.5,27.5,69.5C13.4,74.5,-1.9,76.1,-16.4,73.5C-30.9,70.9,-44.6,64.1,-55.8,53.8C-67,43.5,-75.7,29.7,-79.8,14.5C-83.9,-0.7,-83.4,-17.3,-76.1,-31.3C-68.8,-45.3,-54.7,-56.7,-40.5,-63.8C-26.3,-70.9,-12,-73.7,1.8,-76.3C15.6,-78.9,31.2,-81.3,39.6,-65.4Z'
					transform='translate(100 100)'
				/>
			</svg>
		</div>
	);
};

export default Background;
