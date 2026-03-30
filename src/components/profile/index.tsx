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
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageCropperModal from '@/components/profile/ImageCropperModal';
import PhoneInput, { Country } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import { useQueryClient } from '@tanstack/react-query';

export default function Profile() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [clearing, setClearing] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	// Snapshot to detect changes
	const [savedData, setSavedData] = useState<typeof formData | null>(null);

	const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
	const [pendingCroppedBlob, setPendingCroppedBlob] = useState<Blob | null>(
		null,
	);
	const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
		null,
	);

	const [formData, setFormData] = useState({
		name: '',
		age: '',
		gender: '',
		profile: '',
		contact_number: '',
		email: '', // Read-only but displayed
	});

	const [defaultCountry, setDefaultCountry] = useState<Country>('IN');

	// Auto-fetch country for phone layout
	useEffect(() => {
		async function fetchCountry() {
			try {
				const res = await fetch('https://ipapi.co/json/');
				if (res.ok) {
					const data = await res.json();
					if (data?.country_code) {
						setDefaultCountry(data.country_code);
					}
				}
			} catch (err) {
				console.error('Failed to auto-fetch country:', err);
			}
		}

		// Only auto-fetch if we don't already have one or user hasn't supplied a standard global prefixed number
		fetchCountry();
	}, []);

	useEffect(() => {
		// Basic protection
		if (status === 'unauthenticated') {
			router.push('/');
		}

		if (status === 'authenticated' && session?.user?.email) {
			fetchProfile();
		}
	}, [status, session]);

	const fetchProfile = async () => {
		try {
			const res = await fetch('/api/user');
			if (res.ok) {
				const data = await res.json();
				// Fallback to session data if not totally populated in db (like OAuth new users)
				setFormData({
					name: data.user?.name || session?.user?.name || '',
					age: data.user?.age?.toString() || '',
					gender: data.user?.gender || '',
					profile: data.user?.profile || session?.user?.image || '',
					contact_number: data.user?.contact_number || '',
					email: data.user?.email || session?.user?.email || '',
				});
				// Store snapshot for change detection
				setSavedData({
					name: data.user?.name || session?.user?.name || '',
					age: data.user?.age?.toString() || '',
					gender: data.user?.gender || '',
					profile: data.user?.profile || session?.user?.image || '',
					contact_number: data.user?.contact_number || '',
					email: data.user?.email || session?.user?.email || '',
				});
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

	// Crop complete: just store the blob and a local preview URL — NO upload yet
	const handleCropComplete = (croppedBlob: Blob) => {
		setCropImageSrc(null);
		const localUrl = URL.createObjectURL(croppedBlob);
		setPendingCroppedBlob(croppedBlob);
		setPendingPreviewUrl(localUrl);
		toast.success('Photo ready! Click Save Changes to apply it.');
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]:
				e.target.name === 'age' ?
					Number(e.target.value)
				:	e.target.value,
		}));
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		const toastId = toast.loading('Saving profile...');
		try {
			let finalProfile = formData.profile;

			// If a new image was cropped, upload it now on Save
			if (pendingCroppedBlob) {
				const formDataUpload = new FormData();

				// IMPORTANT: convert Blob → File (API expects File)
				const file = new File([pendingCroppedBlob], 'avatar.jpg', {
					type: 'image/jpeg',
				});

				formDataUpload.append('file', file);

				const res = await fetch('/api/upload-avatar', {
					method: 'POST',
					body: formDataUpload,
				});

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
			setSavedData(updated); // Update snapshot
			toast.success('Profile updated successfully!', { id: toastId });
			queryClient.invalidateQueries({ queryKey: ['userProfile'] });
			setIsEditing(false);
		} catch (error: any) {
			toast.error(error.message || 'Something went wrong.', {
				id: toastId,
			});
		} finally {
			setSaving(false);
		}
	};

	// Returns true if anything changed compared to last save
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
			toast.success('Financial data completely cleared.', {
				id: toastId,
			});
		} catch (error: any) {
			toast.error(error.message || 'Failed to clear data.', {
				id: toastId,
			});
		} finally {
			setClearing(false);
		}
	};

	if (status === 'loading' || loading) {
		return (
			<div className='flex-1 flex justify-center items-center'>
				<div className='w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin' />
			</div>
		);
	}

	return (
		<div className='relative flex-1 w-full min-h-[calc(100vh-64px)] overflow-hidden'>
			{/* Background Grid & Dot Patterns */}

			<div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<Link
					href='/dashboard'
					className='inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6'
				>
					<ArrowLeft size={18} />
					<span className='font-medium'>Back to Dashboard</span>
				</Link>

				<div className='flex flex-col md:flex-row gap-8'>
					{/* Profile Edit Section */}
					<div className='flex-1 bg-violet-50/60 backdrop-blur-xl dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-6 sm:p-8 shadow-sm h-fit'>
						<div className='flex items-center gap-4 mb-8'>
							{/* Avatar */}
							<div
								className={`relative group/avatar ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
								onClick={() =>
									isEditing &&
									document
										.getElementById('avatar-upload')
										?.click()
								}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={
										pendingPreviewUrl ||
										formData.profile ||
										'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
									}
									alt='Profile avatar'
									className='w-20 h-20 rounded-full border-2 border-white dark:border-slate-800 shadow-md object-cover'
								/>
								{isEditing && (
									<div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity'>
										<Camera
											size={20}
											className='text-white'
										/>
									</div>
								)}
								{pendingPreviewUrl && (
									<div className='absolute -bottom-1 -right-1 bg-violet-600 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold shadow'>
										PENDING
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

							<div className='flex-1'>
								<h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
									Your Profile
								</h1>
								<p className='text-sm text-slate-500'>
									{isEditing ?
										'Make your changes below.'
									:	'Your personal details.'}
								</p>
							</div>

							{/* Edit / Cancel toggle */}
							{!isEditing ?
								<button
									type='button'
									onClick={() => setIsEditing(true)}
									className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition-all'
								>
									<Pencil size={14} /> Edit
								</button>
							:	<button
									type='button'
									onClick={handleCancelEdit}
									className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all'
								>
									<X size={14} /> Cancel
								</button>
							}
						</div>

						<form
							onSubmit={handleSave}
							className='space-y-5'
						>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
								<div>
									<label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
										Name
									</label>
									<div className='relative'>
										<User
											className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
											size={16}
										/>
										<input
											type='text'
											name='name'
											value={formData.name}
											onChange={handleChange}
											readOnly={!isEditing}
											className={`w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none transition-all ${isEditing ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-slate-100 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 cursor-default'}`}
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
										Email{' '}
										<span className='text-xs text-slate-400'>
											(Read-only)
										</span>
									</label>
									<input
										type='email'
										value={formData.email}
										readOnly
										className='w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none'
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
										Age
									</label>
									<div className='relative'>
										<Calendar
											className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
											size={16}
										/>
										<input
											type='text'
											name='age'
											value={formData.age}
											onChange={handleChange}
											readOnly={!isEditing}
											className={`w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none transition-all ${isEditing ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-slate-100 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 cursor-default'}`}
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
										Gender
									</label>
									<select
										name='gender'
										value={formData.gender}
										onChange={handleChange}
										disabled={!isEditing}
										className={`w-full px-3 py-2.5 rounded-xl border outline-none appearance-none transition-all ${isEditing ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-slate-100 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 cursor-default'}`}
									>
										<option value=''>Select...</option>
										<option value='male'>Male</option>
										<option value='female'>Female</option>
										<option value='other'>Other</option>
									</select>
								</div>

								<div>
									<label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
										Contact Number
									</label>
									<div
										className={`w-full px-4 py-2.5 rounded-xl border transition-all ${isEditing ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus-within:ring-2 focus-within:ring-indigo-500' : 'border-transparent bg-slate-100 dark:bg-slate-800/30 pointer-events-none'}`}
									>
										<PhoneInput
											international
											defaultCountry={
												defaultCountry || 'IN'
											}
											value={
												formData.contact_number as any
											}
											onChange={(val: any) =>
												setFormData((prev) => ({
													...prev,
													contact_number: val || '',
												}))
											}
											className={`w-full outline-none text-sm ${!isEditing ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}
											disabled={!isEditing}
										/>
									</div>
								</div>
							</div>

							{isEditing && (
								<div className='pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end'>
									<button
										type='submit'
										disabled={saving || !hasChanges()}
										className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed'
									>
										{saving ? 'Saving...' : 'Save Changes'}
									</button>
								</div>
							)}
						</form>
					</div>

					{/* Danger & Logout Actions Section */}
					<div className='md:w-80 flex flex-col gap-6'>
						<div className='bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 shadow-sm'>
							<div className='flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-2'>
								<Trash2 size={20} />
								<h2 className='font-semibold text-lg'>
									Danger Zone
								</h2>
							</div>
							<p className='text-sm text-rose-700/80 dark:text-rose-400/80 mb-6'>
								Clear all your incomes and expenses permanently.
								Your login info will remain intact.
							</p>
							<button
								onClick={() => setConfirmOpen(true)}
								disabled={clearing}
								className='w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-rose-600/20 disabled:opacity-70'
							>
								{clearing ?
									'Clearing Data...'
								:	'Clear Financial Data'}
							</button>
						</div>

						<div className='bg-fuchsia-50/60 backdrop-blur-xl dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/20 rounded-3xl p-6 shadow-sm flex-1'>
							<h2 className='font-semibold text-lg text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2'>
								<LogOut
									size={20}
									className='text-slate-500'
								/>
								Account Actions
							</h2>
							<button
								onClick={() => signOut({ callbackUrl: '/' })}
								className='w-full border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2'
							>
								<LogOut size={16} />
								Sign Out Securely
							</button>
						</div>
					</div>
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
			</div>
		</div>
	);
}
