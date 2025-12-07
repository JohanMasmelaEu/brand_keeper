import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/logout-button'
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
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Empresas</CardTitle>
          <CardDescription>
            Administra empresas matriz e hijas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Gestionar Empresas</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Administra usuarios y permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Gestionar Usuarios</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Marca</CardTitle>
          <CardDescription>
            Configura la marca matriz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Configurar Marca</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activos de Marca</CardTitle>
          <CardDescription>
            Gestiona recursos globales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Ver Activos</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Firma</CardTitle>
          <CardDescription>
            Administra plantillas globales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Gestionar Plantillas</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual de Marca</CardTitle>
          <CardDescription>
            Visualiza el manual generado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Ver Manual</Button>
        </CardContent>
      </Card>
    </>
  )
}

// Componente para las cards del Admin
function AdminCards() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Marca</CardTitle>
          <CardDescription>
            Configura la marca de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Configurar Marca</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activos de Marca</CardTitle>
          <CardDescription>
            Gestiona recursos de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Ver Activos</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colaboradores</CardTitle>
          <CardDescription>
            Gestiona colaboradores de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Gestionar Colaboradores</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Firma</CardTitle>
          <CardDescription>
            Administra plantillas de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Gestionar Plantillas</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual de Marca</CardTitle>
          <CardDescription>
            Visualiza el manual de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Ver Manual</Button>
        </CardContent>
      </Card>
    </>
  )
}

// Componente para las cards del Colaborador
function CollaboratorCards() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Activos de Marca</CardTitle>
          <CardDescription>
            Explora recursos disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Ver Activos</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generador de Firma</CardTitle>
          <CardDescription>
            Crea tu firma de correo personalizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Generar Firma</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual de Marca</CardTitle>
          <CardDescription>
            Consulta lineamientos de marca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Ver Manual</Button>
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
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">{getDashboardTitle(profile.role)}</h1>
          <p className="text-muted-foreground">
            Bienvenido, {profile.full_name || profile.email}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Empresa: {profile.company?.name || 'N/A'}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {renderCards()}
      </div>
    </div>
  )
}
