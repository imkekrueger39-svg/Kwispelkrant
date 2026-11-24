import { connection } from 'next/server';
import { austinVerversing, leesAustin } from '../../../lib/austin-pootjes-cache';
import { Bloem } from '../onderdelen';
import Pootjesgrafiek from './pootjesgrafiek';
import stijl from './pootjes.module.css';

export const metadata = { title: 'Pootjes in cijfers' };
const datumformaat = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long', timeZone: 'UTC' });
const ophaalformaat = new Intl.DateTimeFormat('nl-BE', {
  dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Chicago',
});

export default async function PootjesInCijfers() {
  await connection();

  let resultaat;
  try {
    resultaat = await leesAustin();
  } catch (fout) {
    console.warn('[Pootjes in cijfers]', fout.message);
  }

  const { data = [], opgehaaldOp } = resultaat ?? {};
  const recentsteDag = data.at(-1)?.date;
  const mogelijkVerouderd = opgehaaldOp && Date.now() - Date.parse(opgehaaldOp) >= austinVerversing * 1000;
  return (
    <div className={stijl.pagina}>
      <header className={stijl.hero}>
        <div>
          <h1>Pootjes in cijfers <Bloem /></h1>
          <p>Van eerste opvang tot adoptie. Volg het dagelijkse spoor van honden die een veilige plek of een nieuw thuis vinden.</p>
        </div>
        <p className={stijl.voorbeeld}>
          <strong>Austin Animal Center</strong><br />Texas, Verenigde Staten
          {data.length > 0 && <><br />{datumformaat.formatRange(Date.parse(data[0].date), Date.parse(data.at(-1).date))}</>}
        </p>
      </header>
      <Pootjesgrafiek data={data} />
      <section className={stijl.duiding} aria-labelledby="austin-bronnen">
        <h2 id="austin-bronnen">Bronnen</h2>
        <p>
          <a href="https://data.austintexas.gov/d/gsvs-ypi7">Outcomes (adopties)</a>
          {' · '}
          <a href="https://data.austintexas.gov/d/pyqf-r2dc">Intakes (zwerfdieropnames)</a>
        </p>
        {opgehaaldOp && <p>Laatst opgehaald op <time dateTime={opgehaaldOp}>{ophaalformaat.format(new Date(opgehaaldOp))}</time> (lokale tijd in Austin).</p>}
        {recentsteDag && <p>Recentste registratiedag in de gedeelde periode: <time dateTime={recentsteDag}>{datumformaat.format(Date.parse(recentsteDag))}</time>.</p>}
        {mogelijkVerouderd && <p role="status"><strong>Mogelijk verouderde cijfers.</strong> De laatste geslaagde ophaling was minstens 24 uur geleden.</p>}
      </section>
    </div>
  );
}
