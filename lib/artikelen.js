import { createReader } from '@keystatic/core/reader';
import config, { categories } from '../keystatic.config';

const reader = createReader(process.cwd(), config);
const formatter = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long', timeZone: 'UTC' });

export const beelden = {
  krant: { src: '/brand/kwispelkrant-illustratie.png', alt: 'Twee geïllustreerde honden lezen samen de Kwispelkrant' },
  mascottes: { src: '/brand/lio-en-lily.png', alt: 'Lily en Lio houden samen een krant vast tussen retrobloemen' },
  logo: { src: '/brand/logo.png', alt: 'Lily en Lio kijken over de rand van hun krant' },
};

export function artikelbeeld(entry) {
  return entry.afbeelding
    ? { src: entry.afbeelding, alt: entry.alttekst || '', stijl: 'upload' }
    : { ...beelden[entry.huisstijlbeeld], stijl: entry.huisstijlbeeld };
}

export function categorienaam(value) {
  return categories.find((category) => category.value === value)?.label;
}

export function datumtekst(datum) {
  return formatter.format(new Date(datum));
}

export async function alleArtikelen() {
  const artikelen = await reader.collections.artikelen.all();
  return artikelen.sort((a, b) => b.entry.datum.localeCompare(a.entry.datum));
}

export function leesArtikel(slug) {
  return reader.collections.artikelen.read(slug);
}
