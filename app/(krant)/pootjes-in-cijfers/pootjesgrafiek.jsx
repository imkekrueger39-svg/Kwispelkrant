'use client';

import Image from 'next/image';
import { useState } from 'react';
import stijl from './pootjes.module.css';

const periodes = [
  { waarde: '7', label: 'Laatste 7 dagen' },
  { waarde: '30', label: 'Laatste 30 dagen' },
  { waarde: 'alles', label: 'Alles' },
];

const reeksen = [
  { waarde: 'beide', label: 'Beide' },
  { waarde: 'adopted', label: 'Alleen adopties' },
  { waarde: 'rescued', label: 'Alleen zwerfdieropnames' },
];

const datumKort = new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const datumLang = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long', timeZone: 'UTC' });
const dagInMs = 86_400_000;
const exactAantal = (aantal) => aantal === null ? 'Geen gegevens' : aantal;

function Keuzegroep({ label, opties, waarde, kies }) {
  return (
    <fieldset className={stijl.keuzegroep}>
      <legend>{label}</legend>
      <div>
        {opties.map((optie) => (
          <label key={optie.waarde}>
            <input type="radio" name={label} value={optie.waarde} checked={waarde === optie.waarde} onChange={() => kies(optie.waarde)} />
            <span>{optie.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Poot({ contour = false, schaal = 1 }) {
  return (
    <span className={`${stijl.poot} ${contour ? stijl.contour : ''}`} style={{ '--pootgrootte': schaal }} aria-hidden="true">
      <i /><i /><i /><i /><i />
    </span>
  );
}

export default function Pootjesgrafiek({ data }) {
  const [periode, setPeriode] = useState('7');
  const [reeks, setReeks] = useState('beide');
  const [aanwijzer, setAanwijzer] = useState(null);
  const [focus, setFocus] = useState(null);
  const [gekozen, setGekozen] = useState(null);
  const laatsteDag = Date.parse(data.at(-1)?.date);
  const zichtbaar = data.filter(({ date }) => periode === 'alles' || Date.parse(date) > laatsteDag - Number(periode) * dagInMs);
  const gegevensOntbreken = zichtbaar.some(({ adopted, rescued }) =>
    (reeks !== 'rescued' && adopted === null) || (reeks !== 'adopted' && rescued === null)
  );
  const maximum = Math.max(1, ...data.flatMap(({ adopted, rescued }) => [adopted, rescued]));
  const actief = aanwijzer ?? focus ?? gekozen;
  const schaal = (aantal) => Math.sqrt(aantal / maximum);

  function wijzigFilter(wijzig, waarde) {
    wijzig(waarde);
    setAanwijzer(null);
    setFocus(null);
    setGekozen(null);
  }

  return (
    <>
      <section className={stijl.grafiek} aria-labelledby="grafiekkop">
        <div className={stijl.grafiekkop}>
          <div>
            <h2 id="grafiekkop">Het dagelijkse spoor</h2>
            <p>Volg de afdrukken van dag tot dag. Een grotere poot staat voor meer honden.</p>
          </div>
          <div className={stijl.mascotte} data-actief={Boolean(actief)}>
            <Image src="/brand/lily-lio-quiz.png" alt="" width={1448} height={1086} sizes="112px" />
            <span aria-hidden="true">♥</span>
          </div>
        </div>
        <div className={stijl.filters}>
          <Keuzegroep label="Periode" opties={periodes} waarde={periode} kies={(waarde) => wijzigFilter(setPeriode, waarde)} />
          <Keuzegroep label="Toon" opties={reeksen} waarde={reeks} kies={(waarde) => wijzigFilter(setReeks, waarde)} />
        </div>
        <div className={stijl.sleutel}>
          <ul className={stijl.legenda} aria-label="Legenda">
            <li><Poot /> Adopties</li>
            <li><Poot contour /> Zwerfdieropnames</li>
          </ul>
          <p aria-live="polite">{zichtbaar.length ? `${datumKort.format(Date.parse(zichtbaar[0].date))} – ${datumLang.format(laatsteDag)}` : 'Geen dagen beschikbaar'}</p>
        </div>
        {!data.length ? <p className={stijl.bediening} role="status">De gegevens van Austin Animal Center zijn tijdelijk niet beschikbaar.</p> : (
          <>
            {gegevensOntbreken && <p className={stijl.bediening}>Geen gegevens op sommige dagen in deze selectie.</p>}
            <p className={stijl.bediening}>Wijs een dag aan, tik erop of ga erheen met Tab voor de exacte aantallen.</p>
            <ul className={stijl.spoor}>
              {zichtbaar.map(({ date, adopted, rescued }) => {
                const tijd = Date.parse(date);
                const datum = datumLang.format(tijd);
                const open = actief === date;
                return (
                  <li key={date} className={stijl.dag} data-open={open}
                    onPointerEnter={(event) => { if (event.pointerType === 'mouse') setAanwijzer(date); }}
                    onPointerLeave={() => setAanwijzer(null)}>
                    <button type="button" aria-label={`${datum}, adopties: ${exactAantal(adopted)}, zwerfdieropnames: ${exactAantal(rescued)}`}
                      aria-pressed={gekozen === date}
                      onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) setFocus(date); }}
                      onBlur={() => setFocus(null)}
                      onClick={() => setGekozen(gekozen === date ? null : date)}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          setAanwijzer(null);
                          setFocus(null);
                          setGekozen(null);
                        }
                      }}>
                      <span className={stijl.afdrukken} aria-hidden="true">
                        {reeks !== 'rescued' && (adopted ? <Poot schaal={schaal(adopted)} /> : <span>{adopted ?? '?'}</span>)}
                        {reeks !== 'adopted' && (rescued ? <Poot contour schaal={schaal(rescued)} /> : <span>{rescued ?? '?'}</span>)}
                      </span>
                      <time dateTime={date}>{datumKort.format(tijd)}</time>
                    </button>
                    {open && <div className={stijl.tooltip} aria-hidden="true">
                      <strong>{datum}</strong>
                      <span>Adopties <b>{exactAantal(adopted)}</b></span>
                      <span>Zwerfdieropnames <b>{exactAantal(rescued)}</b></span>
                    </div>}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
      <section className={stijl.duiding} aria-labelledby="duidingkop">
        <h2 id="duidingkop">Wat lees je hier?</h2>
        <p>Deze cijfers tellen geregistreerde gebeurtenissen bij Austin Animal Center. Een zwerfdieropname betekent dat het asiel de hond als zwerfdier registreerde. Daaruit kun je niet afleiden dat de hond is gered. Dezelfde hond kan meer dan één keer voorkomen.</p>
        <p>De grafiek gebruikt de lokale gebeurtenisdatum in Austin (America/Chicago). We tonen de gedeelde periode na de overstap naar ShelterBuddy op 5 mei 2025 en laten de lopende dag weg. Nul betekent dat de bron die dag wel registraties had, maar geen voor deze reeks. Een vraagteken betekent dat de bron voor die dag geen registraties ter beschikking stelde. Recente cijfers kunnen nog wijzigen.</p>
        {data.length > 0 && <details className={stijl.tabel}>
          <summary>Bekijk de dagcijfers als tabel</summary>
          <table>
            <caption>Austin Animal Center · dagcijfers voor de gekozen periode</caption>
            <thead><tr><th scope="col">Datum</th><th scope="col">Adopties</th><th scope="col">Zwerfdieropnames</th></tr></thead>
            <tbody>
              {zichtbaar.map(({ date, adopted, rescued }) => (
                <tr key={date}>
                  <th scope="row"><time dateTime={date}>{datumLang.format(Date.parse(date))}</time></th>
                  <td>{exactAantal(adopted)}</td><td>{exactAantal(rescued)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>}
      </section>
    </>
  );
}
