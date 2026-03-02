import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ collegeId: string }>;
}) {
  const { collegeId } = await params;

  return (
    <div className="d-flex">
      <Sidebar collegeId={collegeId} />
      <main className="flex-grow-1 p-4">{children}</main>
    </div>
  );
}
