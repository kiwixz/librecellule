import { createHash } from 'node:crypto'
import { building } from '$app/environment'
import { minify, type Options as MinifierOptions } from 'html-minifier-terser'

const minifierOptions: MinifierOptions = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  decodeEntities: true,
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: url => url.replace(/^\.\//, ''),
  preserveLineBreaks: true,
  processConditionalComments: true,
  removeAttributeQuotes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
}

export async function handle({ event, resolve }) {
  if (!building)
    return resolve(event)

  let orig = ''

  return resolve(event, {
    transformPageChunk: async ({ html, done }) => {
      orig += html
      if (done) {
        let mini = await minify(orig, minifierOptions)

        const findScripts = (html: string) => [...html.matchAll(/<script>(.*?)(<\/script>|$)/gs)].map(match => match[1])
        const zip = (a: string[], b: string[]) => a.map((e, i) => [e, b[i]])
        const hash = (script: string) => `'sha256-${createHash('sha256').update(script).digest('base64')}'`

        for (const [origScript, miniScript] of zip(findScripts(orig), findScripts(mini))) {
          let ok = false

          mini = mini.replace(
            hash(origScript),
            () => {
              ok = true
              return hash(miniScript)
            })

          if (!ok)
            throw new Error('Could not replace script hash')
        }

        return mini
      }
    },
  })
}
