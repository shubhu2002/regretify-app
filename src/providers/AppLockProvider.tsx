'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import AppLockScreen from '@/components/AppLockScreen';

interface AppLockContextType {
	isLocked: boolean;
	hasPasscode: boolean;
	passcodeLength: 4 | 6 | null;
	refreshPasscodeStatus: () => Promise<void>;
}

const AppLockContext = createContext<AppLockContextType>({
	isLocked: false,
	hasPasscode: false,
	passcodeLength: null,
	refreshPasscodeStatus: async () => {},
});

export const useAppLock = () => useContext(AppLockContext);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
	const { status } = useSession();
	const [hasPasscode, setHasPasscode] = useState(false);
	const [passcodeLength, setPasscodeLength] = useState<4 | 6 | null>(null);
	const [isLocked, setIsLocked] = useState(false);
	const [checked, setChecked] = useState(false);

	const checkPasscode = useCallback(async () => {
		try {
			const res = await fetch('/api/user/passcode');
			if (res.ok) {
				const data = await res.json();
				setHasPasscode(data.enabled);
				setPasscodeLength(data.length || null);
				if (data.enabled && !checked) {
					setIsLocked(true);
				}
			}
		} catch {
			// silently fail
		} finally {
			setChecked(true);
		}
	}, [checked]);

	useEffect(() => {
		if (status === 'authenticated') {
			checkPasscode();
		} else {
			setIsLocked(false);
			setHasPasscode(false);
			setPasscodeLength(null);
			setChecked(false);
		}
	}, [status]);

	const refreshPasscodeStatus = useCallback(async () => {
		try {
			const res = await fetch('/api/user/passcode');
			if (res.ok) {
				const data = await res.json();
				setHasPasscode(data.enabled);
				setPasscodeLength(data.length || null);
			}
		} catch {
			// silently fail
		}
	}, []);

	const handleUnlock = useCallback(() => {
		setIsLocked(false);
	}, []);

	if (isLocked) {
		return (
			<AppLockContext.Provider value={{ isLocked, hasPasscode, passcodeLength, refreshPasscodeStatus }}>
				<AppLockScreen onUnlock={handleUnlock} passcodeLength={passcodeLength || 4} />
			</AppLockContext.Provider>
		);
	}

	return (
		<AppLockContext.Provider value={{ isLocked, hasPasscode, passcodeLength, refreshPasscodeStatus }}>
			{children}
		</AppLockContext.Provider>
	);
}
