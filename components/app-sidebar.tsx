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
import { UserProfileModal } from "@/components/user-profile-modal"

interface AppSidebarProps {
  userRole: UserRole
  userName?: string | null
  userEmail?: string | null
  companyName?: string | null
  avatarUrl?: string | null
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

export function AppSidebar({ userRole, userName, userEmail, companyName, avatarUrl }: AppSidebarProps) {
  const pathname = usePathname()
  const [isCompanyOpen, setIsCompanyOpen] = React.useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false)
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const isMobile = useIsMobile()
  const [showLabel, setShowLabel] = React.useState(!isCollapsed)

  // Controlar la animación del label cuando el sidebar se expande
  React.useEffect(() => {
    if (isCollapsed) {
      // Ocultar con un pequeño delay para suavizar la transición
      const timer = setTimeout(() => {
        setShowLabel(false)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      // Mostrar con delay después de que termine la expansión (500ms de transición del sidebar)
      const timer = setTimeout(() => {
        setShowLabel(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isCollapsed])

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
          <div className={`relative transition-all duration-500 ease-out ${isCollapsed ? "h-10 w-10" : "h-16 w-16"}`}>
            <Image
              src="/images/LOGO_BRAND_KEEPER.png"
              alt="Brand Keeper Logo"
              width={isCollapsed ? 40 : 64}
              height={isCollapsed ? 40 : 64}
              className="object-contain transition-all duration-500 ease-out"
            />
          </div>
          <div
            className={`flex flex-col items-center transition-all duration-500 ease-out ${
              isCollapsed ? "opacity-0 h-0 overflow-hidden max-h-0" : "opacity-100 max-h-20"
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
          <SidebarGroupLabel
            className={`transition-opacity duration-700 ease-out ${
              showLabel && !isCollapsed ? "opacity-100" : "opacity-0"
            }`}
          >
            Funcionalidades
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} className="flex items-center gap-2 w-full">
                        <span className={`md:text-xl transition-[opacity,width,max-width,color] duration-500 ease-out ${isActive ? "text-white" : ""}`}>{item.title}</span>
                        <Icon className={`h-6 w-6 shrink-0 transition-all duration-500 ease-out ${isActive ? "text-primary" : ""}`} />
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
        <div className={`py-2 transition-all duration-500 ease-out ${isCollapsed ? "px-0" : "px-2"}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full h-auto hover:bg-sidebar-accent transition-all duration-500 ease-out ${
                  isCollapsed ? "justify-center p-2" : "justify-start p-2"
                }`}
              >
                {isCollapsed ? (
                  <Avatar className="h-12 w-12 shrink-0 transition-all duration-500 ease-out">
                    <AvatarImage src={avatarUrl || undefined} alt={userName || "Usuario"} />
                    <AvatarFallback className="text-sm">
                      {getInitials(userName, userEmail)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 shrink-0 transition-all duration-500 ease-out">
                        <AvatarImage src={avatarUrl || undefined} alt={userName || "Usuario"} />
                        <AvatarFallback className="text-sm">
                          {getInitials(userName, userEmail)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start min-w-0 flex-1 transition-all duration-500 ease-out">
                        <span className="text-sm md:text-xl font-medium truncate w-full transition-opacity duration-500 ease-out">{userName || "Usuario"}</span>
                        {userEmail && (
                          <span className="text-xs md:text-lg text-muted-foreground truncate w-full transition-opacity duration-500 ease-out">{userEmail}</span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 ml-auto transition-opacity duration-500 ease-out" />
                  </>
                )}
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
                  <span className="text-sm font-medium">{userName || "Usuario"}</span>
                  {userEmail && (
                    <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
      <UserProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        companyName={companyName}
        avatarUrl={avatarUrl}
      />
    </Sidebar>
  )
}

