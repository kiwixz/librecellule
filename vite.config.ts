import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import JSON5 from 'json5'

function configOverrider(): Plugin {
  return {
    name: 'config-overrider',
    config(config) {
      for (const output of [config?.build?.rollupOptions?.output].flat().filter(Boolean)) {
        output!.assetFileNames = (output!.assetFileNames as string | undefined)?.replace(/(\[name\]\.)?\[hash\]/, '[hash:21]')
        output!.chunkFileNames = (output!.chunkFileNames as string | undefined)?.replace(/(\[name\]\.)?\[hash\]/, '[hash:21]')
        output!.entryFileNames = (output!.entryFileNames as string | undefined)?.replace(/(\[name\]\.)?\[hash\]/, '[hash:21]')
      }
      return config
    },
  }
}

function jsonMinifier(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'json-minifier',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    resolveId: {
      filter: {
        id: /\.json\?min(?:&(?:no-)?inline)?$/,
      },
      async handler(source, importer) {
        const extraQuery = source.match(/\?min(.*)/)![1]

        let file = source.replace(/\?.*/, '')
        if (importer)
          file = path.resolve(path.dirname(importer), file)

        let json = await fs.readFile(file, 'utf8')
        json = JSON.stringify(JSON5.parse(json))

        const minified = `${config.cacheDir}/${path.relative(config.root, file)}`
        await fs.mkdir(path.dirname(minified), { recursive: true })
        await fs.writeFile(minified, json)

        return `${minified}?url${extraQuery}`
      },
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

    configOverrider(),
    jsonMinifier(),
  ],
}
