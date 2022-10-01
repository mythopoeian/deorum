import client from '$lib/api/client';
import { URL } from '$lib/config';
import type { IFilters } from '$lib/filters.types';
import { toastError } from '$lib/stores';
import { normalizeError } from '$lib/utils/errors';

export const ssr = true;

const PAGE_SIZE = 100;
const DEFAULT_FILTER = 'active = true';
const DEFAULT_SORT = '-created';

// TODO: parse from search params
const filters: IFilters = {
  original: [],
  quality: [],
  colors: [],
  tags: [],
  styles: []
};

/** @type {import('./$types').PageLoad} */
export async function load({ url }: { url: URL }) {
  try {
    const page = 1;

    const filter = url.searchParams.get('filter') || DEFAULT_FILTER;
    const sort = url.searchParams.get('sort') || DEFAULT_SORT;

    const portraitsRequest = client.records.getList('portraits', page, PAGE_SIZE, { filter, sort });
    const tagsRequest = client.records.getFullList('tags', 100);
    const stylesRequest = client.records.getFullList('styles', 100);
    const originalsRequest = client.records.getFullList('originals', 100);

    const [portraitsList, tagsData, stylesData, originalsData] = await Promise.all([
      portraitsRequest,
      tagsRequest,
      stylesRequest,
      originalsRequest
    ]);

    const portraits = portraitsList.items;
    const hasMore = portraitsList.totalPages > 1;

    const tags = new Map(tagsData.map(({ id, emoji, name }) => [id, { emoji, name }]));

    const styles = new Map(stylesData.map(({ id, emoji, name }) => [id, { emoji, name }]));

    const originals = new Map(
      originalsData.map((original) => {
        const { id, image, name } = original;
        return [id, { image, name }];
      }) as [string, { image: string; name: string }][]
    );

    const portraitsImagePath = `${URL}/api/files/${portraits[0]?.['@collectionId']}`;
    const originalsImagePath = `${URL}/api/files/${originalsData[0]?.['@collectionId']}`;

    return {
      page,
      hasMore,
      filters,
      sort,
      portraits,
      tags,
      styles,
      originals,
      portraitsImagePath,
      originalsImagePath
    };
  } catch (error) {
    console.error(error);
    toastError(normalizeError(error));

    return {
      page: 1,
      hasMore: false,
      filters,
      sort: DEFAULT_SORT,
      portraits: [],
      tags: new Map(),
      styles: new Map(),
      originals: new Map(),
      portraitsImagePath: '',
      originalsImagePath: ''
    };
  }
}
