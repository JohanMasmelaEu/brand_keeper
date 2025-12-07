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
if (isWindows) {
  // En Windows, usar pnpm directamente (ya que el proyecto usa pnpm)
  // o usar el comando completo como string con shell
  nextProcess = spawn('pnpm next dev', {
    stdio: 'inherit',
    shell: true, // Necesario en Windows
    env: cleanEnv,
    cwd: process.cwd(),
  })
} else {
  // En Unix/Linux/Mac, usar pnpm directamente
  nextProcess = spawn('pnpm', ['next', 'dev'], {
    stdio: 'inherit',
    shell: false,
    env: cleanEnv,
    cwd: process.cwd(),
  })
}

nextProcess.on('error', (error) => {
  console.error('❌ Error ejecutando Next.js:', error)
  process.exit(1)
})

nextProcess.on('exit', (code) => {
  process.exit(code || 0)
})

// Manejar señales de terminación
process.on('SIGINT', () => {
  nextProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM')
})

