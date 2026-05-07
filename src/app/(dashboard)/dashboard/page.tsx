import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <p className="mt-4">
        Logged in as: {user?.email}
      </p>
    </div>
  );
}