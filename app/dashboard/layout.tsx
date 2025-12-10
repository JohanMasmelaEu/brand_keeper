import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger, SidebarRail } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getUserProfile } from "@/lib/supabase/user"
import { Separator } from "@/components/ui/separator"
import { DashboardLoader } from "@/components/dashboard-loader"
import { DashboardTransitionWrapper } from "@/components/dashboard-transition-wrapper"

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
      {/* Script inline solo para leer el estado del sidebar antes de la hidratación */}
      {/* No manipulamos el DOM para evitar problemas de hidratación */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (typeof document === 'undefined') return;
              try {
                // Leer el estado del sidebar desde la cookie
                const cookies = document.cookie.split(';');
                const sidebarCookie = cookies.find(cookie => 
                  cookie.trim().startsWith('sidebar_state=')
                );
                if (sidebarCookie) {
                  const value = sidebarCookie.split('=')[1]?.trim();
                  if (value === 'false') {
                    document.documentElement.setAttribute('data-sidebar-initial-state', 'collapsed');
                  } else if (value === 'true') {
                    document.documentElement.setAttribute('data-sidebar-initial-state', 'expanded');
                  }
                }
              } catch (e) {
                // Silently fail
              }
            })();
          `,
        }}
      />
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
          <div className="flex flex-1 flex-col gap-4">
            <DashboardTransitionWrapper>
              <div className="dashboard-module-content">
                {children}
              </div>
            </DashboardTransitionWrapper>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}

