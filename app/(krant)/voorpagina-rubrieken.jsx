import Image from 'next/image';
import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import kwispelpas from '../../public/brand/kwispelpas.png';
import snuffelzoeker from '../../public/brand/snuffelzoeker.png';
import blafOfBlaat from '../../public/brand/blaf of blaat.png';
import { austinVerversing, leesAustin } from '../../lib/austin-pootjes-cache';
import { Bloem } from './onderdelen';
import stijl from './voorpagina-rubrieken.module.css';

const speelkaarten = [
  {
    titel: 'De Kwispelpas',
    tekst: 'Maak een persoonlijk paspoort voor jouw viervoeter!',
    knop: 'Maak je Kwispelpas',
    href: '/kwispelpas',
    beeld: kwispelpas,
  },
  {
    titel: 'De Snuffelzoeker',
    tekst: 'Speel een woordzoeker of ontwerp je eigen puzzel!',
    knop: 'Begin met snuffelen',
    href: '/snuffelzoeker',
    beeld: snuffelzoeker,
  },
  {
    titel: 'Blaf of Blaat?',
    tekst: 'Feit of fabel? Test je hondenkennis!',
    knop: 'Test je kennis',
    href: '/blaf-of-blaat',
    beeld: blafOfBlaat,
  },
];

const datumformaat = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long', timeZone: 'UTC' });

export async function PootjesUitgelicht() {
  let resultaat;
  try {
    resultaat = await leesAustin();
  } catch (fout) {
    console.warn('[Voorpagina: Pootjes in cijfers]', fout.message);
  }

  const dag = resultaat?.data.at(-1);
  const verouderd = resultaat && Date.now() - Date.parse(resultaat.opgehaaldOp) >= austinVerversing * 1000;
  return (
    <section className="recent" aria-labelledby="pootjes-uitgelicht">
      <div className={stijl.datakaart}>
        <header>
          <PawPrint className={stijl.poot} size={25} aria-hidden="true" />
          <h2 id="pootjes-uitgelicht">Pootjes in cijfers</h2>
          <p>Austin Animal Center, Texas, Verenigde Staten</p>
        </header>
        <div>
          {dag ? (
            <>
              <p className={stijl.datum}>Recentste gedeelde registratiedag · <time dateTime={dag.date}>{datumformaat.format(Date.parse(dag.date))}</time></p>
              <dl className={stijl.aantallen}>
                <div><dt>Adopties</dt><dd>{dag.adopted ?? 'Geen gegevens'}</dd></div>
                <div><dt>Zwerfdieropnames</dt><dd>{dag.rescued ?? 'Geen gegevens'}</dd></div>
              </dl>
              {verouderd && <p className={stijl.bronnen}>Deze laatst opgehaalde cijfers zijn mogelijk verouderd.</p>}
            </>
          ) : (
            <p>De cijfers zijn tijdelijk niet beschikbaar.</p>
          )}
          <p className={stijl.bronnen}>
            Bronnen: <a href="https://data.austintexas.gov/d/gsvs-ypi7">Outcomes</a>
            {' en '}
            <a href="https://data.austintexas.gov/d/pyqf-r2dc">Intakes</a>
          </p>
          <Link className="knop" href="/pootjes-in-cijfers">Bekijk alle cijfers</Link>
        </div>
      </div>
    </section>
  );
}

export function SpeelEnOntdek() {
  return (
    <section className="recent" aria-labelledby="speel-en-ontdek">
      <header className={`sectiekop ${stijl.speelkop}`}>
        <h2 id="speel-en-ontdek">Speel &amp; ontdek <Bloem /></h2>
        <p>Voor nieuwsgierige snuffelaars en slimme viervoeters!</p>
      </header>
      <ul className={stijl.speelkaarten}>
        {speelkaarten.map(({ titel, tekst, knop, href, beeld }) => (
          <li key={href} className={stijl.speelkaart}>
            <Image src={beeld} alt="" sizes="(max-width: 580px) 95vw, (max-width: 900px) 46vw, (max-width: 1288px) 32vw, 400px" />
            <div>
              <h3>{titel}</h3>
              <p>{tekst}</p>
              <Link className="knop" href={href}>{knop}</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
