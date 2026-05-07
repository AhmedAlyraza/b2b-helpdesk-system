import { getCurrentUser } from "@/lib/auth";

import { db } from "@/lib/db";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const fullUser = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    include: {
      organization: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <p className="mt-4">
        Logged in as: {fullUser?.email}
      </p>

      <p>
        Organization:{" "}
        {fullUser?.organization?.name}
      </p>
    </div>
  );
}