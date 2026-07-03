'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
	User,
	Calendar,
	ArrowLeft,
	LogOut,
	Trash2,
	Camera,
	Pencil,
	X,
	ShieldCheck,
	Lock,
	Mail,
	Phone,
	ChevronRight,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageCropperModal from '@/components/profile/ImageCropperModal';
import PhoneInput, { Country } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import PasscodeSetupModal from '@/components/PasscodeSetupModal';
import { useAppLock } from '@/providers/AppLockProvider';
import { useQueryClient } from '@tanstack/react-query';
import { ProfilePageSkeletonLoading } from './skeletons';
import CustomSelect from '@/components/ui/CustomSelect';
import { motion } from 'framer-motion';

export default function Profile() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const queryClient = useQueryClient();

	const { hasPasscode, passcodeLength, refreshPasscodeStatus } = useAppLock();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [clearing, setClearing] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
	const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
	const [removingPasscode, setRemovingPasscode] = useState(false);

	const [savedData, setSavedData] = useState<typeof formData | null>(null);

	const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
	const [pendingCroppedBlob, setPendingCroppedBlob] = useState<Blob | null>(null);
	const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		age: '',
		gender: '',
		profile: '',
		contact_number: '',
		email: '',
	});

	const defaultCountry: Country = 'IN';

	useEffect(() => {
		if (status === 'unauthenticated') router.push('/');
		if (status === 'authenticated' && session?.user?.email) fetchProfile();
	}, [status, session]);

	const fetchProfile = async () => {
		try {
			const res = await fetch('/api/user');
			if (res.ok) {
				const data = await res.json();
				const d = {
					name: data.user?.name || session?.user?.name || '',
					age: data.user?.age?.toString() || '',
					gender: data.user?.gender || '',
					profile: data.user?.profile || session?.user?.image || '',
					contact_number: data.user?.contact_number || '',
					email: data.user?.email || session?.user?.email || '',
				};
				setFormData(d);
				setSavedData(d);
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const reader = new FileReader();
			reader.addEventListener('load', () =>
				setCropImageSrc(reader.result?.toString() || null),
			);
			reader.readAsDataURL(e.target.files[0]);
		}
	};

	const handleCropComplete = (croppedBlob: Blob) => {
		setCropImageSrc(null);
		const localUrl = URL.createObjectURL(croppedBlob);
		setPendingCroppedBlob(croppedBlob);
		setPendingPreviewUrl(localUrl);
		toast.success('Photo ready! Click Save to apply.');
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]:
				e.target.name === 'age' ? Number(e.target.value) : e.target.value,
		}));
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		const toastId = toast.loading('Saving profile...');
		try {
			let finalProfile = formData.profile;

			if (pendingCroppedBlob) {
				const formDataUpload = new FormData();
				const file = new File([pendingCroppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
				formDataUpload.append('file', file);
				const res = await fetch('/api/upload-avatar', { method: 'POST', body: formDataUpload });
				if (!res.ok) {
					const err = await res.json();
					throw new Error(err.message || 'Upload failed');
				}
				const data = await res.json();
				finalProfile = data.url;
				setPendingCroppedBlob(null);
				setPendingPreviewUrl(null);
			}

			const res = await fetch('/api/user', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...formData, profile: finalProfile }),
			});

			if (!res.ok) throw new Error('Failed to update profile');
			const updated = { ...formData, profile: finalProfile };
			setFormData(updated);
			setSavedData(updated);
			toast.success('Profile updated!', { id: toastId });
			queryClient.invalidateQueries({ queryKey: ['userProfile'] });
			setIsEditing(false);
		} catch (error: any) {
			toast.error(error.message || 'Something went wrong.', { id: toastId });
		} finally {
			setSaving(false);
		}
	};

	const hasChanges = (): boolean => {
		if (!savedData) return false;
		if (pendingCroppedBlob) return true;
		return (
			formData.name !== savedData.name ||
			formData.age !== savedData.age ||
			formData.gender !== savedData.gender ||
			formData.contact_number !== savedData.contact_number
		);
	};

	const handleCancelEdit = () => {
		if (savedData) setFormData(savedData);
		setPendingCroppedBlob(null);
		setPendingPreviewUrl(null);
		setIsEditing(false);
	};

	const handleClearData = async () => {
		setConfirmOpen(false);
		setClearing(true);
		const toastId = toast.loading('Clearing financial data...');
		try {
			const res = await fetch('/api/user/data', { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to clear data');
			toast.success('Financial data completely cleared.', { id: toastId });
		} catch (error: any) {
			toast.error(error.message || 'Failed to clear data.', { id: toastId });
		} finally {
			setClearing(false);
		}
	};

	const handleRemovePasscode = async () => {
		setRemoveConfirmOpen(false);
		setRemovingPasscode(true);
		const toastId = toast.loading('Removing passcode...');
		try {
			const res = await fetch('/api/user/passcode', { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to remove passcode');
			await refreshPasscodeStatus();
			toast.success('App lock removed.', { id: toastId });
		} catch (error: any) {
			toast.error(error.message || 'Failed to remove passcode.', { id: toastId });
		} finally {
			setRemovingPasscode(false);
		}
	};

	if (status === 'loading' || loading) {
		return <ProfilePageSkeletonLoading />;
	}

	const avatarUrl =
		pendingPreviewUrl ||
		formData.profile ||
		'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';

	const inputBase =
		'w-full py-2.5 rounded-xl border outline-none transition-all text-sm';
	const inputEditing =
		'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500';
	const inputReadonly =
		'border-transparent bg-slate-100/80 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 cursor-default';

	return (
		<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
			<div className='relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8'>
				{/* Back */}
				<Link
					href='/regrets'
					className='inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6 text-sm'
				>
					<ArrowLeft size={16} />
					<span className='font-medium'>Back</span>
				</Link>

				{/* Hero Card */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					className='relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-600 via-violet-700 to-indigo-800 p-4 sm:p-6 mb-6'
				>
					<div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]' />
					<div className='relative flex items-center gap-5'>
						{/* Avatar */}
						<div
							className={`relative group/avatar shrink-0 ${isEditing ? 'cursor-pointer' : ''}`}
							onClick={() =>
								isEditing && document.getElementById('avatar-upload')?.click()
							}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={avatarUrl}
								alt='Profile avatar'
								className='w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-3 border-white/20 shadow-lg object-cover'
							/>
							{isEditing && (
								<div className='absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity'>
									<Camera size={22} className='text-white' />
								</div>
							)}
							{pendingPreviewUrl && (
								<div className='absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] rounded-lg px-1.5 py-0.5 font-bold shadow'>
									NEW
								</div>
							)}
							<input
								id='avatar-upload'
								type='file'
								accept='image/*'
								className='hidden'
								onChange={handleFileSelect}
							/>
						</div>

						<div className='flex-1 min-w-0'>
							<h1 className='text-2xl sm:text-3xl font-bold text-white truncate'>
								{formData.name || 'Your Name'}
							</h1>
							<p className='text-violet-200 text-sm mt-0.5 truncate'>
								{formData.email}
							</p>
						</div>

						{!isEditing ? (
							<button
								type='button'
								onClick={() => setIsEditing(true)}
								className='shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition-all backdrop-blur-sm'
							>
								<Pencil size={14} />
								<span className='hidden sm:inline'>Edit</span>
							</button>
						) : (
							<button
								type='button'
								onClick={handleCancelEdit}
								className='shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition-all backdrop-blur-sm'
							>
								<X size={14} />
								<span className='hidden sm:inline'>Cancel</span>
							</button>
						)}
					</div>
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Left Column — Form */}
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.05 }}
						className='lg:col-span-2'
					>
						<div className='bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/50 rounded-2xl p-5 sm:p-6 shadow-sm'>
							<h2 className='text-base font-semibold text-slate-800 dark:text-slate-200 mb-5'>
								Personal Information
							</h2>

							<form onSubmit={handleSave} className='space-y-4'>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									{/* Name */}
									<div>
										<label className='block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider'>
											Name
										</label>
										<div className='relative'>
											<User
												className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
												size={15}
											/>
											<input
												type='text'
												name='name'
												value={formData.name}
												onChange={handleChange}
												readOnly={!isEditing}
												className={`${inputBase} pl-9 pr-3 ${isEditing ? inputEditing : inputReadonly}`}
											/>
										</div>
									</div>

									{/* Email */}
									<div>
										<label className='block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider'>
											Email
										</label>
										<div className='relative'>
											<Mail
												className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
												size={15}
											/>
											<input
												type='email'
												value={formData.email}
												readOnly
												className={`${inputBase} pl-9 pr-3 border-transparent bg-slate-100/80 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 cursor-not-allowed`}
											/>
										</div>
									</div>

									{/* Age */}
									<div>
										<label className='block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider'>
											Age
										</label>
										<div className='relative'>
											<Calendar
												className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
												size={15}
											/>
											<input
												type='text'
												name='age'
												value={formData.age}
												onChange={handleChange}
												readOnly={!isEditing}
												className={`${inputBase} pl-9 pr-3 ${isEditing ? inputEditing : inputReadonly}`}
											/>
										</div>
									</div>

									{/* Gender */}
									<div>
										<label className='block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider'>
											Gender
										</label>
										<CustomSelect
										value={formData.gender}
										onChange={(v) => setFormData((prev) => ({ ...prev, gender: v }))}
										placeholder='Select...'
										disabled={!isEditing}
										icon={<Users size={15} />}
										options={[
											{ value: 'male', label: 'Male' },
											{ value: 'female', label: 'Female' },
											{ value: 'other', label: 'Other' },
										]}
									/>
									</div>

									{/* Contact */}
									<div className='sm:col-span-2'>
										<label className='block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider'>
											Contact Number
										</label>
										<div className='relative'>
											<Phone
												className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10'
												size={15}
											/>
											<div
												className={`${inputBase} pl-9 pr-3 ${isEditing ? inputEditing : inputReadonly} ${!isEditing ? 'pointer-events-none' : ''}`}
											>
												<PhoneInput
													international
													defaultCountry={defaultCountry || 'IN'}
													value={formData.contact_number as any}
													onChange={(val: any) =>
														setFormData((prev) => ({
															...prev,
															contact_number: val || '',
														}))
													}
													className='w-full outline-none text-sm [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:bg-transparent'
													disabled={!isEditing}
												/>
											</div>
										</div>
									</div>
								</div>

								{isEditing && (
									<div className='pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-end gap-3'>
										<button
											type='button'
											onClick={handleCancelEdit}
											className='px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
										>
											Cancel
										</button>
										<button
											type='submit'
											disabled={saving || !hasChanges()}
											className='bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md shadow-violet-600/20 disabled:opacity-40 disabled:cursor-not-allowed'
										>
											{saving ? 'Saving...' : 'Save Changes'}
										</button>
									</div>
								)}
							</form>
						</div>
					</motion.div>

					{/* Right Column — Actions */}
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className='flex flex-col gap-4'
					>
						{/* Security */}
						<div className='bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm'>
							<div className='flex items-center gap-2.5 mb-3'>
								<div className='p-2 rounded-lg bg-violet-100 dark:bg-violet-500/15'>
									<ShieldCheck size={16} className='text-violet-600 dark:text-violet-400' />
								</div>
								<h3 className='text-sm font-semibold text-slate-800 dark:text-slate-200'>
									App Lock
								</h3>
								{hasPasscode && (
									<span className='ml-auto text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full'>
										Active
									</span>
								)}
							</div>
							<p className='text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed'>
								{hasPasscode
									? `Protected with a ${passcodeLength}-digit passcode`
									: 'Add a passcode to protect your data'}
							</p>

							{hasPasscode ? (
								<div className='space-y-2'>
									<button
										onClick={() => setPasscodeModalOpen(true)}
										className='w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
									>
										<span className='flex items-center gap-2'>
											<Lock size={14} />
											Change Passcode
										</span>
										<ChevronRight size={14} className='text-slate-400' />
									</button>
									<button
										onClick={() => setRemoveConfirmOpen(true)}
										disabled={removingPasscode}
										className='w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50'
									>
										<span>{removingPasscode ? 'Removing...' : 'Remove Lock'}</span>
										<ChevronRight size={14} />
									</button>
								</div>
							) : (
								<button
									onClick={() => setPasscodeModalOpen(true)}
									className='w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2'
								>
									<Lock size={14} />
									Set Up App Lock
								</button>
							)}
						</div>

						{/* Danger Zone */}
						<div className='bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-rose-200/60 dark:border-rose-900/30 rounded-2xl p-5 shadow-sm'>
							<div className='flex items-center gap-2.5 mb-3'>
								<div className='p-2 rounded-lg bg-rose-100 dark:bg-rose-500/15'>
									<Trash2 size={16} className='text-rose-600 dark:text-rose-400' />
								</div>
								<h3 className='text-sm font-semibold text-slate-800 dark:text-slate-200'>
									Danger Zone
								</h3>
							</div>
							<p className='text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed'>
								Permanently clear all financial data. This cannot be undone.
							</p>
							<button
								onClick={() => setConfirmOpen(true)}
								disabled={clearing}
								className='w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50'
							>
								<span>{clearing ? 'Clearing...' : 'Clear Financial Data'}</span>
								<ChevronRight size={14} />
							</button>
						</div>

						{/* Sign Out */}
						<button
							onClick={() => signOut({ callbackUrl: '/' })}
							className='w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-sm'
						>
							<span className='flex items-center gap-2.5'>
								<LogOut size={16} />
								Sign Out
							</span>
							<ChevronRight size={14} className='text-slate-400' />
						</button>
					</motion.div>
				</div>

				{cropImageSrc && (
					<ImageCropperModal
						imageSrc={cropImageSrc}
						onComplete={handleCropComplete}
						onCancel={() => setCropImageSrc(null)}
					/>
				)}

				<ConfirmModal
					isOpen={confirmOpen}
					onClose={() => setConfirmOpen(false)}
					onConfirm={handleClearData}
					title='Erase All Financial Data'
					message='Are you completely sure you want to delete ALL your records? This action cannot be undone.'
					confirmLabel='Clear Data'
					isDanger={true}
				/>

				<ConfirmModal
					isOpen={removeConfirmOpen}
					onClose={() => setRemoveConfirmOpen(false)}
					onConfirm={handleRemovePasscode}
					title='Remove App Lock'
					message='Anyone with access to your device will be able to open the app without a passcode.'
					confirmLabel='Remove'
					isDanger={true}
				/>

				<PasscodeSetupModal
					isOpen={passcodeModalOpen}
					onClose={() => setPasscodeModalOpen(false)}
					onSuccess={async () => {
						setPasscodeModalOpen(false);
						await refreshPasscodeStatus();
						toast.success('App lock enabled!');
					}}
				/>
			</div>
		</div>
	);
}
