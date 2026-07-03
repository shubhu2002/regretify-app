import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Notes from '@/components/notes';
import { redirect } from 'next/navigation';

export default async function NotesPage() {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect('/');
	}

	return <Notes />;
}
