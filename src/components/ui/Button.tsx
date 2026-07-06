import { type ButtonHTMLAttributes } from 'react';
import { motion, type MotionProps } from 'framer-motion';

// Merge ButtonHTMLAttributes<HTMLButtonElement> with MotionProps
interface ButtonProps
	extends
		Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps>,
		MotionProps {
	className?: string;
	variant?: 'default' | 'gradient';
}

const variants = {
	default:
		'p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer',
	gradient:
		'px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/20 transition-all cursor-pointer',
};

const Button: React.FC<ButtonProps> = ({
	children,
	className = '',
	variant = 'default',
	...rest
}) => {
	return (
		<motion.button
			className={`${variants[variant]} ${className}`}
			{...rest}
		>
			{children}
		</motion.button>
	);
};

export default Button;
