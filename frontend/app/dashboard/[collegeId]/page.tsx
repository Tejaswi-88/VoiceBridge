export default async function DashboardHome({
  params,
}: {
  params: Promise<{ collegeId: string }>;
}) {
  const { collegeId } = await params;

  return (
    <div>
      <h2>Welcome to {collegeId} Dashboard</h2>
      <p>Select a module from the sidebar.</p>
    </div>
  );
}
