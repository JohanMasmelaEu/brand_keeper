import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/lib/types/user'

// Función helper para obtener el título del dashboard según el rol
function getDashboardTitle(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Dashboard Super Admin'
    case 'admin':
      return 'Dashboard Admin'
    case 'collaborator':
      return 'Dashboard Colaborador'
    default:
      return 'Dashboard'
  }
}

// Componente para las cards del Super Admin
function SuperAdminCards() {
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Gestión de Empresas</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Administra empresas matriz e hijas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Gestionar Empresas</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Usuarios</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Administra usuarios y permisos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Gestionar Usuarios</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Configuración de Marca</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configura la marca matriz
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Configurar Marca</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Activos de Marca</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Gestiona recursos globales
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Ver Activos</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Plantillas de Firma</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Administra plantillas globales
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Gestionar Plantillas</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Manual de Marca</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Visualiza el manual generado
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Ver Manual</Button>
        </CardContent>
      </Card>
    </>
  )
}

// Componente para las cards del Admin
function AdminCards() {
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Configuración de Marca</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configura la marca de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Configurar Marca</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Activos de Marca</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Gestiona recursos de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Ver Activos</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Colaboradores</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Gestiona colaboradores de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Gestionar Colaboradores</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Plantillas de Firma</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Administra plantillas de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Gestionar Plantillas</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Manual de Marca</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Visualiza el manual de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Ver Manual</Button>
        </CardContent>
      </Card>
    </>
  )
}

// Componente para las cards del Colaborador
function CollaboratorCards() {
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Activos de Marca</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Explora recursos disponibles
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Ver Activos</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Generador de Firma</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Crea tu firma de correo personalizada
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Generar Firma</Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Manual de Marca</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Consulta lineamientos de marca
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex items-end">
          <Button className="w-full text-sm sm:text-base">Ver Manual</Button>
        </CardContent>
      </Card>
    </>
  )
}

export default async function Dashboard() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Renderizar contenido según el rol
  const renderCards = () => {
    switch (profile.role) {
      case 'super_admin':
        return <SuperAdminCards />
      case 'admin':
        return <AdminCards />
      case 'collaborator':
        return <CollaboratorCards />
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
          {getDashboardTitle(profile.role)}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground break-words">
          Bienvenido, {profile.full_name || profile.email}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
          Empresa: {profile.company?.name || 'N/A'}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {renderCards()}
      </div>
    </div>
  )
}
