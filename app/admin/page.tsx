import AdminPageClient from "@/components/admin/AdminPageClient";
import { getEditorialSnapshotAction } from "@/app/actions/pipeline";

export default async function AdminPage() {
  const snapshot = await getEditorialSnapshotAction();

  return (
    <AdminPageClient
      initialSession={snapshot.data?.username || null}
      initialDrafts={snapshot.data?.drafts || []}
      initialHistory={snapshot.data?.history || []}
      initialConfig={snapshot.data?.config || {
        daily_news_target: 5,
        schedule_times: "08:00,13:00,19:00",
        auto_approve_if_quality_ok: true,
      }}
    />
  );
}
