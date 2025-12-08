import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger, SidebarRail } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getUserProfile } from "@/lib/supabase/user"
import { Separator } from "@/components/ui/separator"
import { DashboardLoader } from "@/components/dashboard-loader"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/login")
  }

  return (
    <>
      <DashboardLoader />
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          userRole={profile.role}
          userName={profile.full_name || profile.email}
          userEmail={profile.email}
          companyName={profile.company?.name}
          avatarUrl={profile.avatar_url}
        />
        <SidebarRail />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1" />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}

