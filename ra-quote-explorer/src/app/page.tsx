import { use } from "react";
import { UploadView } from "@/components/upload_view";
import { RecentAttestations } from "@/components/recent_attestations";

export default function Home() {
  const items = use(
    fetch(`${process.env.API_PREFIX}/api/attestations/recent`, {
      cache: "no-store",
    }).then((res) => res.json().catch(() => [])),
  );
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <UploadView />
      <RecentAttestations items={items} />
    </div>
  );
}
