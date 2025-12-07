/**
 * Script wrapper para desarrollo con limpieza de terminal
 * Este script limpia la terminal antes de ejecutar Next.js
 * Se ejecuta cada vez que nodemon detecta un cambio
 */

// Función para limpiar la terminal
function clearTerminal() {
  if (process.platform === 'win32') {
    // Windows - usar secuencias ANSI (funciona en PowerShell y CMD modernos)
    process.stdout.write('\x1B[2J\x1B[0f')
  } else {
    // Unix/Linux/Mac
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H')
  }
}

// Limpiar la terminal al inicio y en cada reinicio
clearTerminal()

// Mostrar mensaje de inicio
// Nodemon establece NODEMON_RESTART solo cuando realmente reinicia
const isRestart = process.env.NODEMON_RESTART
if (isRestart) {
  console.log('🔄 Reiniciando servidor...\n')
} else {
  console.log('🚀 Iniciando servidor de desarrollo...\n')
}

// Ejecutar Next.js
const { spawn } = require('child_process')

// Limpiar variables de entorno problemáticas de npm para evitar warnings
const cleanEnv = { ...process.env }
delete cleanEnv['npm-globalconfig']
delete cleanEnv['verify-deps-before-run']
delete cleanEnv['_jsr-registry']
delete cleanEnv['npm_config_npm-globalconfig']
delete cleanEnv['npm_config_verify-deps-before-run']
delete cleanEnv['npm_config__jsr-registry']

// Establecer NODE_ENV
cleanEnv.NODE_ENV = 'development'

// En Windows necesitamos usar shell: true, pero lo hacemos de forma segura
// usando el comando completo como string (no concatenando argumentos)
const isWindows = process.platform === 'win32'

let nextProcess
let serverReady = false
let readyTimeout

// Función para detectar cuando el servidor está listo
// Solo verifica una vez al inicio, no continuamente
function checkServerReady() {
  const http = require('http')
  let checkCount = 0
  const maxChecks = 20 // Máximo 20 intentos (10 segundos)
  
  const check = () => {
    if (checkCount >= maxChecks) {
      console.log('\n⚠️  No se pudo verificar que el servidor esté listo, pero debería estar funcionando\n')
      return
    }
    
    checkCount++
    const req = http.get('http://localhost:3000', { timeout: 2000 }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404 || res.statusCode === 307 || res.statusCode === 308) {
        // El servidor está respondiendo (incluyendo redirects)
        if (!serverReady) {
          serverReady = true
          console.log('\n✅ Servidor listo en http://localhost:3000')
          console.log('💡 Next.js hot reload está activo - los cambios se reflejarán automáticamente\n')
        }
        clearTimeout(readyTimeout)
      }
    })
    
    req.on('error', () => {
      // El servidor aún no está listo, intentar de nuevo
      if (!serverReady && checkCount < maxChecks) {
        readyTimeout = setTimeout(check, 1000) // Verificar cada segundo
      }
    })
    
    req.on('timeout', () => {
      req.destroy()
      if (!serverReady && checkCount < maxChecks) {
        readyTimeout = setTimeout(check, 1000)
      }
    })
  }
  
  // Esperar un poco antes de empezar a verificar
  setTimeout(check, 3000)
}

// Función para encontrar y ejecutar pnpm de manera confiable
function spawnPnpm() {
  // En Windows, usar shell con el comando completo para evitar problemas de PATH
  if (isWindows) {
    // Usar el comando completo como string con shell (más confiable en Windows)
    return spawn('pnpm next dev', {
      stdio: 'inherit',
      shell: true, // Necesario en Windows cuando pnpm no está en PATH del proceso Node
      env: cleanEnv,
      cwd: process.cwd(),
    })
  }
  
  // En otros sistemas, intentar primero sin shell
  try {
    return spawn('pnpm', ['next', 'dev'], {
      stdio: 'inherit',
      shell: false,
      env: cleanEnv,
      cwd: process.cwd(),
    })
  } catch (error) {
    // Si falla, usar npx como fallback
    console.log('⚠️  pnpm no encontrado directamente, usando npx...')
    return spawn('npx', ['pnpm', 'next', 'dev'], {
      stdio: 'inherit',
      shell: false,
      env: cleanEnv,
      cwd: process.cwd(),
    })
  }
}

// Ejecutar pnpm
nextProcess = spawnPnpm()

// Detectar cuando el servidor está listo
checkServerReady()

nextProcess.on('error', (error) => {
  console.error('❌ Error ejecutando Next.js:', error)
  process.exit(1)
})

nextProcess.on('exit', (code) => {
  clearTimeout(readyTimeout)
  process.exit(code || 0)
})

// Manejar señales de terminación
process.on('SIGINT', () => {
  nextProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM')
})

