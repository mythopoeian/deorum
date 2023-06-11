import type { ISorting } from '$lib/types/filters.types';

const operatorsMap: { [key: string]: '=' | '~' } = {
  name: '~',
  bio: '~',
  gender: '='
};

function parse(value: unknown) {
  return typeof value === 'string' ? `"${value}"` : value;
}

export function parseFilters(filters: object) {
  const query = Object.entries(filters).map(([key, value]) => {
    if (value === null) return '';

    const operator = operatorsMap[key] || '=';
    if (key === 'hasCharacters') return value ? 'characters!="[]"' : 'characters="[]"';
    if (Array.isArray(value)) {
      if (value.length === 0) return '';
      return '(' + value.map((value) => `${key}=${parse(value)}`).join('||') + ')';
    }
    return value ? `${key}${operator}${parse(value)}` : '';
  });

  return query.filter(Boolean).join('&&');
}

export function parseSorting(sorting: ISorting) {
  return sorting.order === 'no' ? '' : `${sorting.order === 'desc' ? '-' : ''}${sorting.key}`;
}

function getParamFromUrl(url: string, key: string) {
  const AND = '_и_';
  const sanitizedUrl = url.replace(/&&/g, AND).replace(/[()"']/g, '');
  const value = new URL(sanitizedUrl).searchParams.get(key);
  return value ? value.replaceAll(AND, '&&').replaceAll('"', '') : '';
}

export function parseParamsToFilters<T>(
  url: string | undefined,
  defaultFilters: Record<string, string | string[]>
) {
  if (!url) return defaultFilters as T;

  const filters = { ...defaultFilters };
  const searchFilters = getParamFromUrl(url, 'filter');
  const parts = searchFilters.split(/&&|\|\|/);

  for (const part of parts) {
    const [key, value] = part.split(/=|~|"|'/);
    if (key && value) {
      if (Array.isArray(filters[key])) {
        (filters[key] as string[]).push(value);
      } else {
        filters[key] = value;
      }
    }
  }

  return filters as T;
}

export function parseParamsToSorting(url: string | undefined, defaultSorting: ISorting): ISorting {
  if (!url) return defaultSorting;
  const searchSort = getParamFromUrl(url, 'sort');
  if (!searchSort) return defaultSorting;

  const order = searchSort.startsWith('-') ? 'desc' : 'asc';
  const key = searchSort.replace(/^-/, '');
  return { key, order };
}
