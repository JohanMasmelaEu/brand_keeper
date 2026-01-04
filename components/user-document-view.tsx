"use client"

import * as React from "react"
import type { UserProfile } from "@/lib/types/user"
import type { Company } from "@/lib/types/user"
import { Building2, Shield, UserCog, User, CalendarPlus, CalendarCheck, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckSealAnimation } from "@/components/check-seal-animation"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface UserDocumentViewProps {
  user: UserProfile
  company?: Company | null // Empresa del usuario (opcional)
  isLoading?: boolean // Prop para mostrar loader
  showSuccess?: boolean // Prop para mostrar animación de éxito
  isCreating?: boolean // Prop para indicar si está en modo creación (muestra placeholders)
}

const roleLabels: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Administrador", color: "bg-purple-100 text-purple-800 border-purple-300" },
  admin: { label: "Administrador", color: "bg-blue-100 text-blue-800 border-blue-300" },
  collaborator: { label: "Colaborador", color: "bg-green-100 text-green-800 border-green-300" },
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  super_admin: Shield,
  admin: UserCog,
  collaborator: User,
}

export function UserDocumentView({ user, company, isLoading = false, showSuccess = false, isCreating = false }: UserDocumentViewProps) {
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

  const roleConfig = roleLabels[user.role] || { label: user.role, color: "bg-gray-100 text-gray-800 border-gray-300" }

  // Skeleton del documento
  if (isLoading && !isCreating) {
    return (
      <div className="w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 relative">
        {/* Título y Tipo de usuario */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>

        {/* Encabezado del documento */}
        <div className="border-b-2 border-gray-400 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <Skeleton className="h-3 w-64 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 relative">
      {/* Overlay de loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-sm font-medium text-gray-700">Actualizando usuario...</p>
          </div>
        </div>
      )}
      
      {/* Animación de check con sello */}
      {showSuccess && <CheckSealAnimation variant="success" show={showSuccess} />}
      
      {/* Título y Estado del usuario - Arriba del todo */}
      <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-2 duration-700 ease-out">
        <div>
          <h2 className="text-xl font-bold text-gray-900">REGISTRO DE USUARIO</h2>
          <p className="text-xs text-gray-600">Brand Keeper - Sistema de Gestión</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-300">
          {user.is_active ? (
            <>
              <div className="flex items-center justify-center h-4 w-4 rounded-full bg-green-600" style={{ aspectRatio: "1 / 1", borderRadius: "50%" }}>
                <CheckCircle2 className="h-2.5 w-2.5 text-white fill-white" />
              </div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Activo
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center h-4 w-4 rounded-full bg-red-600" style={{ aspectRatio: "1 / 1", borderRadius: "50%" }}>
                <XCircle className="h-2.5 w-2.5 text-white fill-white" />
              </div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Inactivo
              </p>
            </>
          )}
        </div>
      </div>

      {/* Encabezado del documento */}
      <div className="border-b-2 border-gray-400 pb-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-700 ease-out" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-20 w-20 border-2 border-gray-300">
              <AvatarImage
                src={user.avatar_url || undefined}
                alt={user.full_name || user.email}
              />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials(user.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-gray-900 truncate">
                {user.full_name || (isCreating ? "Nombre Completo" : user.email)}
              </h3>
              <p className="text-sm text-gray-600 mt-1 truncate">
                {user.email || (isCreating ? "Correo Electrónico" : "")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Fechas en el encabezado */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 flex-row-reverse">
                <CalendarPlus className="h-4 w-4 text-gray-600" />
                <div className="text-right">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Fecha de Creación
                  </label>
                  <p className="text-xs text-gray-900 mt-0.5">
                    {format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-row-reverse">
                <CalendarCheck className="h-4 w-4 text-gray-600" />
                <div className="text-right">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Última Actualización
                  </label>
                  <p className="text-xs text-gray-900 mt-0.5">
                    {format(new Date(user.updated_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="space-y-6">
        {/* Empresa y Rol */}
        <div className="border-b border-gray-200 pb-4 animate-in fade-in slide-in-from-left-2 duration-700 ease-out" style={{ animationDelay: '400ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 min-w-8 flex items-center justify-center mt-0.5">
                {!company?.logo_url && <Building2 className="h-5 w-5 text-gray-600" />}
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Empresa
                </label>
                {company?.logo_url ? (
                  <div className="mt-1">
                    <Image
                      src={company.logo_url}
                      alt={`Logo de ${company.name}`}
                      width={0}
                      height={80}
                      className="h-20 w-auto max-w-full object-contain"
                      unoptimized={company.logo_url.startsWith("http")}
                    />
                    {company.is_parent && (
                      <span className="text-xs text-gray-500 mt-1 block">(Matriz)</span>
                    )}
                  </div>
                ) : (
                  <p className="text-base text-gray-900 mt-1">
                    {company ? (
                      <>
                        {company.name}
                        {company.is_parent && (
                          <span className="text-xs text-gray-500 ml-2">(Matriz)</span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">
                        {isCreating ? "Empresa" : "No especificada"}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 min-w-8 flex items-center justify-center mt-0.5">
                {/* Espacio reservado para mantener alineación con el icono de empresa */}
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Rol
                </label>
                <div className="flex items-center gap-2 mt-1" style={{ minHeight: company?.logo_url ? '80px' : 'auto' }}>
                  {(() => {
                    const RoleIcon = roleIcons[user.role] || Shield
                    return (
                      <RoleIcon className="h-6 w-6 text-gray-600 flex-shrink-0" />
                    )
                  })()}
                  <p className="text-xl font-semibold text-gray-900 leading-none flex items-center">
                    {roleConfig.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página del documento */}
      <div className="mt-8 pt-4 border-t border-gray-300 animate-in fade-in duration-700 ease-out" style={{ animationDelay: '600ms' }}>
        <p className="text-xs text-gray-500 text-center">
          Documento generado el {format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
        </p>
      </div>
    </div>
  )
}

