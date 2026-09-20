import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export const prerender = false;

export function load(): never {
  redirect(307, resolve('/'));
}
