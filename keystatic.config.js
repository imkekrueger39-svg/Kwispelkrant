import { collection, config, fields } from '@keystatic/core';

export const categories = [
  { value: 'nieuws', label: 'Nieuws' },
  { value: 'gezondheid', label: 'Gezondheid' },
  { value: 'gedrag-en-opvoeding', label: 'Gedrag & opvoeding' },
  { value: 'hondenverhalen', label: 'Hondenverhalen' },
];

const repository = process.env.NEXT_PUBLIC_KEYSTATIC_REPOSITORY;

export default config({
  storage: repository ? { kind: 'github', repo: repository } : { kind: 'local' },
  collections: {
    artikelen: collection({
      label: 'Artikelen',
      slugField: 'titel',
      path: 'content/artikelen/*',
      format: { contentField: 'tekst' },
      columns: ['titel', 'datum', 'categorie'],
      schema: {
        titel: fields.slug({ name: { label: 'Titel', validation: { isRequired: true } } }),
        datum: fields.date({ label: 'Datum', validation: { isRequired: true } }),
        categorie: fields.select({ label: 'Categorie', options: categories, defaultValue: 'nieuws' }),
        samenvatting: fields.text({ label: 'Samenvatting', multiline: true, validation: { isRequired: true } }),
        uitgelicht: fields.checkbox({ label: 'Uitlichten op de voorpagina', defaultValue: false }),
        fictief: fields.checkbox({ label: 'Fictief voorbeeldartikel', defaultValue: false }),
        huisstijlbeeld: fields.select({
          label: 'Huisstijlbeeld bij afwezigheid van een upload',
          options: [
            { label: 'Kwispelkrant-illustratie', value: 'krant' },
            { label: 'Lily en Lio', value: 'mascottes' },
            { label: 'Hoofdlogo', value: 'logo' },
          ],
          defaultValue: 'krant',
        }),
        afbeelding: fields.image({
          label: 'Artikelafbeelding',
          directory: 'public/artikelbeelden',
          publicPath: '/artikelbeelden/',
        }),
        alttekst: fields.text({ label: 'Alt-tekst bij de geüploade afbeelding' }),
        tekst: fields.markdoc({ label: 'Artikeltekst', extension: 'md' }),
      },
    }),
  },
});
