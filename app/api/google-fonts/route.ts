import { NextResponse } from "next/server"

interface GoogleFont {
  family: string
  variants: string[]
  subsets: string[]
  category: string
  version: string
  lastModified: string
  files: Record<string, string>
}

interface GoogleFontsResponse {
  kind: string
  items: GoogleFont[]
}

/**
 * API Route para obtener todas las fuentes disponibles de Google Fonts
 * Consulta el endpoint público de Google Fonts (no requiere API key)
 * 
 * Nota: Este endpoint tiene límites de rate, por lo que se cachea la respuesta
 * por 24 horas para optimizar el rendimiento.
 */
export async function GET() {
  try {
    // Usar el endpoint público de Google Fonts que no requiere API key
    // Este endpoint devuelve todas las fuentes disponibles en formato JSON
    const response = await fetch("https://fonts.google.com/metadata/fonts", {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; BrandKeeper/1.0)",
      },
      // Cachear la respuesta por 24 horas para optimizar rendimiento
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      // Si falla, intentar con la API oficial (requiere API key si está configurada)
      const apiKey = process.env.GOOGLE_FONTS_API_KEY
      if (apiKey) {
        const altResponse = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=${apiKey}`,
          {
            headers: {
              "Accept": "application/json",
            },
            next: { revalidate: 86400 },
          }
        )

        if (altResponse.ok) {
          const data: GoogleFontsResponse = await altResponse.json()
          const fonts = data.items.map((font) => ({
            family: font.family,
            variants: font.variants,
            category: font.category,
          }))
          return NextResponse.json({ fonts })
        }
      }

      return NextResponse.json(
        { error: "No se pudo obtener la lista de fuentes" },
        { status: 500 }
      )
    }

    const data = await response.json()

    // El endpoint de metadata devuelve un formato diferente
    // Transformar al formato esperado
    const fonts =
      data.familyMetadataList?.map((font: any) => ({
        family: font.family,
        variants: font.fonts ? Object.keys(font.fonts) : [],
        category: font.category || "sans-serif",
      })) || []

    return NextResponse.json({ fonts })
  } catch (error) {
    console.error("Error al consultar Google Fonts API:", error)
    return NextResponse.json(
      { error: "Error al obtener las fuentes de Google Fonts" },
      { status: 500 }
    )
  }
}

