import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Ledger from '@/components/ledger';
import { redirect } from 'next/navigation';

export default async function LedgerPage() {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect('/');
	}

	return <Ledger session={session} />;
}
