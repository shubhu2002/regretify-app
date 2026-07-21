'use client';

import { useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Calendar, Camera, Ghost } from 'lucide-react';
import toast from 'react-hot-toast';
import PhoneInput, { Country } from 'react-phone-number-input';

import 'react-phone-number-input/style.css';
import CustomSelect from '@/components/ui/CustomSelect';

type AuthMode = 'signin' | 'signup';

export default function AuthModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const [mode, setMode] = useState<AuthMode>('signin');
	const [loading, setLoading] = useState(false);

	// Sign In State
	const [signInEmail, setSignInEmail] = useState('');
	const [signInPassword, setSignInPassword] = useState('');

	// Sign Up State
	const [formData, setFormData] = useState({
		name: '',
		age: '',
		gender: '',
		profile: '',
		contact_number: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	// Local image preview — blob/data URL, not yet uploaded
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	// The actual File object, uploaded lazily on form submit
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	const defaultCountry: Country = 'IN';
	const fileInputRef = useRef<HTMLInputElement>(null);

	if (!isOpen) return null;

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setAvatarFile(file);
		const reader = new FileReader();
		reader.onload = () => setAvatarPreview(reader.result as string);
		reader.readAsDataURL(file);
	};

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const toastId = toast.loading('Signing you in...');
		const res = await signIn('credentials', {
			email: signInEmail,
			password: signInPassword,
			redirect: false,
		});
		setLoading(false);
		if (res?.error) {
			toast.error(res.error, { id: toastId });
		} else {
			toast.success('Welcome back! Redirecting...', { id: toastId });
			onClose();
			window.location.href = '/regrets';
		}
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();

		// --- Client-side validation ---
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			toast.error('Please enter a valid email address.');
			return;
		}
		if (formData.password.length < 8) {
			toast.error('Password must be at least 8 characters long.');
			return;
		}
		if (formData.password !== formData.confirmPassword) {
			toast.error('Passwords do not match.');
			return;
		}
		if (formData.age) {
			const age = parseInt(formData.age);
			if (isNaN(age) || age < 1 || age > 100) {
				toast.error('Age must be between 1 and 100.');
				return;
			}
		}
		if (!formData.name.trim()) {
			toast.error('Name is required.');
			return;
		}
		setLoading(true);
		const toastId = toast.loading('Creating your account...');

		try {
			let profileUrl = '';

			// Step 1: Upload avatar — if it fails, abort everything
			if (avatarFile) {
				toast.loading('Uploading your avatar...', { id: toastId });
				const uploadForm = new FormData();
				uploadForm.append('file', avatarFile);

				const upRes = await fetch('/api/upload-avatar', {
					method: 'POST',
					body: uploadForm,
				});
				const upData = await upRes.json();

				if (!upRes.ok) {
					// Hard stop — don't register if avatar failed
					throw new Error(
						upData.message ||
							'Avatar upload failed. Account not created.',
					);
				}

				profileUrl = upData.url || '';
			}

			// Step 2: Register user
			toast.loading('Registering account...', { id: toastId });
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...formData, profile: profileUrl }),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(
					data.message || 'Registration failed. Please try again.',
				);
			}

			// Step 3: Auto sign-in
			toast.loading('Account created! Signing you in...', {
				id: toastId,
			});
			const signRes = await signIn('credentials', {
				email: formData.email,
				password: formData.password,
				redirect: false,
			});

			if (signRes?.error) {
				// Account was created but auto-login failed — show info, don't throw
				toast.error(
					'Account created but sign-in failed. Please sign in manually.',
					{ id: toastId },
				);
			} else {
				toast.success('Welcome to Regretify! 🎉', { id: toastId });
				onClose();
				window.location.href = '/regrets';
			}
		} catch (err: unknown) {
			toast.error(
				err instanceof Error ?
					err.message
				:	'An unexpected error occurred',
				{ id: toastId },
			);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const switchMode = (m: AuthMode) => {
		setMode(m);
		setAvatarPreview(null);
		setAvatarFile(null);
	};

	const inputCls =
		'w-full pl-9 pr-3 py-3 text-sm bg-white/6 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-white/30 focus:ring-2 focus:ring-white/10 focus:outline-none transition-shadow outline-none';
	const labelCls = 'block text-sm font-medium text-white/70 mb-1.5';

	return (
		<AnimatePresence>
			{isOpen && (
				<div className='fixed inset-0 z-100 flex items-center justify-center p-4 overflow-y-auto'>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='absolute inset-0 bg-black/60 backdrop-blur-md'
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className='relative w-full max-w-md my-4 bg-[#1a191e]/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/60 border border-white/10 overflow-hidden'
					>
						{/* Header */}
						<div className='p-6 text-center border-b border-white/10 relative'>
							<button
								onClick={onClose}
								className='absolute right-4 top-4 p-2 text-white/50 hover:text-white transition-colors bg-white/8 hover:bg-white/[0.14] rounded-full'
							>
								<X size={18} />
							</button>
							<div className='flex justify-center mb-3'>
								<div className='bg-black p-2.5 rounded-full text-white border border-white/15 shadow-[0_0_24px_rgba(255,255,255,0.15)]'>
									<Ghost size={22} />
								</div>
							</div>
							<h2 className='text-2xl font-semibold text-gradient text-white tracking-tight'>
								Regretify
							</h2>
							<p className='text-sm text-white/50 mt-1'>
								{mode === 'signin' ?
									'Welcome back to your financial miseries.'
								:	'Create an account to track your regrets.'}
							</p>
						</div>

						{/* Body */}
						<div className='p-6 overflow-y-auto max-h-[70vh]'>
							{mode === 'signin' ?
								<div className='space-y-5'>
									{/* Google OAuth */}
									<button
										onClick={() =>
											signIn('google', {
												callbackUrl: '/regrets',
											})
										}
										className='w-full flex items-center justify-center gap-2 bg-white/6 border border-white/10 text-white/80 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all font-medium text-sm'
									>
										<svg
											viewBox='0 0 24 24'
											width='18'
											height='18'
											xmlns='http://www.w3.org/2000/svg'
										>
											<g transform='matrix(1, 0, 0, 1, 27.009001, -39.238998)'>
												<path
													fill='#4285F4'
													d='M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z'
												/>
												<path
													fill='#34A853'
													d='M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z'
												/>
												<path
													fill='#FBBC05'
													d='M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z'
												/>
												<path
													fill='#EA4335'
													d='M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z'
												/>
											</g>
										</svg>
										Continue with Google
									</button>

									<div className='flex items-center'>
										<div className='flex-1 border-t border-white/10' />
										<span className='px-3 text-xs text-white/40 bg-transparent'>
											OR
										</span>
										<div className='flex-1 border-t border-white/10' />
									</div>

									<form
										onSubmit={handleSignIn}
										className='space-y-4'
									>
										<div>
											<label className={labelCls}>
												Email
											</label>
											<div className='relative'>
												<Mail
													className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40'
													size={16}
												/>
												<input
													type='email'
													required
													value={signInEmail}
													onChange={(e) =>
														setSignInEmail(
															e.target.value,
														)
													}
													className={inputCls}
													placeholder='you@example.com'
												/>
											</div>
										</div>
										<div>
											<label className={labelCls}>
												Password
											</label>
											<div className='relative'>
												<Lock
													className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40'
													size={16}
												/>
												<input
													type='password'
													required
													value={signInPassword}
													onChange={(e) =>
														setSignInPassword(
															e.target.value,
														)
													}
													className={inputCls}
													placeholder='••••••••'
												/>
											</div>
										</div>
										<button
											type='submit'
											disabled={loading}
											className='w-full bg-[#9294e5] hover:bg-[#a3a5ec] text-black py-3 rounded-xl font-semibold glow-periwinkle-sm transition-all disabled:opacity-70'
										>
											{loading ?
												'Signing in...'
											:	'Sign In'}
										</button>
									</form>

									<p className='text-center text-sm text-white/50'>
										Don&apos;t have an account?{' '}
										<button
											onClick={() => switchMode('signup')}
											className='text-white font-medium hover:underline'
										>
											Create Account
										</button>
									</p>
								</div>
							:	<form
									onSubmit={handleSignUp}
									className='space-y-4'
								>
									{/* Avatar picker — preview only, upload deferred to form submit */}
									<div className='flex flex-col items-center gap-2'>
										<div
											className='relative w-20 h-20 rounded-full cursor-pointer group/av'
											onClick={() =>
												fileInputRef.current?.click()
											}
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={
													avatarPreview ||
													'https://api.dicebear.com/7.x/avataaars/svg?seed=new-user'
												}
												alt='avatar preview'
												className='w-20 h-20 rounded-full object-cover border-2 border-white/15 bg-white/10'
											/>
											<div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity'>
												<Camera
													size={18}
													className='text-white'
												/>
											</div>
										</div>
										<span className='text-xs text-white/40'>
											Click to pick a profile photo
										</span>
										<input
											ref={fileInputRef}
											type='file'
											accept='image/*'
											className='hidden'
											onChange={handleAvatarChange}
										/>
									</div>

									<div className='grid grid-cols-2 gap-3'>
										<div>
											<label className={labelCls}>
												Name
											</label>
											<div className='relative'>
												<User
													className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40'
													size={14}
												/>
												<input
													type='text'
													name='name'
													required
													value={formData.name}
													onChange={handleChange}
													className={inputCls}
													placeholder='John Doe'
												/>
											</div>
										</div>
										<div>
											<label className={labelCls}>
												Age
											</label>
											<div className='relative'>
												<Calendar
													className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40'
													size={14}
												/>
												<input
													type='number'
													name='age'
													min='1'
													max='120'
													value={formData.age}
													onChange={handleChange}
													className={inputCls}
													placeholder='25'
												/>
											</div>
										</div>
									</div>

									<div>
										<label className={labelCls}>
											Gender
										</label>
										<CustomSelect
											value={formData.gender}
											onChange={(v) => setFormData((prev) => ({ ...prev, gender: v }))}
											placeholder='Select...'
											options={[
												{ value: 'male', label: 'Male' },
												{ value: 'female', label: 'Female' },
												{ value: 'other', label: 'Other' },
											]}
										/>
									</div>

									{/* Phone with country flag */}
									<div>
										<label className={labelCls}>
											Contact Number
										</label>
										<div className='w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/10 transition-shadow'>
											<PhoneInput
												international
												defaultCountry={
													defaultCountry || 'IN'
												}
												value={formData.contact_number}
												onChange={(val) =>
													setFormData((prev) => ({
														...prev,
														contact_number:
															val || '',
													}))
												}
												className='w-full outline-none text-sm text-white'
											/>
										</div>
									</div>

									<div>
										<label className={labelCls}>
											Email
										</label>
										<div className='relative'>
											<Mail
												className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40'
												size={14}
											/>
											<input
												type='email'
												name='email'
												required
												value={formData.email}
												onChange={handleChange}
												className={inputCls}
												placeholder='you@example.com'
											/>
										</div>
									</div>

									<div className='grid grid-cols-2 gap-3'>
										<div>
											<label className={labelCls}>
												Password
											</label>
											<div className='relative'>
												<Lock
													className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40'
													size={14}
												/>
												<input
													type='password'
													name='password'
													required
													minLength={6}
													value={formData.password}
													onChange={handleChange}
													className={inputCls}
													placeholder='••••••••'
												/>
											</div>
										</div>
										<div>
											<label className={labelCls}>
												Confirm
											</label>
											<div className='relative'>
												<Lock
													className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40'
													size={14}
												/>
												<input
													type='password'
													name='confirmPassword'
													required
													minLength={6}
													value={
														formData.confirmPassword
													}
													onChange={handleChange}
													className={inputCls}
													placeholder='••••••••'
												/>
											</div>
										</div>
									</div>

									<button
										type='submit'
										disabled={loading}
										className='w-full bg-[#9294e5] hover:bg-[#a3a5ec] text-black py-3 rounded-xl font-semibold glow-periwinkle-sm transition-all disabled:opacity-70 mt-1'
									>
										{loading ?
											'Creating account...'
										:	'Create Account'}
									</button>

									<p className='text-center text-sm text-white/50'>
										Already have an account?{' '}
										<button
											type='button'
											onClick={() => switchMode('signin')}
											className='text-white font-medium hover:underline'
										>
											Sign In
										</button>
									</p>
								</form>
							}
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
