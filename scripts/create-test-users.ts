/**
 * Script para crear usuarios de prueba
 * 
 * Este script crea:
 * 1. La empresa matriz
 * 2. Dos empresas hijas de ejemplo
 * 3. Usuarios de prueba para cada rol
 * 
 * Uso:
 *   pnpm tsx scripts/create-test-users.ts
 * 
 * IMPORTANTE: Asegúrate de tener configuradas las variables de entorno
 * y de haber ejecutado el esquema SQL primero.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

// Cliente con service role key para operaciones administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface TestUser {
  email: string
  password: string
  fullName: string
  role: 'super_admin' | 'admin' | 'collaborator'
  companyName: string
  companySlug: string
  isParentCompany: boolean
}

const testUsers: TestUser[] = [
  {
    email: 'superadmin@brandkeeper.test',
    password: 'SuperAdmin123!',
    fullName: 'Super Administrador',
    role: 'super_admin',
    companyName: 'Empresa Matriz',
    companySlug: 'empresa-matriz',
    isParentCompany: true,
  },
  {
    email: 'admin@brandkeeper.test',
    password: 'Admin123!',
    fullName: 'Administrador Empresa Hija 1',
    role: 'admin',
    companyName: 'Empresa Hija 1',
    companySlug: 'empresa-hija-1',
    isParentCompany: false,
  },
  {
    email: 'colaborador@brandkeeper.test',
    password: 'Colaborador123!',
    fullName: 'Colaborador Empresa Hija 1',
    role: 'collaborator',
    companyName: 'Empresa Hija 1',
    companySlug: 'empresa-hija-1',
    isParentCompany: false,
  },
  {
    email: 'admin2@brandkeeper.test',
    password: 'Admin123!',
    fullName: 'Administrador Empresa Hija 2',
    role: 'admin',
    companyName: 'Empresa Hija 2',
    companySlug: 'empresa-hija-2',
    isParentCompany: false,
  },
  {
    email: 'colaborador2@brandkeeper.test',
    password: 'Colaborador123!',
    fullName: 'Colaborador Empresa Hija 2',
    role: 'collaborator',
    companyName: 'Empresa Hija 2',
    companySlug: 'empresa-hija-2',
    isParentCompany: false,
  },
]

async function createCompanies() {
  console.log('📦 Empresas')
  const companiesMap = new Map<string, string>()

  // Primero, obtener o crear la empresa matriz
  const parentCompanyUser = testUsers.find(u => u.isParentCompany)
  if (!parentCompanyUser) {
    console.error('   ❌ No se encontró empresa matriz')
    return companiesMap
  }

  const { data: existingParent } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', parentCompanyUser.companySlug)
    .maybeSingle()

  let parentCompanyId: string
  if (existingParent) {
    parentCompanyId = existingParent.id
    companiesMap.set(parentCompanyUser.companySlug, parentCompanyId)
  } else {
    const { data: parentCompany, error: parentError } = await supabase
      .from('companies')
      .insert({
        name: parentCompanyUser.companyName,
        slug: parentCompanyUser.companySlug,
        is_parent: true,
        parent_company_id: null,
      })
      .select('id')
      .single()

    if (parentError) {
      console.error(`   ❌ ${parentCompanyUser.companyName}: ${parentError.message}`)
      return companiesMap
    }

    parentCompanyId = parentCompany.id
    companiesMap.set(parentCompanyUser.companySlug, parentCompanyId)
    console.log(`   ✓ ${parentCompanyUser.companyName}`)
  }

  // Crear empresas hijas
  const childCompanies = testUsers.filter(u => !u.isParentCompany)
  const uniqueChildCompanies = Array.from(
    new Map(childCompanies.map(u => [u.companySlug, u])).values()
  )

  for (const user of uniqueChildCompanies) {
    if (companiesMap.has(user.companySlug)) continue

    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', user.companySlug)
      .maybeSingle()

    if (existing) {
      companiesMap.set(user.companySlug, existing.id)
      continue
    }

    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name: user.companyName,
        slug: user.companySlug,
        is_parent: false,
        parent_company_id: parentCompanyId,
      })
      .select('id')
      .single()

    if (error) {
      console.error(`   ❌ ${user.companyName}: ${error.message}`)
      continue
    }

    console.log(`   ✓ ${user.companyName}`)
    companiesMap.set(user.companySlug, company.id)
  }

  return companiesMap
}

async function userExistsInAuth(email: string): Promise<{ exists: boolean; userId?: string }> {
  try {
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) return { exists: false }
    
    if (usersData?.users) {
      const existingUser = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
      if (existingUser) {
        return { exists: true, userId: existingUser.id }
      }
    }
    
    return { exists: false }
  } catch {
    return { exists: false }
  }
}

async function createUser(user: TestUser, companyId: string) {
  const { exists: userExists, userId: existingUserId } = await userExistsInAuth(user.email)
  
  let userId: string | null = null

  if (userExists && existingUserId) {
    userId = existingUserId
  } else {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    })

    if (authError) {
      if (
        authError.message.includes('already registered') ||
        authError.message.includes('already exists') ||
        authError.message.includes('User already registered')
      ) {
        const { exists: recheckExists, userId: recheckUserId } = await userExistsInAuth(user.email)
        if (recheckExists && recheckUserId) {
          userId = recheckUserId
        } else {
          console.error(`   ❌ ${user.email}: No se pudo obtener ID`)
          return false
        }
      } else {
        console.error(`   ❌ ${user.email}: ${authError.message}`)
        return false
      }
    } else if (authData?.user) {
      userId = authData.user.id
    } else {
      console.error(`   ❌ ${user.email}: Respuesta vacía`)
      return false
    }
  }

  if (!userId) {
    console.error(`   ❌ ${user.email}: No se pudo obtener ID`)
    return false
  }

  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('user_profiles')
    .select('id, email, role, company_id, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (profileCheckError) {
    if (profileCheckError.code !== 'PGRST116' && profileCheckError.code !== '42P01') {
      console.error(`   ❌ ${user.email}: ${profileCheckError.message}`)
      return false
    }
  }

  if (existingProfile) {
    const needsUpdate = 
      existingProfile.email !== user.email ||
      existingProfile.role !== user.role ||
      existingProfile.company_id !== companyId

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          company_id: companyId,
          is_active: true,
        })
        .eq('id', userId)

      if (updateError) {
        console.error(`   ❌ ${user.email}: ${updateError.message}`)
        return false
      }
    }
    return true
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      company_id: companyId,
      is_active: true,
    })

  if (profileError) {
    console.error(`   ❌ ${user.email}: ${profileError.message}`)
    return false
  }

  return true
}

async function main() {
  console.log('🚀 Creando usuarios de prueba\n')

  try {
    const companiesMap = await createCompanies()
    console.log('')

    console.log('👥 Usuarios')
    for (const user of testUsers) {
      const companyId = companiesMap.get(user.companySlug)
      if (!companyId) {
        console.error(`   ❌ ${user.email}: Empresa no encontrada`)
        continue
      }

      const success = await createUser(user, companyId)
      if (success) {
        console.log(`   ✓ ${user.email} (${user.role})`)
      }
    }

    console.log('\n✅ Completado\n')
    console.log('📋 Credenciales:')
    console.log('─'.repeat(50))
    for (const user of testUsers) {
      console.log(`\n${user.role.toUpperCase()}`)
      console.log(`  ${user.email}`)
      console.log(`  ${user.password}`)
      console.log(`  ${user.companyName}`)
    }
    console.log('\n' + '─'.repeat(50))
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()

