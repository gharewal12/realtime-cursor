import React from 'react';
import DashboardSetup from '@/components/dashboard-setup/dashboard-setup';
import db from '@/lib/supabase/db';
import { getUserSubscriptionStatus } from '@/lib/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const workspace = await db.query.workspaces.findFirst({
    where: (workspace, { eq }) => eq(workspace.workspaceOwner, user.id),
  });

  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  if (subscriptionError) return;

  if (!workspace)
    return (
      <div
        className="bg-background
          h-screen
          w-screen
          flex
          justify-center
          items-center
          "
      >
        <DashboardSetup
          user={user}
          subscription={subscription}
        ></DashboardSetup>
      </div>
    );

  redirect(`/dashboard/${workspace.id}`);

  return <div>DashboardPage</div>;
};

export default DashboardPage;
