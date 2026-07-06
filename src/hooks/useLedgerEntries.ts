import { useInfiniteQuery } from "@tanstack/react-query";

const ENTRIES_PER_PAGE = 10;

export function useLedgerEntries(accountId?: number) {
  const query = useInfiniteQuery({
    queryKey: ["ledger-entries", accountId],

    enabled: !!accountId,

    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const res = await fetch(
        `/api/ledger/entries?account_id=${accountId}&page=${pageParam}&per_page=${ENTRIES_PER_PAGE}`
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      return res.json();
    },

    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next
        ? lastPage.pagination.page + 1
        : undefined,

    refetchInterval: 5000,
  });

  const entries =
    query.data?.pages.flatMap((page) => page.entries) ?? [];

  const balance =
    query.data?.pages[0]?.balance ?? 0;

  return {
    ...query,
    entries,
    balance,
  };
}