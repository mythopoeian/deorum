import { json } from '@sveltejs/kit';
import admin from '$lib/api/admin';
import { invalidateCache } from '$lib/cache/cacheInstance';
import { createServerError } from '$lib/utils/errors';
import { log, report } from '$lib/utils/log';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
  try {
    const id = params.slug;
    const filter = url.searchParams.get('filter') || '';
    const expand = url.searchParams.get('expand') || '';

    const character = await admin.records.getOne('characters', id, { filter, expand });
    log('characters', `Loading character ${id}`);
    return json(character);
  } catch (err) {
    report('characters', err);
    throw createServerError(err);
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const id = params.slug;
    const character = await admin.records.delete('characters', id);
    invalidateCache('characters', 'portraits');
    log('characters', `Character ${id} is deleted`);
    return json(character);
  } catch (err) {
    report('characters', err);
    throw createServerError(err);
  }
};
