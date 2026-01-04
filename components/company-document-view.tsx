"use client"

import * as React from "react"
import type { Company } from "@/lib/types/user"
import type { Country } from "@/lib/types/country"
import type { CompanySocialMedia } from "@/lib/types/social-media"
import { getSocialMediaConfig } from "@/lib/types/social-media"
import { getCountryFlagByName } from "@/lib/utils/country"
import { SocialMediaIcon } from "@/components/social-media-icons"
import { Building2, Globe, MapPin, FileText, CalendarPlus, CalendarCheck, Users, Loader2, Flag, Store, Scale } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CheckSealAnimation } from "@/components/check-seal-animation"
import { Skeleton } from "@/components/ui/skeleton"

interface CompanyDocumentViewProps {
  company: Company
  socialMedia?: CompanySocialMedia[] // Prop opcional para redes sociales en tiempo real
  isLoading?: boolean // Prop para mostrar loader
  showSuccess?: boolean // Prop para mostrar animación de éxito
  isCreating?: boolean // Prop para indicar si está en modo creación (muestra placeholders)
}

export function CompanyDocumentView({ company, socialMedia: propSocialMedia, isLoading = false, showSuccess = false, isCreating = false }: CompanyDocumentViewProps) {
  const [countries, setCountries] = React.useState<Country[]>([])
  const [socialMedia, setSocialMedia] = React.useState<CompanySocialMedia[]>([])
  const [isLoadingSocialMedia, setIsLoadingSocialMedia] = React.useState(false)
  const [isLoadingCountries, setIsLoadingCountries] = React.useState(false)

  // Cargar países al montar el componente
  React.useEffect(() => {
    async function fetchCountries() {
      if (!company.country) {
        setIsLoadingCountries(false)
        return
      }
      setIsLoadingCountries(true)
      try {
        const response = await fetch("/api/countries")
        if (response.ok) {
          const data = await response.json()
          setCountries(data.countries || [])
        }
      } catch (error) {
        console.error("Error al cargar países:", error)
      } finally {
        setIsLoadingCountries(false)
      }
    }
    fetchCountries()
  }, [company.country])

  // Usar redes sociales de la prop si están disponibles, sino cargar desde la API
  React.useEffect(() => {
    // Si se pasan redes sociales como prop, usarlas directamente
    if (propSocialMedia !== undefined) {
      setIsLoadingSocialMedia(false)
      // Si el array está vacío, limpiar
      if (propSocialMedia.length === 0) {
        setSocialMedia([])
        return
      }

      // Si ya es un array de CompanySocialMedia completo, usarlo directamente
      if ('id' in propSocialMedia[0] && 'company_id' in propSocialMedia[0]) {
        const activeSocialMedia = propSocialMedia.filter(
          (sm) => sm.url && sm.url.trim().length > 0 && sm.is_active
        )
        setSocialMedia(activeSocialMedia)
      } else {
        // Convertir el formato del formulario { type, url } al formato de CompanySocialMedia
        const formatted = propSocialMedia
          .filter((sm: any) => sm.url && sm.url.trim().length > 0)
          .map((sm: any) => ({
            id: sm.id || `temp-${sm.type}`,
            company_id: company.id || "",
            type: sm.type,
            url: sm.url,
            is_active: true,
            created_at: sm.created_at || new Date().toISOString(),
            updated_at: sm.updated_at || new Date().toISOString(),
          }))
        setSocialMedia(formatted)
      }
      return
    }

    // Si no hay prop, cargar desde la API
    async function fetchSocialMedia() {
      if (!company.id) {
        setIsLoadingSocialMedia(false)
        return
      }
      setIsLoadingSocialMedia(true)
      try {
        const response = await fetch(`/api/companies/${company.id}/social-media`)
        if (response.ok) {
          const data = await response.json()
          // Solo mostrar las redes sociales que tienen URL y están activas
          const activeSocialMedia = (data.socialMedia || []).filter(
            (sm: CompanySocialMedia) => sm.url && sm.url.trim().length > 0 && sm.is_active
          )
          setSocialMedia(activeSocialMedia)
        } else {
          // Si hay error, inicializar como array vacío
          setSocialMedia([])
        }
      } catch (error) {
        console.error("Error al cargar redes sociales:", error)
        // En caso de error, inicializar como array vacío
        setSocialMedia([])
      } finally {
        setIsLoadingSocialMedia(false)
      }
    }
    fetchSocialMedia()
  }, [company.id, propSocialMedia])

  // Determinar si está cargando
  // Solo mostrar skeleton si está cargando redes sociales o países (cuando hay país)
  const isContentLoading = isLoadingSocialMedia || (company.country ? isLoadingCountries : false)

  // Skeleton del documento
  if (isContentLoading) {
    return (
      <div className="w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 relative">
        {/* Título y Tipo de empresa */}
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
            <Skeleton className="h-20 w-20 rounded-lg" />
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>

        {/* Información de la empresa */}
        <div className="space-y-6">
          {/* Nombre de la empresa y Nombre Legal */}
          <div className="border-b border-gray-200 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-32 mb-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </div>

          {/* País y Dirección */}
          <div className="border-b border-gray-200 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          </div>

          {/* Sitio Web y Redes Sociales */}
          <div className="border-b border-gray-200 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24 mb-2" />
                  <div className="flex items-center gap-2 mt-1">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </div>
              </div>
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
            <p className="text-sm font-medium text-gray-700">Actualizando empresa...</p>
          </div>
        </div>
      )}
      
      {/* Animación de check con sello */}
      {showSuccess && <CheckSealAnimation variant="success" show={showSuccess} />}
      {/* Título y Tipo de empresa - Arriba del todo */}
      <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-2 duration-700 ease-out">
        <div>
          <h2 className="text-xl font-bold text-gray-900">REGISTRO DE EMPRESA</h2>
          <p className="text-xs text-gray-600">Brand Keeper - Sistema de Gestión</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-300">
          <div className={`h-2 w-2 rounded-full ${company.is_parent ? 'bg-primary' : 'bg-gray-400'}`} />
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {company.is_parent ? "Empresa Matriz" : "Empresa Hija"}
          </p>
        </div>
      </div>

      {/* Encabezado del documento */}
      <div className="border-b-2 border-gray-400 pb-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-700 ease-out" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {company.logo_url ? (
              <div className="h-20 min-w-20 flex items-center justify-center">
                <Image
                  key={company.logo_url}
                  src={company.logo_url}
                  alt={`Logo de ${company.name}`}
                  width={0}
                  height={80}
                  className="h-full w-auto max-w-full object-contain animate-in fade-in zoom-in-95 duration-500"
                  unoptimized={company.logo_url.startsWith("http")}
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 shrink-0">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
            )}
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
                    {format(new Date(company.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
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
                    {format(new Date(company.updated_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la empresa */}
      <div className="space-y-6">
        {/* Nombre de la empresa y Nombre Legal en el mismo row */}
        <div className="border-b border-gray-200 pb-4 animate-in fade-in slide-in-from-left-2 duration-700 ease-out" style={{ animationDelay: '300ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nombre de la Empresa
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {company.name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nombre Legal / Razón Social
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {company.legal_name || (
                    <span className="text-gray-400 italic">
                      {isCreating ? "Nombre Legal / Razón Social" : "No especificado"}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* País y Dirección en el mismo row */}
        <div className="border-b border-gray-200 pb-4 animate-in fade-in slide-in-from-left-2 duration-700 ease-out" style={{ animationDelay: '400ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Flag className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  País
                </label>
                <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                  {company.country ? (
                    <>
                      <span>{getCountryFlagByName(company.country, countries)}</span>
                      <span>{company.country}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">
                      {isCreating ? "País" : "No especificado"}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Dirección
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {company.address || (
                    <span className="text-gray-400 italic">
                      {isCreating ? "Dirección de la Empresa" : "No especificada"}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sitio Web y Redes Sociales */}
        <div className="border-b border-gray-200 pb-4 animate-in fade-in slide-in-from-left-2 duration-700 ease-out" style={{ animationDelay: '500ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sitio Web */}
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Sitio Web
                </label>
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-primary hover:underline mt-1 block"
                  >
                    {company.website}
                  </a>
                ) : (
                  <p className="text-base text-gray-400 italic mt-1">
                    {isCreating ? "Sitio Web" : "No especificado"}
                  </p>
                )}
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Redes Sociales
                </label>
                {isLoadingSocialMedia ? (
                  <div className="flex items-center gap-2 mt-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-6 rounded-full" />
                    ))}
                  </div>
                ) : socialMedia.length > 0 ? (
                  <TooltipProvider>
                    <div className="flex items-center gap-2 mt-1">
                      {socialMedia.map((sm) => {
                        const config = getSocialMediaConfig(sm.type)
                        return (
                          <Tooltip key={sm.id}>
                            <TooltipTrigger asChild>
                              <a
                                href={sm.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:text-primary transition-all duration-300 ease-in-out hover:scale-125 hover:rotate-3 hover:drop-shadow-lg inline-block"
                                aria-label={`Abrir ${config.label} en nueva pestaña`}
                              >
                                <SocialMediaIcon type={sm.type} size={24} />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{config.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </TooltipProvider>
                ) : (
                  <p className="text-base text-gray-400 italic mt-1">
                    {isCreating ? "Redes Sociales" : "No especificado"}
                  </p>
                )}
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

