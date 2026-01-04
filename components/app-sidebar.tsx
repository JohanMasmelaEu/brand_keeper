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
  const { state, isInitialized } = useSidebar()
  const isMobile = useIsMobile()
  // En mobile, el sidebar siempre está expandido (es un Sheet), así que no usamos isCollapsed
  // En desktop, usamos el estado del sidebar
  const isCollapsed = isMobile ? false : state === "collapsed"
  // Inicializar showLabel como false para evitar discrepancias de hidratación
  // Se actualizará después de que el sidebar esté inicializado
  const [showLabel, setShowLabel] = React.useState(false)

  // Controlar la animación del label cuando el sidebar se expande
  // Solo después de que el sidebar esté inicializado para evitar problemas de hidratación
  React.useEffect(() => {
    if (!isInitialized) {
      // Esperar a que el sidebar esté inicializado antes de mostrar labels
      return
    }
    
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
  }, [isCollapsed, isInitialized])

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
        <div className="px-2 py-1 flex flex-col items-center">
          <div className="relative w-[76.5%] h-auto my-3 transition-all duration-500 ease-out">
            <Image
              src="/images/LOGO_BRAND_KEEPER.gif"
              alt="Brand Keeper Logo"
              width={0}
              height={0}
              sizes="(max-width: 256px) 100vw, 256px"
              className="w-full h-auto object-contain transition-all duration-500 ease-out smooth-gif-animation"
              unoptimized
            />
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
                // Para Dashboard, solo activo si es exactamente /dashboard
                // Para otros elementos, activo si coincide exactamente o es una subruta
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname?.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link 
                        href={item.href} 
                        className="flex items-center gap-2 w-full transition-all duration-300 ease-in-out"
                      >
                        <span 
                          className={`md:text-xl transition-all duration-300 ease-in-out ${
                            isActive 
                              ? "text-white font-medium" 
                              : "text-sidebar-foreground"
                          }`}
                        >
                          {item.title}
                        </span>
                        <Icon 
                          className={`h-6 w-6 shrink-0 transition-all duration-300 ease-in-out ${
                            isActive 
                              ? "text-primary scale-110" 
                              : "text-sidebar-foreground"
                          }`} 
                        />
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
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 shrink-0 transition-all duration-500 ease-out">
                    <AvatarImage src={avatarUrl || undefined} alt={userName || "Usuario"} />
                    <AvatarFallback className="text-sm">
                      {getInitials(userName, userEmail)}
                    </AvatarFallback>
                  </Avatar>
                  {(!isCollapsed || isMobile) && (
                    <>
                      <div className="flex flex-col items-start min-w-0 flex-1 transition-all duration-500 ease-out">
                        <span className="text-sm md:text-xl font-medium truncate w-full transition-opacity duration-500 ease-out">{userName || "Usuario"}</span>
                        {userEmail && (
                          <span className="text-xs md:text-lg text-muted-foreground truncate w-full transition-opacity duration-500 ease-out">{userEmail}</span>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 ml-auto transition-opacity duration-500 ease-out" />
                    </>
                  )}
                </div>
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

