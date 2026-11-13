export const metadata = {
  title: { default: 'Kwispelkrant', template: '%s | Kwispelkrant' },
  description: 'Hondennieuws dat je bijblijft. Lees nieuws, verhalen en achtergronden over honden.',
};

export default function RootLayout({ children }) {
  return <html lang="nl-BE"><body>{children}</body></html>;
}
