import { building } from '$app/environment';
import { minify, type Options as MinifierOptions } from 'html-minifier-terser';

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
