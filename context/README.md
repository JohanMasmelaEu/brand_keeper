# Carpeta de Contexto

Esta carpeta contiene documentación específica sobre temas particulares de la aplicación Brand Keeper.

## Propósito

Los archivos en esta carpeta proporcionan contexto detallado sobre aspectos específicos del proyecto, como:

- Arquitectura de módulos específicos
- Flujos de negocio detallados
- Especificaciones técnicas de componentes
- Decisiones de diseño
- Reglas de negocio específicas
- Integraciones y APIs
- Esquemas de base de datos detallados
- Guías de implementación por módulo

## Archivos Disponibles

### Documentación de Implementación

- **IMPLEMENTATION.md** - Documentación completa de la implementación actual, incluyendo:
  - Conexión con Supabase
  - Despliegue en Vercel
  - Integración entre ambas plataformas
  - Configuración de seguridad
  - Estado actual del proyecto

### Configuración y Setup

- **SUPABASE_SETUP.md** - Guía de configuración de Supabase para desarrollo y producción
- **VERCEL_DEPLOYMENT.md** - Guía completa de despliegue en Vercel
- **USER_SETUP.md** - Configuración de usuarios y roles
- **SECURITY.md** - Consideraciones de seguridad

### Base de Datos

- **DATABASE_SCHEMA.sql** - Esquema completo de la base de datos

## Estructura Actual

```
context/
├── README.md (este archivo)
├── IMPLEMENTATION.md ⭐ (Nuevo - Estado actual de la implementación)
├── SUPABASE_SETUP.md
├── VERCEL_DEPLOYMENT.md
├── USER_SETUP.md
├── SECURITY.md
└── DATABASE_SCHEMA.sql
```

## Uso

Cuando trabajes en un tema específico, consulta primero los archivos relevantes en esta carpeta para entender el contexto completo antes de implementar cambios.

## Mantenimiento

- Actualiza los archivos cuando cambien las especificaciones
- Mantén la documentación sincronizada con el código
- Agrega nuevos archivos cuando se introduzcan nuevas funcionalidades o módulos
