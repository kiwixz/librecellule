import { execSync } from 'node:child_process';
import adapter from '@sveltejs/adapter-static';

function version() {
  const date = new Date(execSync('git show -s --format=%cI').toString().trim());
  const commit = execSync('git rev-parse --short @').toString().trim();

  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');

  return `${year}${month}${day}-${commit}`;
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  compilerOptions: {
    warningFilter: warning => warning.code !== 'a11y_no_static_element_interactions',
  },
  kit: {
    adapter: adapter(),
    inlineStyleThreshold: Infinity,
    version: {
      name: version(),
    },
  },
};
