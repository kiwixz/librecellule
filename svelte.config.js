import adapter from '@sveltejs/adapter-static'
import htmlMinifier from 'sveltekit-html-minifier'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: htmlMinifier(adapter(), {
      minifierOptions: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyURLs: url => url.replace(/^\.\//, ''),
        preserveLineBreaks: true,
        processConditionalComments: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
      },
    }),
  },
}

export default config
