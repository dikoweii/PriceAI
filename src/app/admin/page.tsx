import { AdminConsole } from "@/components/AdminConsole";
import { getAdminSummary } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAdminSummary();

  return <AdminConsole data={data} />;
}
