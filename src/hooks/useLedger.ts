import { useQuery } from '@tanstack/react-query';
import { LedgerAccount, LedgerBook } from '@/types';

interface LedgerResponse {
	books: LedgerBook[];
	accounts: LedgerAccount[];
	balances: Record<number, number>;
}

export function useLedger(bookId?: number) {
	const query = useQuery({
		queryKey: ['ledger', bookId ?? null],
		queryFn: async () => {
			const url =
				bookId ? `/api/ledger?book_id=${bookId}` : '/api/ledger';
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error('Failed to fetch ledger');
			}
			return (await res.json()) as LedgerResponse;
		},
		refetchInterval: 5000,
	});
	return {
		...query,
		books: query.data?.books ?? [],
		accounts: query.data?.accounts ?? [],
		balances: query.data?.balances ?? {},
	};
}
