import fs from 'node:fs/promises'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import JSON5 from 'json5'
import type { Plugin, ResolvedConfig } from 'vite'

function jsonMinifier(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'json-minifier',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async closeBundle(error) {
      if (error)
        return

      Promise.all((await fs.readdir(config.build.outDir, { recursive: true }))
        .filter(file => /\.(?:json5?|webmanifest)$/.test(file))
        .map(async (file) => {
          const path = `${config.build.outDir}/${file}`
          let json = await fs.readFile(path, 'utf8')
          json = JSON.stringify(JSON5.parse(json))
          await fs.writeFile(path, json)
        }))
    },
  }
}

export default {
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [
    sveltekit(),
    tailwindcss(),

    jsonMinifier(),
  ],
}
