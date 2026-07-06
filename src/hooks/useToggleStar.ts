import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useToggleStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: number) => {
      const res = await fetch("/api/ledger", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggle_star",
          id: entryId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ledger-entries"],
      });
    },

    onError: () => {
      toast.error("Something went wrong");
    },
  });
}