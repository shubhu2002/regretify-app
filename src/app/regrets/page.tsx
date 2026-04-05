import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Regrets from "@/components/regrets";
import { redirect } from "next/navigation";

export default async function RegretsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/"); // Return to landing page if blocked
  }

  return <Regrets session={session} />;
}
