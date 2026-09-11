import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import { buildLocalPlugin, environments, verifyCanonicalProduction, verifyLocalServices } from './environment/runtime.mjs'
import { createClient, createRunner, describeState, label, switchClient } from './environment/clients.mjs'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const help = `Selector de entorno de Tasky

Uso: node scripts/use-environment.mjs [local|prod|production|status] [--install] [--client=codex|claude|all]

Sin argumentos: menú interactivo en español (requiere terminal).
local / prod / production: prepara el entorno; --install aplica el cambio.
status: consulta instalaciones reales, sin modificar nada; respeta --client.
--client: codex, claude o all (predeterminado).
--help: muestra esta ayuda.

Ejemplos:
  node scripts/use-environment.mjs
  node scripts/use-environment.mjs local --install --client=all
  node scripts/use-environment.mjs prod --install --client=codex
  node scripts/use-environment.mjs status --client=claude

PROD: ${environments.production.url}
Local: ${environments.local.url}
OAuth local: https://localhost:5185/oauth/mcp/authorize
Cada entorno usa su propio identificador y OAuth nativo. El cambio de instalación
no actualiza automáticamente una conversación abierta ni verifica su autenticación.`

export function parseArgs(args) {
  if (!args.length) return { interactive: true }
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) return { help: true }
  let environment
  let client = 'all'
  let install = false
  let clientSet = false
  for (const arg of args) {
    if (arg === '--install' && !install) install = true
    else if (arg.startsWith('--client=') && !clientSet) { client = arg.slice('--client='.length); clientSet = true }
    else if (['local', 'prod', 'production', 'status'].includes(arg) && !environment) environment = arg === 'prod' ? 'production' : arg
    else throw new Error(`Argumento no válido o repetido: ${arg}`)
  }
  if (!environment) throw new Error('Indica local, prod, production o status')
  if (!['codex', 'claude', 'all'].includes(client)) throw new Error('--client debe ser codex, claude o all')
  if (environment === 'status' && install) throw new Error('status no admite --install')
  return { environment, client, install }
}

const selectedClients = (client) => client === 'all' ? ['codex', 'claude'] : [client]

export async function menu(adapters, ask, write) {
  const available = []
  for (const adapter of adapters) {
    try { if (adapter.available()) available.push(adapter) } catch (error) { write(`${label(adapter.name)}: ${error.message}`) }
  }
  if (!available.length) throw new Error('No se encontró Codex ni Claude Code disponible en PATH')
  while (true) {
    write('\nTasky — selector de entorno\n1. Consultar estado\n2. Cambiar a Local\n3. Cambiar a PROD\n0. Cancelar')
    const answer = (await ask('Elige una opción: '))?.trim()
    if (answer == null || ['0', 'q', ''].includes(answer)) return null
    if (!['1', '2', '3'].includes(answer)) { write('Opción no válida.'); continue }
    const choices = available.length === 2 ? [
      { name: 'all', label: 'Ambos (predeterminado)' },
      ...available.map((a) => ({ name: a.name, label: label(a.name) })),
    ] : available.map((a) => ({ name: a.name, label: label(a.name) }))
    let client
    while (!client) {
      write(choices.map((c, i) => `${i + 1}. ${c.label}`).join('\n') + '\n0. Cancelar')
      const choice = (await ask('Cliente [1]: '))?.trim()
      if (choice == null || ['0', 'q'].includes(choice)) return null
      client = choices[Number(choice || '1') - 1]?.name
      if (!client) write('Opción no válida.')
    }
    if (answer === '1') {
      for (const adapter of available.filter((a) => client === 'all' || a.name === client)) {
        try { write(describeState(adapter.name, adapter.inspect())) } catch (error) { write(`${label(adapter.name)}: error de inspección: ${error.message}`) }
      }
      continue
    }
    return { environment: answer === '2' ? 'local' : 'production', client, install: true }
  }
}

function promptSession(input, output) {
  const rl = createInterface({ input, output })
  const controller = new AbortController()
  rl.on('SIGINT', () => { controller.abort(); rl.close() })
  rl.on('close', () => controller.abort())
  return {
    async ask(question) {
      if (controller.signal.aborted) return null
      try { return await rl.question(question, { signal: controller.signal }) } catch (error) {
        if (controller.signal.aborted) return null
        throw error
      }
    },
    close() { rl.close() },
  }
}

export async function main(args = process.argv.slice(2), {
  root = repositoryRoot,
  input = process.stdin,
  output = process.stdout,
  run = createRunner(root),
  clients = Object.fromEntries(['codex', 'claude'].map((name) => [name, createClient(name, root, run)])),
  verifyLocal = verifyLocalServices,
  ask,
} = {}) {
  const write = (message) => output.write(`${message}\n`)
  let unlock
  try {
    let options = parseArgs(args)
    if (options.help || (options.interactive && (!input.isTTY || !output.isTTY))) { write(help); return 0 }
    if (options.interactive) {
      const prompt = ask ? { ask, close() {} } : promptSession(input, output)
      try { options = await menu(Object.values(clients), prompt.ask, write) } finally { prompt.close() }
      if (!options) { write('Cancelado. No se modificaron instalaciones.'); return 0 }
    }
    const targets = selectedClients(options.client).map((name) => clients[name])
    if (options.environment === 'status') {
      let failed = false
      for (const adapter of targets) {
        try {
          if (!adapter.available()) throw new Error('Cliente no disponible en PATH')
          const state = adapter.inspect()
          write(describeState(adapter.name, state))
          adapter.assertManaged(state)
          if (state.items.filter((p) => p.enabled).length > 1) failed = true
        } catch (error) { failed = true; write(`${label(adapter.name)}: error de inspección: ${error.message}`) }
      }
      return failed ? 1 : 0
    }
    // Complete the shared preflight before creating a runtime or changing either client.
    if (options.install) {
      for (const adapter of targets) {
        if (!adapter.available()) throw new Error(`${label(adapter.name)} no está disponible en PATH; no se modificaron instalaciones`)
        adapter.checkCommands()
      }
    }
    verifyCanonicalProduction(root)
    run(process.execPath, [path.join(root, 'scripts/validate-plugin.mjs')])
    if (options.environment === 'local') {
      write('Comprobando API, OAuth y consentimiento local…')
      await verifyLocal()
    }
    const runtimeRoot = path.join(root, '.tasky-runtime')
    fs.mkdirSync(runtimeRoot, { recursive: true })
    const lock = path.join(runtimeRoot, 'environment.lock')
    try { fs.writeFileSync(lock, `${process.pid}\n`, { flag: 'wx' }) } catch (error) {
      if (error.code !== 'EEXIST') throw error
      throw new Error(`Ya hay un cambio en curso o un bloqueo pendiente: ${lock}. Si el proceso indicado terminó, elimina únicamente ese archivo y reintenta`)
    }
    unlock = () => fs.rmSync(lock)
    const targetRoot = options.environment === 'local' ? buildLocalPlugin(root) : root
    if (!options.install) {
      write(`Entorno ${environments[options.environment].label} preparado en ${targetRoot}. No se cambió ninguna instalación.`)
      write(`Para aplicarlo: node scripts/use-environment.mjs ${options.environment} --install --client=${options.client}`)
      return 0
    }
    const results = []
    for (const adapter of targets) results.push(switchClient(root, adapter, options.environment, targetRoot, write))
    write('La instalación y OAuth se verifican por separado. Tras recargar, consulta el perfil para confirmar organización y entorno.')
    return results.every((r) => r.ok) ? 0 : 1
  } catch (error) {
    write(`ERROR: ${error.message}`)
    return 1
  } finally { unlock?.() }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main()
}
