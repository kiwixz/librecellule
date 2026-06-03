import type { Options as MinifierOptions } from 'html-minifier-terser';

import { building } from '$app/environment';
import { minify } from 'html-minifier-terser';
import { transform as transformCss } from 'lightningcss';

function minifyCss(css: string): string {
  let code: Uint8Array<ArrayBufferLike> = new TextEncoder().encode(css);

  code = transformCss({
    filename: '',
    code,
    minify: true,
    errorRecovery: true,
  }).code;

  return new TextDecoder().decode(code);
}

const minifierOptions: MinifierOptions = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  decodeEntities: true,
  minifyCSS: (css, type) => type ? css : minifyCss(css),
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
};

export async function handle({ event, resolve }) {
  if (!building)
    return resolve(event);

  let orig = '';

  return resolve(event, {
    transformPageChunk: ({ html, done }) => {
      orig += html;
      if (done)
        return minify(orig, minifierOptions);
    },
  });
}
