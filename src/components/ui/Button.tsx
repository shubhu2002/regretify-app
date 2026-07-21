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
		'p-2 text-white/50 hover:text-white bg-white/6 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer',
	gradient:
		'px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-black bg-[#9294e5] hover:bg-[#a3a5ec] glow-periwinkle-sm transition-all cursor-pointer',
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
