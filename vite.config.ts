import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const WEEKS_DIR = resolve(import.meta.dirname, 'src/data/weeks')

/** Importerar bara de Phosphor-ikoner som veckofilerna använder. */
function wordIcons(): Plugin {
  const id = 'virtual:word-icons'
  return {
    name: 'word-icons',
    resolveId: (source) => (source === id ? '\0' + id : undefined),
    load(source) {
      if (source !== '\0' + id) return
      const names = new Set<string>()
      for (const file of readdirSync(WEEKS_DIR).filter((f) => f.endsWith('.json'))) {
        const path = resolve(WEEKS_DIR, file)
        this.addWatchFile(path)
        for (const w of JSON.parse(readFileSync(path, 'utf8')).words ?? []) if (w.icon) names.add(w.icon)
      }
      const list = [...names].filter((n) => /^[A-Za-z0-9]+$/.test(n))
      return [
        ...list.map((n) => `import ${n} from 'phosphor-svelte/lib/${n}Icon'`),
        `export default { ${list.join(', ')} }`,
      ].join('\n')
    },
  }
}

export default defineConfig({
  base: '/glosor/',
  plugins: [svelte(), wordIcons()],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
