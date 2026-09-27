import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = param => /^[0-9a-f]{32}$/.test(param);
