import { browser } from '$app/environment';

const policy = browser
  ? window.trustedTypes?.createPolicy('librecellule', {
      createHTML: html => html,
      createScript: script => script,
      createScriptURL: url => url,
    })
  : null;

export function trustedHtml(html: string): TrustedHTML | string {
  return policy?.createHTML(html) ?? html;
}

export function trustedScript(script: string): TrustedScript | string {
  return policy?.createScript(script) ?? script;
}

export function trustedScriptUrl(url: string): TrustedScriptURL | string {
  return policy?.createScriptURL(url) ?? url;
}
