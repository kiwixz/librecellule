import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
export default {
  compilerOptions: {
    warningFilter: warning => warning.code !== 'a11y_no_static_element_interactions',
  },
  kit: {
    adapter: adapter(),
    inlineStyleThreshold: Infinity,
  },
}
