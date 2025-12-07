"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Building2,
  Users,
  Palette,
  Image as ImageIcon,
  Mail,
  BookOpen,
  LayoutDashboard,
  ChevronDown,
  User,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/types/user"
import { useIsMobile } from "@/hooks/use-mobile"

interface AppSidebarProps {
  userRole: UserRole
  userName?: string | null
  userEmail?: string | null
  companyName?: string | null
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "admin", "collaborator"],
  },
  {
    title: "Empresas",
    href: "/dashboard/companies",
    icon: Building2,
    roles: ["super_admin"],
  },
  {
    title: "Usuarios",
    href: "/dashboard/users",
    icon: Users,
    roles: ["super_admin"],
  },
  {
    title: "Colaboradores",
    href: "/dashboard/collaborators",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Configuración de Marca",
    href: "/dashboard/brand-settings",
    icon: Palette,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Activos de Marca",
    href: "/dashboard/brand-assets",
    icon: ImageIcon,
    roles: ["super_admin", "admin", "collaborator"],
  },
  {
    title: "Plantillas de Firma",
    href: "/dashboard/email-signatures",
    icon: Mail,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Generador de Firma",
    href: "/dashboard/email-signature-generator",
    icon: Mail,
    roles: ["collaborator"],
  },
  {
    title: "Manual de Marca",
    href: "/dashboard/brand-manual",
    icon: BookOpen,
    roles: ["super_admin", "admin", "collaborator"],
  },
]

export function AppSidebar({ userRole, userName, userEmail, companyName }: AppSidebarProps) {
  const pathname = usePathname()
  const [isCompanyOpen, setIsCompanyOpen] = React.useState(false)
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const isMobile = useIsMobile()

  // Filtrar items según el rol del usuario
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  // Obtener iniciales del usuario para el avatar
  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      const parts = name.split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name[0]?.toUpperCase() || "U"
    }
    if (email) {
      return email[0]?.toUpperCase() || "U"
    }
    return "U"
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-4 flex flex-col items-center gap-3">
          <div className={`relative ${isCollapsed ? "h-10 w-10" : "h-16 w-16"}`}>
            <Image
              src="/images/LOGO_BRAND_KEEPER.png"
              alt="Brand Keeper Logo"
              width={isCollapsed ? 40 : 64}
              height={isCollapsed ? 40 : 64}
              className="object-contain"
            />
          </div>
          <div
            className={`flex flex-col items-center transition-opacity duration-200 ${
              isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
            }`}
          >
            <span className="text-xl font-semibold font-sans" style={{ color: '#1b2c59' }}>
              Brand keeper
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-2 h-auto hover:bg-sidebar-accent"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={undefined} alt={userName || "User"} />
                    <AvatarFallback className="text-xs">
                      {getInitials(userName, userEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium truncate w-full">{userName || "User"}</span>
                    {userEmail && (
                      <span className="text-xs text-muted-foreground truncate w-full">{userEmail}</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side={isMobile ? "top" : "right"}
              className={isMobile ? "w-[calc(100vw-1rem)] max-w-xs" : "w-56"}
              sideOffset={8}
            >
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{userName || "User"}</span>
                  {userEmail && (
                    <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

