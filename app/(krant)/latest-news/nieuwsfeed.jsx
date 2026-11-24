import Link from 'next/link';
import { haalLaatsteNieuws } from '../../../lib/laatste-nieuws.mjs';
import { Bloem } from '../onderdelen';
import stijl from './nieuwsfeed.module.css';

const datumformaat = new Intl.DateTimeFormat('nl-BE', {
  dateStyle: 'long',
  timeZone: 'Europe/Brussels',
});

export default async function Nieuwsfeed({ overzicht = false }) {
  const berichten = (await haalLaatsteNieuws()).slice(0, overzicht ? 20 : 6);
  const Kop = overzicht ? 'h1' : 'h2';
  const Berichtkop = overzicht ? 'h2' : 'h3';

  return (
    <section className={stijl.feed} aria-labelledby="externe-nieuwskop">
      <header className={stijl.kop}>
        <div>
          <Kop id="externe-nieuwskop" lang="en">LATEST NEWS <Bloem /></Kop>
          <p>Vers van de hondenpers!</p>
        </div>
        <span className={stijl.poot} aria-hidden="true">🐾</span>
      </header>
      <p className={stijl.uitleg}>Externe nieuwsberichten van hondenpublicaties.</p>
      {berichten.length ? (
        <ul className={stijl.kaarten}>
          {berichten.map(({ titel, link, bron, tijd, sleutel }) => (
            <li key={sleutel} className={stijl.kaart}>
              <article>
                <p className={stijl.meta}>
                  <span>{bron}</span>
                  <time dateTime={new Date(tijd).toISOString()}>{datumformaat.format(tijd)}</time>
                </p>
                <Berichtkop lang="en">{titel}</Berichtkop>
                <a className="knop" href={link} aria-label={`Lees bij de bron: ${titel}`}>Lees bij de bron</a>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className={stijl.leeg}>Er zijn tijdelijk geen externe nieuwsberichten beschikbaar.</p>
      )}
      {!overzicht && <Link className={stijl.meer} href="/latest-news">Meer externe nieuwsberichten</Link>}
    </section>
  );
}
