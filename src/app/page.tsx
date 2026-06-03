import { PriceExplorer } from "@/components/PriceExplorer";
import { SubmissionFloater } from "@/components/SubmissionFloater";
import { getExplorerData } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const data = await getExplorerData();

  return (
    <>
      <PriceExplorer data={data} />
      <SubmissionFloater />
    </>
  );
}
