import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { cache } from 'react';
import Markdoc from '@markdoc/markdoc';
import { leesArtikel } from '../../../../lib/artikelen';
import { Artikelbeeld, Artikelmeta } from '../../onderdelen';

const getArtikel = cache(leesArtikel);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const artikel = await getArtikel(slug);
  if (!artikel) notFound();
  return { title: artikel.titel, description: artikel.samenvatting };
}

export default async function Artikel({ params }) {
  const { slug } = await params;
  const entry = await getArtikel(slug);
  if (!entry) notFound();
  const { node } = await entry.tekst();

  return (
    <article className="artikel">
      <header className="artikelkop">
        <Link className="terug" href="/artikelen">← Alle artikelen</Link>
        <Artikelmeta entry={entry} />
        <h1>{entry.titel}</h1>
        <p className="intro">{entry.samenvatting}</p>
      </header>
      <Artikelbeeld entry={entry} prioriteit volledig />
      <div className="lopende-tekst">{Markdoc.renderers.react(Markdoc.transform(node), React)}</div>
    </article>
  );
}
