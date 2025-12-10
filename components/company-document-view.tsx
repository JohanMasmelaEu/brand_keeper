"use client"

import * as React from "react"
import type { Company } from "@/lib/types/user"
import { Building2, Globe, MapPin, FileText, CalendarPlus, CalendarCheck } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"

interface CompanyDocumentViewProps {
  company: Company
}

export function CompanyDocumentView({ company }: CompanyDocumentViewProps) {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6 sm:p-8 md:p-10 lg:p-12">
      {/* Tipo de empresa - Arriba del todo, centrado */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-300">
          <div className={`h-2 w-2 rounded-full ${company.is_parent ? 'bg-primary' : 'bg-gray-400'}`} />
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {company.is_parent ? "Empresa Matriz" : "Empresa Hija"}
          </p>
        </div>
      </div>

      {/* Encabezado del documento */}
      <div className="border-b-2 border-gray-400 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">REGISTRO DE EMPRESA</h2>
              <p className="text-xs text-gray-600">Brand Keeper - Sistema de Gestión</p>
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
            {company.logo_url && (
              <div className="w-16 h-16 relative">
                <Image
                  src={company.logo_url}
                  alt={`Logo de ${company.name}`}
                  fill
                  className="object-contain"
                  unoptimized={company.logo_url.startsWith("http")}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información de la empresa */}
      <div className="space-y-6">
        {/* Nombre de la empresa y Nombre Legal en el mismo row */}
        <div className="border-b border-gray-200 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-600 mt-0.5" />
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
              <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nombre Legal / Razón Social
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {company.legal_name || <span className="text-gray-400 italic">No especificado</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dirección y País en el mismo row */}
        <div className="border-b border-gray-200 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Dirección
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {company.address || <span className="text-gray-400 italic">No especificada</span>}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  País
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {company.country || <span className="text-gray-400 italic">No especificado</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sitio Web */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-start gap-3 mb-2">
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
                <p className="text-base text-gray-400 italic mt-1">No especificado</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página del documento */}
      <div className="mt-8 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-500 text-center">
          Documento generado el {format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
        </p>
      </div>
    </div>
  )
}

