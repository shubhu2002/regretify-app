'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import AppLockScreen from '@/components/AppLockScreen';

// The lock screen only guards these pages — the public landing page ('/')
// stays accessible while the session is still locked
const PROTECTED_ROUTES = ['/regrets', '/ledger', '/notes', '/profile'];

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
	const pathname = usePathname();
	const isProtectedRoute = PROTECTED_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(route + '/'),
	);
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

	if (isLocked && isProtectedRoute) {
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
