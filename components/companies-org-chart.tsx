"use client"

import * as React from "react"
import Image from "next/image"
import type { Company } from "@/lib/types/user"
import { Building2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Pencil, Trash2, ZoomIn, ZoomOut } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"

interface CompaniesOrgChartProps {
  companies: Company[]
}

interface OrgNode {
  id: string
  name: string
  company: Company
  children?: OrgNode[]
}

/**
 * Componente de organigrama de empresas usando estructura jerárquica
 * Muestra la empresa matriz en la parte superior y las empresas hijas debajo
 */
export function CompaniesOrgChart({ companies }: CompaniesOrgChartProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const handleDelete = async (companyId: string) => {
    setDeletingId(companyId)
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al eliminar la empresa")
        return
      }

      router.refresh()
    } catch (error) {
      console.error("Error eliminando empresa:", error)
      alert("Error inesperado al eliminar la empresa")
    } finally {
      setDeletingId(null)
    }
  }

  // Construir estructura jerárquica
  const buildOrgStructure = (): OrgNode | null => {
    const parentCompany = companies.find((c) => c.is_parent)
    if (!parentCompany) return null

    const childCompanies = companies.filter((c) => !c.is_parent)

    return {
      id: parentCompany.id,
      name: parentCompany.name,
      company: parentCompany,
      children: childCompanies.map((child) => ({
        id: child.id,
        name: child.name,
        company: child,
      })),
    }
  }

  const orgStructure = buildOrgStructure()

  if (!orgStructure) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay empresas</h3>
        <p className="text-sm text-muted-foreground">
          No se encontró la empresa matriz
        </p>
      </div>
    )
  }

  // Componente para renderizar la tarjeta de empresa
  const CompanyCard = ({ 
    node, 
    isParent = false 
  }: { 
    node: OrgNode
    isParent?: boolean 
  }) => {
    if (isParent) {
      // Empresa madre en forma circular (más pequeña)
      return (
        <Card
          className="w-48 h-48 rounded-full transition-all shadow-2xl hover:shadow-2xl flex flex-col items-center justify-center border-primary border-2 bg-white relative"
          style={{ position: 'relative', zIndex: 10 }}
        >
          {/* Header con logo */}
          <CardHeader className="p-3 pb-1 flex-1 flex items-center justify-center">
            <div className="w-24 h-24 flex items-center justify-center bg-muted/30 rounded-full overflow-hidden">
              {node.company.logo_url ? (
                <Image
                  src={node.company.logo_url}
                  alt={`Logo de ${node.name}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain p-2"
                  unoptimized={node.company.logo_url.startsWith("http")}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Building2
                    className="h-12 w-12 text-primary"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          {/* Contenido centrado */}
          <CardContent className="p-2 pt-0 flex-1 flex flex-col items-center justify-center text-center space-y-1">
            <h3 className="font-semibold text-xs text-primary">
              {node.name}
            </h3>
            {node.company.legal_name && (
              <p className="text-[10px] text-muted-foreground">
                {node.company.legal_name}
              </p>
            )}
            <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Matriz
            </span>
          </CardContent>
        </Card>
      )
    }

    // Empresas hijas en forma rectangular
    return (
      <Card
        className="w-64 min-w-[256px] transition-all shadow-2xl hover:shadow-2xl border-border bg-card relative"
        style={{ position: 'relative' }}
      >
          {/* Header con logo */}
          <CardHeader className="p-4 pb-2">
            <div className="w-full h-24 flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
              {node.company.logo_url ? (
                <Image
                  src={node.company.logo_url}
                  alt={`Logo de ${node.name}`}
                  width={200}
                  height={96}
                  className="w-full h-full object-contain p-2"
                  unoptimized={node.company.logo_url.startsWith("http")}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Building2
                    className="h-12 w-12 text-muted-foreground"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          {/* Separador entre header y contenido */}
          <Separator />

          <CardContent className="p-4 pt-2">
            <div className="flex flex-col items-center text-center space-y-2">
              <h3 className="font-semibold text-sm text-foreground">
                {node.name}
              </h3>

              {node.company.legal_name && (
                <p className="text-xs text-muted-foreground">
                  {node.company.legal_name}
                </p>
              )}

              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                Hija
              </span>

              <div className="flex items-center gap-1 pt-2 border-t w-full justify-center">
                <Link href={`/dashboard/companies/${node.company.id}/edit`}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={deletingId === node.company.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. La empresa{" "}
                        <strong>{node.company.name}</strong> será eliminada
                        permanentemente. Solo puedes eliminar empresas que no
                        tengan usuarios asociados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(node.company.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
    )
  }

  // Componente principal del organigrama con diseño radial
  const RadialOrgChart = ({ node }: { node: OrgNode }) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const parentCardRef = React.useRef<HTMLDivElement>(null)
    const [connectorPaths, setConnectorPaths] = React.useState<string[]>([])
    const [zoom, setZoom] = React.useState(1)
    const [isDragging, setIsDragging] = React.useState(false)
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
    const dragStartRef = React.useRef({ x: 0, y: 0 })
    const dragOffsetRef = React.useRef({ x: 0, y: 0 })
    const hasChildren = node.children && node.children.length > 0
    const { state: sidebarState } = useSidebar()

    // Sincronizar refs con state
    React.useEffect(() => {
      dragStartRef.current = dragStart
      dragOffsetRef.current = dragOffset
    }, [dragStart, dragOffset])

    // Funciones de zoom
    const handleZoomIn = () => {
      setZoom((prev) => Math.min(prev + 0.25, 2)) // Máximo 200%
    }

    const handleZoomOut = () => {
      setZoom((prev) => Math.max(prev - 0.25, 0.5)) // Mínimo 50%
    }

    const handleZoomReset = () => {
      setZoom(1)
      setDragOffset({ x: 0, y: 0 })
    }

    // Funciones de arrastre para mouse
    const handleMouseDown = (e: React.MouseEvent) => {
      // Solo arrastrar si se hace clic en el área del organigrama, no en los botones
      if ((e.target as HTMLElement).closest('button')) return
      
      setIsDragging(true)
      setDragStart({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return
      
      setDragOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    // También manejar cuando el mouse sale del área
    const handleMouseLeave = () => {
      setIsDragging(false)
    }

    // Funciones de arrastre para touch (mobile)
    // Usamos event listeners nativos con { passive: false } para poder usar preventDefault
    React.useEffect(() => {
      if (!containerRef.current) return

      const container = containerRef.current

      const handleTouchStart = (e: TouchEvent) => {
        // Solo arrastrar si se toca el área del organigrama, no en los botones
        if ((e.target as HTMLElement).closest('button')) return
        
        const touch = e.touches[0]
        if (!touch) return
        
        setIsDragging(true)
        const newStart = {
          x: touch.clientX - dragOffsetRef.current.x,
          y: touch.clientY - dragOffsetRef.current.y
        }
        setDragStart(newStart)
        dragStartRef.current = newStart
        
        // Prevenir scroll por defecto mientras se arrastra
        e.preventDefault()
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return
        
        const touch = e.touches[0]
        if (!touch) return
        
        const newOffset = {
          x: touch.clientX - dragStartRef.current.x,
          y: touch.clientY - dragStartRef.current.y
        }
        setDragOffset(newOffset)
        dragOffsetRef.current = newOffset
        
        // Prevenir scroll por defecto mientras se arrastra
        e.preventDefault()
      }

      const handleTouchEnd = () => {
        setIsDragging(false)
      }

      // Registrar listeners con { passive: false } para poder usar preventDefault
      container.addEventListener('touchstart', handleTouchStart, { passive: false })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })
      container.addEventListener('touchend', handleTouchEnd, { passive: false })

      return () => {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }, [isDragging])

    // Función para recalcular las líneas de conexión
    const recalculatePaths = React.useCallback(() => {
      if (hasChildren && containerRef.current && parentCardRef.current && node.children) {
        const container = containerRef.current
        if (!container) return

        // Usar las dimensiones del contenedor directamente
        // El SVG está dentro del contenedor transformado, así que las coordenadas
        // deben estar en el espacio del contenedor antes del transform
        const containerWidth = container.offsetWidth || container.clientWidth
        const containerHeight = container.offsetHeight || container.clientHeight
        
        const paths: string[] = []

        // El punto de referencia es el centro del contenedor (50%, 50%)
        // Este es el mismo punto donde está posicionada la empresa matriz
        const centerX = containerWidth / 2
        const centerY = containerHeight / 2

        // Calcular posiciones de los hijos usando la misma lógica que getChildPosition
        node.children.forEach((child, index) => {
          const total = node.children!.length
          const radius = 400
          const startAngle = -Math.PI / 2
          const angle = startAngle + (index * 2 * Math.PI) / total
          
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          
          // Posición del centro del hijo en el espacio del contenedor
          // Estas coordenadas son relativas al contenedor, y el SVG las transformará
          // automáticamente junto con el contenido
          const childCenterX = centerX + x
          const childCenterY = centerY + y
          
          // Línea recta directa desde el centro de la hija hacia el centro del contenedor
          // Todas las líneas convergen en el mismo punto (centerX, centerY)
          // que coincide con el centro visual de la empresa matriz
          paths.push(
            `M ${childCenterX} ${childCenterY} L ${centerX} ${centerY}`
          )
        })

        setConnectorPaths(paths)
      }
    }, [hasChildren, node.children])

    // Recalcular cuando cambia el estado del sidebar o los hijos
    // No necesitamos recalcular cuando cambian zoom o dragOffset porque el SVG
    // se transforma automáticamente junto con el contenido
    React.useEffect(() => {
      // Esperar a que termine la transición del sidebar (300ms según la duración en sidebar.tsx)
      const timer = setTimeout(() => {
        recalculatePaths()
      }, 350) // 300ms de transición + 50ms de margen

      return () => clearTimeout(timer)
    }, [sidebarState, node.children, recalculatePaths])

    // Recalcular cuando cambia el tamaño de la ventana
    React.useEffect(() => {
      const handleResize = () => {
        recalculatePaths()
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [recalculatePaths])

    // Usar ResizeObserver para detectar cambios en el tamaño del contenedor
    React.useEffect(() => {
      if (!containerRef.current) return

      const resizeObserver = new ResizeObserver(() => {
        recalculatePaths()
      })

      resizeObserver.observe(containerRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    }, [recalculatePaths])

    // Calcular posiciones radiales para las empresas hijas
    const getChildPosition = (index: number, total: number) => {
      if (total === 0) return { top: 0, left: 0 }
      
      // Radio de distribución aumentado (distancia desde el centro)
      const radius = 400
      // Ángulo inicial (empezar desde arriba)
      const startAngle = -Math.PI / 2
      // Distribuir uniformemente alrededor del círculo
      const angle = startAngle + (index * 2 * Math.PI) / total
      
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)'
      }
    }

    return (
      <div 
        ref={containerRef}
        className="relative w-full min-h-[900px] flex items-center justify-center py-8 overflow-hidden touch-none"
        style={{ 
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        suppressHydrationWarning
      >
        {/* Contenedor con zoom y arrastre aplicado */}
        <div
          data-content-container
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-in-out'
          }}
        >
          {/* Fondo de grilla de puntos dentro del contenedor arrastrable */}
          <div 
            className="absolute"
            style={{ 
              zIndex: -1,
              top: '-5000px',
              left: '-5000px',
              width: '10000px',
              height: '10000px',
              backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0',
              opacity: 0.5
            }}
          />
          {/* Capa de fondo: SVG para las líneas de conexión */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          {connectorPaths.length > 0 && (
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ 
                height: "100%",
                width: "100%",
                overflow: "visible"
              }}
            >
              {connectorPaths.map((path, index) => (
                <path
                  key={`connector-${node.children![index].id}`}
                  d={path}
                  stroke="hsl(var(--secondary))"
                  strokeWidth="2.5"
                  strokeDasharray="12 12"
                  fill="none"
                  opacity="0.85"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;24"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
              ))}
            </svg>
          )}
        </div>

        {/* Capa superior: Empresa madre en el centro */}
        {/* El punto de referencia es el centro (50%, 50%) del contenedor */}
        {/* La tarjeta se posiciona con transform: translate(-50%, -50%) para centrarla */}
        {/* Esto asegura que el centro visual de la tarjeta coincida exactamente con el punto de convergencia de las líneas */}
        <div 
          ref={parentCardRef}
          className="relative"
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <CompanyCard node={node} isParent={true} />
        </div>

        {/* Capa superior: Empresas hijas distribuidas alrededor */}
        {hasChildren && node.children!.map((child, index) => (
          <div
            key={child.id}
            data-child-node
            className="absolute"
            style={{
              ...getChildPosition(index, node.children!.length),
              zIndex: 1
            }}
          >
            <CompanyCard node={child} isParent={false} />
          </div>
        ))}
        </div>

        {/* Control de zoom en la parte superior derecha */}
        <div className="absolute top-4 right-4 z-50 flex flex-row items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center min-w-[60px] px-2 py-1 text-sm font-medium">
            {Math.round(zoom * 100)}%
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomReset}
            className="h-7 text-xs"
          >
            Reset
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="flex justify-center min-w-max">
        <RadialOrgChart node={orgStructure} />
      </div>
    </div>
  )
}

