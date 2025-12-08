"use client"

import * as React from "react"
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface ImageCropperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export function ImageCropper({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
}: ImageCropperProps) {
  const imgRef = React.useRef<HTMLImageElement>(null)
  const [crop, setCrop] = React.useState<Crop>()
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [aspect] = React.useState<number | undefined>(1) // 1:1 para cuadrado
  const [zoom, setZoom] = React.useState(1) // Nivel de zoom (1 = 100%)

  // Inyectar estilos para mobile
  React.useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      .ReactCrop {
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
      .ReactCrop__crop-selection {
        touch-action: none;
      }
      .ReactCrop__drag-handle {
        touch-action: none;
        width: 20px !important;
        height: 20px !important;
      }
      @media (max-width: 640px) {
        .ReactCrop {
          max-width: 100vw;
          max-height: 50vh;
        }
        .ReactCrop__drag-handle {
          width: 24px !important;
          height: 24px !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Cuando la imagen se carga, centrar el crop
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
    // Resetear zoom cuando se carga una nueva imagen
    setZoom(1)
  }

  // Funciones de zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3)) // Máximo 300%
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5)) // Mínimo 50%
  }

  const handleZoomReset = () => {
    setZoom(1)
  }

  // Convertir el crop a imagen Blob
  async function getCroppedImg(
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No 2d context")
    }

    // Obtener el tamaño real renderizado de la imagen (considerando CSS y zoom)
    // El crop se calcula en base al tamaño del elemento sin transform,
    // pero getBoundingClientRect() devuelve el tamaño después del transform
    // Por lo tanto, usamos image.width y image.height que no se ven afectados por transform
    const displayWidth = image.width
    const displayHeight = image.height

    // Calcular la escala entre la imagen renderizada y la imagen natural
    const scaleX = image.naturalWidth / displayWidth
    const scaleY = image.naturalHeight / displayHeight
    const pixelRatio = window.devicePixelRatio || 1

    // Tamaño del canvas en píxeles de la imagen natural
    const outputWidth = crop.width * scaleX
    const outputHeight = crop.height * scaleY

    // Configurar el tamaño del canvas con pixelRatio para mejor calidad
    canvas.width = Math.floor(outputWidth * pixelRatio)
    canvas.height = Math.floor(outputHeight * pixelRatio)

    // Escalar el contexto para el pixelRatio
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = "high"
    ctx.imageSmoothingEnabled = true

    // Coordenadas de origen en la imagen natural
    const sourceX = crop.x * scaleX
    const sourceY = crop.y * scaleY
    const sourceWidth = crop.width * scaleX
    const sourceHeight = crop.height * scaleY

    // Dibujar la región recortada en el canvas
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight
    )

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"))
            return
          }
          resolve(blob)
        },
        "image/jpeg",
        0.95 // Calidad JPEG (95%)
      )
    })
  }

  async function handleCropComplete() {
    if (!imgRef.current || !completedCrop) {
      return
    }

    setIsProcessing(true)
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)
      onCropComplete(croppedBlob)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al recortar la imagen:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Recortar Imagen</DialogTitle>
          <DialogDescription>
            Ajusta la imagen para que quede cuadrada. Arrastra las esquinas para
            recortar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2 sm:py-4 w-full">
          {imageSrc && (
            <>
              {/* Controles de zoom */}
              <div className="flex items-center gap-2 w-full justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="flex items-center gap-1"
                >
                  <ZoomOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Alejar</span>
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md min-w-[80px] justify-center">
                  <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="flex items-center gap-1"
                >
                  <ZoomIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Acercar</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleZoomReset}
                  disabled={zoom === 1}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Resetear</span>
                </Button>
              </div>

              {/* Área de recorte con zoom */}
              <div className="w-full flex justify-center overflow-hidden border rounded-lg bg-muted/50 p-2">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  minWidth={100}
                  minHeight={100}
                  className="w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "50vh",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                      touchAction: "none",
                      transform: `scale(${zoom})`,
                      transformOrigin: "center center",
                      transition: "transform 0.2s ease-in-out",
                    }}
                    onLoad={onImageLoad}
                    draggable={false}
                  />
                </ReactCrop>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="flex-1 sm:flex-initial"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCropComplete}
            disabled={!completedCrop || isProcessing}
            className="flex-1 sm:flex-initial"
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin animate-fade-in transition-opacity duration-300" />}
            {isProcessing ? "Procesando..." : "Aplicar Recorte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

