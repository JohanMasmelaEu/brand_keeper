"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Palette, Type, ImageIcon, Pencil, Save, X, Sun, Moon, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import type { BrandSettings, LogoVariants } from "@/lib/types/brand"
import type { Company } from "@/lib/types/user"
import { getUserProfile } from "@/lib/supabase/user"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ColorPicker } from "@/components/color-picker"
import { FontSelector } from "@/components/font-selector"
import { LogoUploader } from "@/components/logo-uploader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Image from "next/image"
import { CheckSealAnimation } from "@/components/check-seal-animation"
import { Badge } from "@/components/ui/badge"

interface BrandSettingsViewProps {
  brandSettings: BrandSettings | null
  companyId: string
  userRole: "super_admin" | "admin" | "collaborator"
  companies?: Company[]
  userCompanyId?: string
  onCompanyChange?: (companyId: string) => void
}

export function BrandSettingsView({
  brandSettings,
  companyId,
  userRole,
  companies = [],
  userCompanyId,
  onCompanyChange,
}: BrandSettingsViewProps) {
  const router = useRouter()
  const canEdit = userRole === "super_admin" || userRole === "admin"
  const isSuperAdmin = userRole === "super_admin"
  
  // Estado para la empresa seleccionada (solo para super_admin)
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(companyId)
  
  // Estado para controlar qué card está en modo edición
  const [editingCard, setEditingCard] = React.useState<"logo" | "colors" | "typography" | null>(null)
  
  // Estado para controlar si estamos en modo creación (cuando no existe configuración)
  const [isCreating, setIsCreating] = React.useState(false)
  
  // Helper para obtener variantes de logo de forma segura
  const getLogoVariants = (): LogoVariants => {
    if (!brandSettings) return {}
    const variants = (brandSettings.logo_variants || {}) as LogoVariants
    return {
      principal: variants.principal || brandSettings.logo_url || null,
      imagotipo: variants.imagotipo || null,
      isotipo: variants.isotipo || null,
      negativo: variants.negativo || null,
      contraido: variants.contraido || null,
    }
  }
  
  // Estados locales para los valores de cada formulario
  const [logoUrl, setLogoUrl] = React.useState<string>(brandSettings?.logo_url || "")
  const [logoVariants, setLogoVariants] = React.useState<LogoVariants>(getLogoVariants())
  const [primaryColor, setPrimaryColor] = React.useState<string>(brandSettings?.primary_color || "#000000")
  const [secondaryColor, setSecondaryColor] = React.useState<string>(brandSettings?.secondary_color || "")
  const [tertiaryColor, setTertiaryColor] = React.useState<string>(brandSettings?.tertiary_color || "")
  const [negativeColor, setNegativeColor] = React.useState<string>(brandSettings?.negative_color || "")
  const [fontFamily, setFontFamily] = React.useState<string>(brandSettings?.font_family || "Arial")
  const [secondaryFont, setSecondaryFont] = React.useState<string>(brandSettings?.secondary_font || "")
  const [contrastFont, setContrastFont] = React.useState<string>(brandSettings?.contrast_font || "")
  
  // Estados para loading
  const [isSaving, setIsSaving] = React.useState(false)
  
  // Estados para mostrar animación de éxito en cada card
  const [showSuccessLogo, setShowSuccessLogo] = React.useState(false)
  const [showSuccessColors, setShowSuccessColors] = React.useState(false)
  const [showSuccessTypography, setShowSuccessTypography] = React.useState(false)
  
  // Estado para el modo del fondo del logo negativo (dark = luna, light = sol)
  const [negativeLogoMode, setNegativeLogoMode] = React.useState<"dark" | "light">("dark")
  
  // Estado para controlar qué color se copió recientemente
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null)
  
  // Función para calcular el contraste (blanco o negro) basado en el brillo del color
  const getContrastColor = (hexColor: string): string => {
    // Remover el # si existe
    const hex = hexColor.replace('#', '')
    
    // Convertir a RGB
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    // Calcular el brillo relativo usando la fórmula de luminancia
    // https://www.w3.org/WAI/GL/wiki/Relative_luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Si el brillo es mayor a 0.5, usar texto negro, sino usar blanco
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  // Función para determinar si el color necesita borde (similar al fondo del card)
  const needsBorder = (hexColor: string): boolean => {
    if (!hexColor || hexColor.length < 7) return false
    
    // Remover el # si existe
    const hex = hexColor.replace('#', '')
    
    // Convertir a RGB
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    // Calcular el brillo relativo usando la fórmula de luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Si la luminancia es mayor a 0.85, el color es muy claro y similar al fondo blanco
    // Por lo tanto necesita un borde para ser visible
    return luminance > 0.85
  }
  
  // Función para copiar color al portapapeles
  const handleCopyColor = async (color: string, colorName: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)
      toast.success(`Color ${colorName} copiado: ${color}`)
      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        setCopiedColor(null)
      }, 2000)
    } catch (error) {
      console.error("Error al copiar color:", error)
      toast.error("Error al copiar el color")
    }
  }
  
  // Sincronizar estados cuando brandSettings cambia
  React.useEffect(() => {
    if (brandSettings) {
      setLogoUrl(brandSettings.logo_url || "")
      setLogoVariants(getLogoVariants())
      setPrimaryColor(brandSettings.primary_color || "#000000")
      setSecondaryColor(brandSettings.secondary_color || "")
      setTertiaryColor(brandSettings.tertiary_color || "")
      setNegativeColor(brandSettings.negative_color || "")
      setFontFamily(brandSettings.font_family || "Arial")
      setSecondaryFont(brandSettings.secondary_font || "")
      setContrastFont(brandSettings.contrast_font || "")
    }
  }, [brandSettings])
  
  // Debug: Verificar que las empresas se reciban correctamente
  React.useEffect(() => {
    if (isSuperAdmin) {
      console.log('BrandSettingsView - isSuperAdmin:', isSuperAdmin)
      console.log('BrandSettingsView - companies:', companies)
      console.log('BrandSettingsView - companies.length:', companies.length)
    }
  }, [isSuperAdmin, companies])
  
  // Obtener la empresa seleccionada para mostrar su logo
  const selectedCompany = React.useMemo(() => {
    return companies.find((c) => c.id === selectedCompanyId) || null
  }, [companies, selectedCompanyId])
  
  // Manejar cambio de empresa
  const handleCompanyChange = (newCompanyId: string) => {
    setSelectedCompanyId(newCompanyId)
    // Recargar la página con el nuevo companyId
    router.push(`/dashboard/brand-settings?company_id=${newCompanyId}`)
    router.refresh()
  }
  
  // Efecto para sincronizar companyId cuando cambia desde fuera
  React.useEffect(() => {
    setSelectedCompanyId(companyId)
  }, [companyId])
  
  // Función para actualizar una variante de logo
  const updateLogoVariant = (variant: keyof LogoVariants, url: string) => {
    setLogoVariants(prev => ({
      ...prev,
      [variant]: url || null,
    }))
  }
  
  // Función para guardar cambios de logo
  const handleSaveLogo = async () => {
    setIsSaving(true)
    try {
      // Sincronizar logo principal con logo_url y logo_variants.principal
      const updatedVariants = {
        ...logoVariants,
        principal: logoUrl || logoVariants.principal || null,
      }
      
      if (brandSettings) {
        // Actualizar configuración existente
        const response = await fetch(`/api/brand-settings/${brandSettings.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            logo_url: logoUrl || null,
            logo_variants: updatedVariants,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al actualizar el logo")
        }
        
        toast.success("Logos actualizados correctamente")
      } else {
        // Crear nueva configuración (solo con logo)
        const response = await fetch("/api/brand-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_id: selectedCompanyId,
            primary_color: primaryColor || "#000000",
            secondary_color: secondaryColor || null,
            font_family: fontFamily || "Arial",
            logo_url: logoUrl || null,
            logo_variants: updatedVariants,
            is_global: false,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al crear la configuración")
        }
        
        toast.success("Configuración de marca creada correctamente")
        setIsCreating(false)
      }
      
      setShowSuccessLogo(true)
      // Auto-ocultar después de 2 segundos
      setTimeout(() => {
        setShowSuccessLogo(false)
      }, 2000)
      
      if (isCreating) {
        // Si estamos creando, avanzar al siguiente paso si está habilitado
        if (isCardEnabled("colors")) {
          setEditingCard("colors")
        } else {
          setEditingCard(null)
        }
      } else {
        setEditingCard(null)
      }
      router.refresh()
    } catch (error) {
      console.error("Error saving logo:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar los logos")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Función para guardar cambios de colores
  const handleSaveColors = async () => {
    setIsSaving(true)
    try {
      if (brandSettings) {
        // Actualizar configuración existente
        const response = await fetch(`/api/brand-settings/${brandSettings.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            primary_color: primaryColor,
            secondary_color: secondaryColor || null,
            tertiary_color: tertiaryColor || null,
            negative_color: negativeColor || null,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al actualizar los colores")
        }
        
        toast.success("Colores actualizados correctamente")
      } else {
        // Crear nueva configuración (solo con colores)
        const response = await fetch("/api/brand-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_id: selectedCompanyId,
            primary_color: primaryColor,
            secondary_color: secondaryColor || null,
            tertiary_color: tertiaryColor || null,
            negative_color: negativeColor || null,
            font_family: fontFamily || "Arial",
            logo_url: logoUrl || null,
            is_global: false,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al crear la configuración")
        }
        
        toast.success("Configuración de marca creada correctamente")
        setIsCreating(false)
      }
      
      setShowSuccessColors(true)
      // Auto-ocultar después de 2 segundos
      setTimeout(() => {
        setShowSuccessColors(false)
      }, 2000)
      
      if (isCreating) {
        // Si estamos creando, avanzar al siguiente paso si está habilitado
        if (isCardEnabled("typography")) {
          setEditingCard("typography")
        } else {
          setEditingCard(null)
        }
      } else {
        setEditingCard(null)
      }
      router.refresh()
    } catch (error) {
      console.error("Error saving colors:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar los colores")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Función para guardar cambios de tipografía
  const handleSaveTypography = async () => {
    setIsSaving(true)
    try {
      if (brandSettings) {
        // Actualizar configuración existente
        const response = await fetch(`/api/brand-settings/${brandSettings.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            font_family: fontFamily,
            secondary_font: secondaryFont || null,
            contrast_font: contrastFont || null,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al actualizar la tipografía")
        }
        
        toast.success("Tipografía actualizada correctamente")
      } else {
        // Crear nueva configuración (solo con tipografía)
        const response = await fetch("/api/brand-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_id: selectedCompanyId,
            primary_color: primaryColor || "#000000",
            secondary_color: secondaryColor || null,
            font_family: fontFamily,
            secondary_font: secondaryFont || null,
            contrast_font: contrastFont || null,
            logo_url: logoUrl || null,
            is_global: false,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al crear la configuración")
        }
        
        toast.success("Configuración de marca creada correctamente")
        setIsCreating(false)
      }
      
      setShowSuccessTypography(true)
      // Auto-ocultar después de 2 segundos
      setTimeout(() => {
        setShowSuccessTypography(false)
      }, 2000)
      
      if (isCreating) {
        // Si estamos creando y completamos tipografía, finalizar creación
        setIsCreating(false)
        setEditingCard(null)
      } else {
        setEditingCard(null)
      }
      router.refresh()
    } catch (error) {
      console.error("Error saving typography:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar la tipografía")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Función para cancelar edición
  const handleCancelEdit = () => {
    if (brandSettings) {
      // Restaurar valores originales
      setLogoUrl(brandSettings.logo_url || "")
      setLogoVariants(getLogoVariants())
      setPrimaryColor(brandSettings.primary_color || "#000000")
      setSecondaryColor(brandSettings.secondary_color || "")
      setTertiaryColor(brandSettings.tertiary_color || "")
      setNegativeColor(brandSettings.negative_color || "")
      setFontFamily(brandSettings.font_family || "Arial")
      setSecondaryFont(brandSettings.secondary_font || "")
      setContrastFont(brandSettings.contrast_font || "")
    } else {
      // Restaurar valores por defecto
      setLogoUrl("")
      setLogoVariants({})
      setPrimaryColor("#000000")
      setSecondaryColor("")
      setTertiaryColor("")
      setNegativeColor("")
      setFontFamily("Arial")
      setSecondaryFont("")
      setContrastFont("")
      setIsCreating(false)
    }
    setEditingCard(null)
  }
  
  // Función para iniciar creación
  const handleStartCreating = () => {
    setIsCreating(true)
    // Abrir el primer card en modo edición (logo, ya que es el primer paso)
    setEditingCard("logo")
  }
  
  // Determinar si un card está habilitado según el orden del stepper
  const isCardEnabled = (cardType: "logo" | "colors" | "typography"): boolean => {
    if (!isCreating) return true // Si no estamos creando, todos están habilitados
    
    switch (cardType) {
      case "logo":
        // Logo siempre está habilitado (primer paso)
        return true
      case "colors":
        // Colores habilitado si logo está completado
        return !!(logoUrl || Object.values(logoVariants).some(v => v))
      case "typography":
        // Tipografía habilitada si logo y colores están completados
        const logoCompleted = !!(logoUrl || Object.values(logoVariants).some(v => v))
        const colorsCompleted = !!(primaryColor && primaryColor !== "#000000")
        return logoCompleted && colorsCompleted
      default:
        return false
    }
  }
  
  // Función para avanzar al siguiente paso automáticamente
  const advanceToNextStep = () => {
    if (!isCreating) return
    
    if (editingCard === "logo" && isCardEnabled("colors")) {
      setEditingCard("colors")
    } else if (editingCard === "colors" && isCardEnabled("typography")) {
      setEditingCard("typography")
    }
  }
  
  // Determinar el paso actual basado en qué card está siendo editado o completado
  const getCurrentStep = (): number => {
    if (!isCreating) return 0
    
    // Si hay un card específico en edición, mostrar ese paso
    if (editingCard) {
      switch (editingCard) {
        case "logo":
          return 1
        case "colors":
          return 2
        case "typography":
          return 3
      }
    }
    
    // Si no hay card en edición, determinar por completitud
    // Si hay logo, avanzar al paso 2
    if (logoUrl || Object.values(logoVariants).some(v => v)) {
      // Si hay colores, avanzar al paso 3
      if (primaryColor && primaryColor !== "#000000") {
        return 3
      }
      return 2
    }
    
    return 1
  }
  
  // Verificar si un paso está completado
  const isStepCompleted = (step: number): boolean => {
    if (!isCreating) return false
    
    switch (step) {
      case 1: // Logo
        return !!(logoUrl || Object.values(logoVariants).some(v => v))
      case 2: // Colores
        return !!(primaryColor && primaryColor !== "#000000")
      case 3: // Tipografía
        return !!(fontFamily && fontFamily !== "Arial")
      default:
        return false
    }
  }
  
  // Componente de Stepper
  const CreationStepper = () => {
    if (!isCreating) return null
    
    const currentStep = getCurrentStep()
    const steps = [
      { number: 1, label: "Logo", key: "logo" },
      { number: 2, label: "Colores", key: "colors" },
      { number: 3, label: "Fuentes", key: "typography" },
    ]
    
    return (
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-4">
          {steps.map((step, index) => {
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            const isClickable = isCreating
            const stepCompleted = isStepCompleted(step.number)
            const cardEnabled = isCardEnabled(step.key as "logo" | "colors" | "typography")
            
            return (
              <React.Fragment key={step.key}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isClickable && cardEnabled) {
                        setEditingCard(step.key as "logo" | "colors" | "typography")
                      }
                    }}
                    disabled={!isClickable || !cardEnabled}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${isActive 
                        ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110" 
                        : stepCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-background text-muted-foreground"
                      }
                      ${isClickable && cardEnabled ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-50"}
                    `}
                  >
                    {stepCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </button>
                  <span className={`
                    text-sm font-medium
                    ${isActive ? "text-foreground font-semibold" : stepCompleted ? "text-foreground" : "text-muted-foreground"}
                  `}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-0.5 transition-all
                    ${stepCompleted ? "bg-primary" : "bg-muted"}
                  `} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }

  // Si no hay configuración y no estamos creando, mostrar el card de inicio
  if (!brandSettings && !isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Configuración de Marca</h1>
            <p className="text-muted-foreground mt-2">
              Configura los elementos visuales de tu marca
            </p>
          </div>
          
          {/* Select de empresa - Solo para super_admin, alineado a la derecha */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <label htmlFor="company-select-empty" className="text-sm font-medium text-foreground whitespace-nowrap">
                Empresa:
              </label>
              {companies.length > 0 ? (
                <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                  <SelectTrigger id="company-select-empty" className="w-[200px]">
                    <SelectValue placeholder="Seleccionar empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground px-4 py-2 border rounded-md">
                  No hay empresas disponibles
                </div>
              )}
            </div>
          )}
        </div>

      {/* Logo de la empresa seleccionada - Centrado, debajo del select */}
      {isSuperAdmin && selectedCompany && (
        <div className="flex justify-center">
          <div className="h-20 min-h-20 flex items-center justify-center">
            {selectedCompany.logo_url ? (
              <Image
                src={selectedCompany.logo_url}
                alt={selectedCompany.name}
                width={0}
                height={80}
                className="h-full w-auto max-w-xs object-contain"
                unoptimized={selectedCompany.logo_url.startsWith("http") || selectedCompany.logo_url.startsWith("data:")}
                onError={(e) => {
                  console.error("Error loading company logo:", selectedCompany.logo_url)
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground px-4">
                <span className="text-lg font-semibold">{selectedCompany.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

        <div className="flex justify-center">
          <Card className="w-auto shadow-lg px-8">
            <CardHeader className="py-8">
              <CardTitle className="text-center">No hay configuración de marca</CardTitle>
              <CardDescription className="text-center">
                Crea una configuración de marca para definir los colores, tipografía y logo de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              {canEdit && (
                <Button onClick={handleStartCreating}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Configuración de Marca
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Marca</h1>
          <p className="text-muted-foreground mt-2">
            {isCreating 
              ? "Crea una nueva configuración de marca" 
              : brandSettings?.is_global 
                ? "Configuración Global" 
                : "Configuración de la Empresa"}
          </p>
        </div>
        
        {/* Select de empresa - Solo para super_admin, alineado a la derecha */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <label htmlFor="company-select" className="text-sm font-medium text-foreground whitespace-nowrap">
              Empresa:
            </label>
            {companies.length > 0 ? (
              <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                <SelectTrigger id="company-select" className="w-[200px]">
                  <SelectValue placeholder="Seleccionar empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground px-4 py-2 border rounded-md">
                No hay empresas disponibles
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logo de la empresa seleccionada - Centrado, debajo del select */}
      {isSuperAdmin && selectedCompany && (
        <div className="flex justify-center">
          <div className="h-20 min-h-20 flex items-center justify-center">
            {selectedCompany.logo_url ? (
              <Image
                src={selectedCompany.logo_url}
                alt={selectedCompany.name}
                width={0}
                height={80}
                className="h-full w-auto max-w-xs object-contain"
                unoptimized={selectedCompany.logo_url.startsWith("http") || selectedCompany.logo_url.startsWith("data:")}
                onError={(e) => {
                  console.error("Error loading company logo:", selectedCompany.logo_url)
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground px-4">
                <span className="text-lg font-semibold">{selectedCompany.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stepper para modo creación */}
      {isCreating && <CreationStepper />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logo - Primera columna */}
        <Card className={`flex flex-col h-full shadow-lg relative transition-all ${isCreating && !isCardEnabled("logo") ? "opacity-40 pointer-events-none bg-muted/30" : ""}`}>
          {/* Animación de check con sello para Logo */}
          {showSuccessLogo && (
            <CheckSealAnimation 
              variant="success" 
              show={showSuccessLogo}
              autoHideDuration={2000}
              onHide={() => setShowSuccessLogo(false)}
            />
          )}
          {canEdit && editingCard !== "logo" && !isCreating && (
            <div className="absolute top-4 right-4 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCard("logo")}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 icon-hover-scale" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar logo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {isCreating && editingCard !== "logo" && isCardEnabled("logo") && (
            <div className="absolute top-4 right-4 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCard("logo")}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 icon-hover-scale" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Agregar logo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {editingCard === "logo" ? (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <Tabs defaultValue="principal" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger 
                        value="principal" 
                        className="text-xs"
                        data-active-color={primaryColor}
                      >
                        Principal
                      </TabsTrigger>
                      <TabsTrigger 
                        value="imagotipo" 
                        className="text-xs"
                        data-active-color={primaryColor}
                      >
                        Imagotipo
                      </TabsTrigger>
                      <TabsTrigger 
                        value="isotipo" 
                        className="text-xs"
                        data-active-color={primaryColor}
                      >
                        Isotipo
                      </TabsTrigger>
                      <TabsTrigger 
                        value="negativo" 
                        className="text-xs"
                        data-active-color={primaryColor}
                      >
                        Negativo
                      </TabsTrigger>
                      <TabsTrigger 
                        value="contraido" 
                        className="text-xs"
                        data-active-color={primaryColor}
                      >
                        Contraído
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="principal" className="space-y-3 mt-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Logo Principal</p>
                        <LogoUploader
                          value={logoUrl}
                          onChange={setLogoUrl}
                          companyId={companyId}
                          brandSettingsId={brandSettings?.id}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="imagotipo" className="space-y-3 mt-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Imagotipo</p>
                        <LogoUploader
                          value={logoVariants.imagotipo || ""}
                          onChange={(url) => updateLogoVariant("imagotipo", url)}
                          companyId={companyId}
                          brandSettingsId={brandSettings?.id}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="isotipo" className="space-y-3 mt-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Isotipo</p>
                        <LogoUploader
                          value={logoVariants.isotipo || ""}
                          onChange={(url) => updateLogoVariant("isotipo", url)}
                          companyId={companyId}
                          brandSettingsId={brandSettings?.id}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="negativo" className="space-y-3 mt-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Logo en Negativo</p>
                        <LogoUploader
                          value={logoVariants.negativo || ""}
                          onChange={(url) => updateLogoVariant("negativo", url)}
                          companyId={companyId}
                          brandSettingsId={brandSettings?.id}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="contraido" className="space-y-3 mt-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Logo Contraído</p>
                        <LogoUploader
                          value={logoVariants.contraido || ""}
                          onChange={(url) => updateLogoVariant("contraido", url)}
                          companyId={companyId}
                          brandSettingsId={brandSettings?.id}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="flex gap-2 justify-center pt-6 border-t mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveLogo}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs 
                defaultValue={
                  (logoUrl || logoVariants.principal) ? "principal" :
                  logoVariants.imagotipo ? "imagotipo" :
                  logoVariants.isotipo ? "isotipo" :
                  logoVariants.negativo ? "negativo" :
                  logoVariants.contraido ? "contraido" : "principal"
                } 
                className="w-full flex flex-col h-full"
              >
                <TabsList className="grid w-full grid-cols-5 shrink-0 mb-4">
                  <TabsTrigger 
                    value="principal" 
                    className="text-xs"
                    data-active-color={primaryColor}
                    disabled={!logoUrl && !logoVariants.principal}
                  >
                    Principal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="imagotipo" 
                    className="text-xs"
                    data-active-color={primaryColor}
                    disabled={!logoVariants.imagotipo}
                  >
                    Imagotipo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="isotipo" 
                    className="text-xs"
                    data-active-color={primaryColor}
                    disabled={!logoVariants.isotipo}
                  >
                    Isotipo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="negativo" 
                    className="text-xs"
                    data-active-color={primaryColor}
                    disabled={!logoVariants.negativo}
                  >
                    Negativo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="contraido" 
                    className="text-xs"
                    data-active-color={primaryColor}
                    disabled={!logoVariants.contraido}
                  >
                    Contraído
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-y-auto min-h-0 flex items-center justify-center">
                  <TabsContent value="principal" className="mt-0 w-full">
                  {(logoUrl || logoVariants.principal) ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm font-medium text-muted-foreground">Logo Principal</p>
                      <Image
                        src={logoUrl || logoVariants.principal || ""}
                        alt="Logo Principal"
                        width={200}
                        height={100}
                        className="w-full h-auto max-h-48 object-contain rounded-md p-4"
                        unoptimized={(logoUrl || logoVariants.principal || "").startsWith("http") || (logoUrl || logoVariants.principal || "").startsWith("data:")}
                        onError={(e) => {
                          console.error("Error loading logo principal:", logoUrl || logoVariants.principal)
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No hay logo principal configurado</p>
                  )}
                </TabsContent>
                
                  <TabsContent value="imagotipo" className="mt-0 w-full">
                    {logoVariants.imagotipo ? (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Imagotipo</p>
                        <Image
                          src={logoVariants.imagotipo}
                          alt="Imagotipo"
                          width={200}
                          height={100}
                          className="w-full h-auto max-h-48 object-contain rounded-md p-4"
                          unoptimized={logoVariants.imagotipo.startsWith("http") || logoVariants.imagotipo.startsWith("data:")}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No hay imagotipo configurado</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="isotipo" className="mt-0 w-full">
                    {logoVariants.isotipo ? (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Isotipo</p>
                        <Image
                          src={logoVariants.isotipo}
                          alt="Isotipo"
                          width={100}
                          height={100}
                          className="w-32 h-32 object-contain rounded-md p-4"
                          unoptimized={logoVariants.isotipo.startsWith("http") || logoVariants.isotipo.startsWith("data:")}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No hay isotipo configurado</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="negativo" className="mt-0 w-full">
                    {logoVariants.negativo ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-between w-full mb-2">
                          <p className="text-sm font-medium text-muted-foreground">Logo en Negativo</p>
                          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setNegativeLogoMode("light")}
                                    className={`h-7 px-2 ${negativeLogoMode === "light" ? "bg-background shadow-sm" : ""}`}
                                  >
                                    <Sun className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Fondo claro</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setNegativeLogoMode("dark")}
                                    className={`h-7 px-2 ${negativeLogoMode === "dark" ? "bg-background shadow-sm" : ""}`}
                                  >
                                    <Moon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Fondo oscuro</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <div 
                          className={`rounded-md p-4 w-full transition-colors ${
                            negativeLogoMode === "dark" ? "bg-gray-800" : "bg-gray-100"
                          }`}
                        >
                          <Image
                            src={logoVariants.negativo}
                            alt="Logo en Negativo"
                            width={200}
                            height={100}
                            className="w-full h-auto max-h-48 object-contain"
                            unoptimized={logoVariants.negativo.startsWith("http") || logoVariants.negativo.startsWith("data:")}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No hay logo en negativo configurado</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="contraido" className="mt-0 w-full">
                    {logoVariants.contraido ? (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Logo Contraído</p>
                        <Image
                          src={logoVariants.contraido}
                          alt="Logo Contraído"
                          width={150}
                          height={60}
                          className="w-full h-auto max-h-32 object-contain rounded-md p-4"
                          unoptimized={logoVariants.contraido.startsWith("http") || logoVariants.contraido.startsWith("data:")}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No hay logo contraído configurado</p>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Colores - Segunda columna */}
        <Card className={`flex flex-col h-full shadow-lg relative transition-all ${isCreating && !isCardEnabled("colors") ? "opacity-40 pointer-events-none bg-muted/30" : ""}`}>
          {/* Animación de check con sello para Colores */}
          {showSuccessColors && (
            <CheckSealAnimation 
              variant="success" 
              show={showSuccessColors}
              autoHideDuration={2000}
              onHide={() => setShowSuccessColors(false)}
            />
          )}
          {canEdit && editingCard !== "colors" && !isCreating && (
            <div className="absolute top-4 right-4 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCard("colors")}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 icon-hover-scale" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar colores</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {isCreating && editingCard !== "colors" && isCardEnabled("colors") && (
            <div className="absolute top-4 right-4 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCard("colors")}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 icon-hover-scale" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configurar colores</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Colores
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {editingCard === "colors" ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4">
                  <ColorPicker
                    value={primaryColor}
                    onChange={setPrimaryColor}
                    label="Color Primario"
                    required
                  />
                  <ColorPicker
                    value={secondaryColor}
                    onChange={setSecondaryColor}
                    label="Color Secundario"
                    required={false}
                    showToggle={true}
                    onToggle={(enabled) => {
                      if (!enabled) {
                        setSecondaryColor("")
                        // Si se desactiva el secundario, desactivar también el terciario
                        if (tertiaryColor) {
                          setTertiaryColor("")
                        }
                      } else if (!secondaryColor) {
                        setSecondaryColor("#000000")
                      }
                    }}
                  />
                  <ColorPicker
                    value={tertiaryColor}
                    onChange={setTertiaryColor}
                    label="Color Terciario"
                    required={false}
                    showToggle={true}
                    toggleDisabled={!secondaryColor || secondaryColor.length < 7}
                    onToggle={(enabled) => {
                      // Solo permitir activar si el secundario está activo
                      if (enabled && (!secondaryColor || secondaryColor.length < 7)) {
                        return
                      }
                      if (!enabled) {
                        setTertiaryColor("")
                      } else if (!tertiaryColor) {
                        setTertiaryColor("#000000")
                      }
                    }}
                  />
                  <ColorPicker
                    value={negativeColor}
                    onChange={setNegativeColor}
                    label="Color Negativo"
                    required={false}
                    showToggle={true}
                    onToggle={(enabled) => {
                      if (!enabled) {
                        setNegativeColor("")
                      } else if (!negativeColor) {
                        setNegativeColor("#000000")
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-center pt-6 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveColors}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {/* Color Primario - Obligatorio */}
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground font-medium w-24 shrink-0">Color Primario</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleCopyColor(primaryColor, "Primario")}
                          className={`flex-1 h-16 rounded-xl shadow-sm relative overflow-hidden group ${needsBorder(primaryColor) ? 'border-2 border-gray-300' : ''}`}
                          style={{ backgroundColor: primaryColor }}
                        >
                          <span
                            className="font-mono text-base font-bold tracking-wider absolute inset-0 flex items-center justify-center transition-opacity"
                            style={{ color: getContrastColor(primaryColor) }}
                          >
                            {copiedColor === primaryColor ? (
                              <span className="flex items-center gap-1.5">
                                <Check className="h-4 w-4" />
                                {primaryColor}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {primaryColor}
                              </span>
                            )}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copiar color</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Color Secundario - Opcional */}
                {secondaryColor && (
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground font-medium w-24 shrink-0">Color Secundario</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleCopyColor(secondaryColor, "Secundario")}
                            className={`flex-1 h-16 rounded-xl shadow-sm relative overflow-hidden group ${needsBorder(secondaryColor) ? 'border-2 border-gray-300' : ''}`}
                            style={{ backgroundColor: secondaryColor }}
                          >
                            <span
                              className="font-mono text-sm font-semibold absolute inset-0 flex items-center justify-center transition-opacity"
                              style={{ color: getContrastColor(secondaryColor) }}
                            >
                              {copiedColor === secondaryColor ? (
                                <span className="flex items-center gap-1.5">
                                  <Check className="h-4 w-4" />
                                  {secondaryColor}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  {secondaryColor}
                                </span>
                              )}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar color</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                {/* Color Terciario - Opcional */}
                {tertiaryColor && (
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground font-medium w-24 shrink-0">Color Terciario</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleCopyColor(tertiaryColor, "Terciario")}
                            className={`flex-1 h-16 rounded-xl shadow-sm relative overflow-hidden group ${needsBorder(tertiaryColor) ? 'border-2 border-gray-300' : ''}`}
                            style={{ backgroundColor: tertiaryColor }}
                          >
                            <span
                              className="font-mono text-sm font-semibold absolute inset-0 flex items-center justify-center transition-opacity"
                              style={{ color: getContrastColor(tertiaryColor) }}
                            >
                              {copiedColor === tertiaryColor ? (
                                <span className="flex items-center gap-1.5">
                                  <Check className="h-4 w-4" />
                                  {tertiaryColor}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  {tertiaryColor}
                                </span>
                              )}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar color</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                {/* Color Negativo - Opcional */}
                {negativeColor && (
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground font-medium w-24 shrink-0">Color Negativo</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleCopyColor(negativeColor, "Negativo")}
                            className={`flex-1 h-16 rounded-xl shadow-sm relative overflow-hidden group ${needsBorder(negativeColor) ? 'border-2 border-gray-300' : ''}`}
                            style={{ backgroundColor: negativeColor }}
                          >
                            <span
                              className="font-mono text-sm font-semibold absolute inset-0 flex items-center justify-center transition-opacity"
                              style={{ color: getContrastColor(negativeColor) }}
                            >
                              {copiedColor === negativeColor ? (
                                <span className="flex items-center gap-1.5">
                                  <Check className="h-4 w-4" />
                                  {negativeColor}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  {negativeColor}
                                </span>
                              )}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar color</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipografía - Tercera columna */}
        <Card className={`flex flex-col h-full shadow-lg relative transition-all ${isCreating && !isCardEnabled("typography") ? "opacity-40 pointer-events-none bg-muted/30" : ""}`}>
          {/* Animación de check con sello para Tipografía */}
          {showSuccessTypography && (
            <CheckSealAnimation 
              variant="success" 
              show={showSuccessTypography}
              autoHideDuration={2000}
              onHide={() => setShowSuccessTypography(false)}
            />
          )}
          {canEdit && editingCard !== "typography" && !isCreating && (
            <div className="absolute top-4 right-4 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCard("typography")}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 icon-hover-scale" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar tipografía</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {isCreating && editingCard !== "typography" && isCardEnabled("typography") && (
            <div className="absolute top-4 right-4 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCard("typography")}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 icon-hover-scale" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configurar tipografía</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Tipografía
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {editingCard === "typography" ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4">
                  <FontSelector
                    value={fontFamily}
                    onChange={setFontFamily}
                    includeSystemFonts={true}
                    required
                    label="Fuente Principal"
                  />
                  <FontSelector
                    value={secondaryFont}
                    onChange={setSecondaryFont}
                    includeSystemFonts={true}
                    required={false}
                    label="Fuente Secundaria"
                    showToggle={true}
                    onToggle={(enabled) => {
                      if (!enabled) {
                        setSecondaryFont("")
                        // Si se desactiva la secundaria, desactivar también la de contraste
                        if (contrastFont) {
                          setContrastFont("")
                        }
                      }
                      // Si se activa, no establecer valor por defecto aquí
                      // El componente FontSelector manejará esto según el tipo de fuente
                    }}
                  />
                  <FontSelector
                    value={contrastFont}
                    onChange={setContrastFont}
                    includeSystemFonts={true}
                    required={false}
                    label="Fuente de Contraste"
                    showToggle={true}
                    toggleDisabled={!secondaryFont || secondaryFont.trim() === ""}
                    onToggle={(enabled) => {
                      // Solo permitir activar si la secundaria está activa
                      if (enabled && (!secondaryFont || secondaryFont.trim() === "")) {
                        return
                      }
                      if (!enabled) {
                        setContrastFont("")
                      }
                      // Si se activa, no establecer valor por defecto aquí
                      // El componente FontSelector manejará esto según el tipo de fuente
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-center pt-6 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveTypography}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                {/* Fuente Principal - Obligatoria */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Fuente Principal</p>
                  <p
                    className="text-lg font-semibold"
                    style={{ fontFamily: `"${fontFamily}", sans-serif` }}
                  >
                    {fontFamily}
                  </p>
                  <p
                    className="text-xs text-muted-foreground"
                    style={{ fontFamily: `"${fontFamily}", sans-serif` }}
                  >
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </p>
                  <p
                    className="text-xs"
                    style={{ fontFamily: `"${fontFamily}", sans-serif` }}
                  >
                    abcdefghijklmnopqrstuvwxyz
                  </p>
                </div>

                {/* Fuente Secundaria - Opcional */}
                {secondaryFont && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">Fuente Secundaria</p>
                    <p
                      className="text-lg font-semibold"
                      style={{ fontFamily: `"${secondaryFont}", sans-serif` }}
                    >
                      {secondaryFont}
                    </p>
                    <p
                      className="text-xs text-muted-foreground"
                      style={{ fontFamily: `"${secondaryFont}", sans-serif` }}
                    >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </p>
              <p
                      className="text-xs"
                      style={{ fontFamily: `"${secondaryFont}", sans-serif` }}
              >
                abcdefghijklmnopqrstuvwxyz
              </p>
            </div>
                )}

                {/* Fuente de Contraste - Opcional */}
                {contrastFont && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">Fuente de Contraste</p>
                    <p
                      className="text-lg font-semibold"
                      style={{ fontFamily: `"${contrastFont}", sans-serif` }}
                    >
                      {contrastFont}
                    </p>
                    <p
                      className="text-xs text-muted-foreground"
                      style={{ fontFamily: `"${contrastFont}", sans-serif` }}
                    >
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    </p>
                    <p
                      className="text-xs"
                      style={{ fontFamily: `"${contrastFont}", sans-serif` }}
                    >
                      abcdefghijklmnopqrstuvwxyz
                    </p>
                </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

