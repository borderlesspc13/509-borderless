import { redirect } from "next/navigation";

import { hasUserAcceptedTerm } from "@/app/actions/terms-actions";
import { DashboardProviders } from "@/components/layout/dashboard-providers";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireServerUserSession } from "@/lib/auth-server";
import { FAMILIA_HOME_PATH, isFamilyOnlyRole } from "@/lib/rbac";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireServerUserSession();

  if (isFamilyOnlyRole(session.profile)) {
    redirect(FAMILIA_HOME_PATH);
  }

  const needsTermsAcceptance = !(await hasUserAcceptedTerm(session.id));

  return (
    <DashboardProviders session={session}>
      <DashboardShell needsTermsAcceptance={needsTermsAcceptance}>
        {children}
      </DashboardShell>
    </DashboardProviders>
  );
}
