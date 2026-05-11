import { PriceExplorer } from "@/components/PriceExplorer";
import { SubmissionFloater } from "@/components/SubmissionFloater";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardData();

  return (
    <>
      <PriceExplorer data={data} />
      <SubmissionFloater />
    </>
  );
}
