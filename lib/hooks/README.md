# React Hook Form - Guía de Uso

Esta guía explica cómo usar React Hook Form con Shadcn UI en todos los formularios de la aplicación.

## Estructura

- **`lib/hooks/use-form-validation.ts`**: Hook personalizado que encapsula la lógica común de formularios
- **`lib/validations/schemas.ts`**: Esquemas de validación reutilizables con Zod
- **`components/ui/form.tsx`**: Componentes de formulario de Shadcn UI

## Uso Básico

### 1. Crear un esquema de validación

Si no existe, agrega tu esquema en `lib/validations/schemas.ts`:

```typescript
import { z } from "zod"
import { emailSchema, passwordSchema } from "./schemas"

export const myFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  // ... otros campos
})

export type MyFormData = z.infer<typeof myFormSchema>
```

### 2. Usar el hook en tu componente

```tsx
"use client"

import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { myFormSchema } from "@/lib/validations/schemas"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function MyForm() {
  const { form, onSubmit, isSubmitting, error } = useFormValidation({
    schema: myFormSchema,
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (data) => {
      // Tu lógica de envío aquí
      console.log("Datos validados:", data)
      // Ejemplo: await api.submit(data)
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  )
}
```

## Características

### Validación Automática
- La validación se ejecuta mientras el usuario escribe (`mode: "onChange"`)
- Los mensajes de error se muestran automáticamente debajo de cada campo
- El formulario no se envía si hay errores de validación

### Manejo de Errores
- Errores de validación: se muestran automáticamente por campo
- Errores de envío: se muestran en la variable `error` del hook
- Errores personalizados: usa `setError()` para mostrar mensajes personalizados

### Estados
- `isSubmitting`: Indica si el formulario se está enviando
- `error`: Mensaje de error general (si existe)
- `form`: Objeto de React Hook Form con todos sus métodos

## Esquemas de Validación Disponibles

En `lib/validations/schemas.ts` encontrarás esquemas reutilizables:

- `emailSchema`: Validación de email
- `passwordSchema`: Validación de contraseña (mínimo 6 caracteres)
- `fullNameSchema`: Validación de nombre completo
- `phoneSchema`: Validación de teléfono
- `urlSchema`: Validación de URL

## Ejemplo Completo: Formulario de Login

Ver `app/login/page.tsx` para un ejemplo completo de implementación.

## Buenas Prácticas

1. **Siempre usa el hook `useFormValidation`** en lugar de `useForm` directamente
2. **Reutiliza esquemas** de `lib/validations/schemas.ts` cuando sea posible
3. **Agrega nuevos esquemas** a `schemas.ts` si son reutilizables
4. **Usa `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`** de Shadcn UI
5. **Maneja errores** tanto de validación como de envío

## Tipos TypeScript

Los tipos se infieren automáticamente del esquema:

```typescript
const { form } = useFormValidation({
  schema: myFormSchema,
  // ...
})

// form.getValues() retorna MyFormData
// form.watch("email") retorna string
```

