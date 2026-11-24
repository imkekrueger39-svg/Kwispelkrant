'use client';

import { PawPrint, Stamp } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { lijnTussen, maakPuzzel, markeerkleuren, niveaus, normaliseerWoorden, randen, themas } from '../../../lib/snuffelzoeker.mjs';
import stijl from './snuffelzoeker.module.css';

const tabs = ['Speel een puzzel', 'Maak je eigen puzzel'];
const standaardThema = 'Hondenrassen';

function eerstePuzzel() {
  let seed = 4067;
  return maakPuzzel(themas[standaardThema], 'speurneus', () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  });
}

function Raster({ puzzel, onKies, onWijs, begin, aanwijzer, markeringen }) {
  const [focus, setFocus] = useState(0);
  const toetsen = useRef([]);
  const { grootte, letters } = puzzel;
  const selectie = begin !== null && aanwijzer !== null ? lijnTussen(begin, aanwijzer, grootte) : [];

  function stuurFocus(event, positie) {
    const kolom = positie % grootte;
    let volgende = positie;

    switch (event.key) {
      case 'ArrowLeft': volgende -= Number(kolom > 0); break;
      case 'ArrowRight': volgende += Number(kolom < grootte - 1); break;
      case 'ArrowUp': volgende -= grootte; break;
      case 'ArrowDown': volgende += grootte; break;
      case 'Home': volgende -= kolom; break;
      case 'End': volgende += grootte - kolom - 1; break;
      case 'Escape': onKies(null); return;
      default: return;
    }

    event.preventDefault();
    toetsen.current[volgende]?.focus();
  }

  const inhoud = (positie) => {
    if (!onKies) return <span key={positie}>{letters[positie]}</span>;
    const gekozen = begin === positie || selectie.includes(positie);
    const kleur = markeringen.get(positie);

    return (
      <div key={positie} role="gridcell">
        <button
          type="button"
          ref={(element) => { toetsen.current[positie] = element; }}
          tabIndex={focus === positie ? 0 : -1}
          aria-label={`${letters[positie]}, rij ${Math.floor(positie / grootte) + 1}, kolom ${positie % grootte + 1}${kleur ? ', gevonden' : ''}`}
          aria-pressed={gekozen}
          data-begin={begin === positie || undefined}
          style={{ '--markering': kleur }}
          onFocus={() => { setFocus(positie); onWijs(positie); }}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') onWijs(positie); }}
          onKeyDown={(event) => stuurFocus(event, positie)}
          onClick={() => onKies(positie)}
        >
          {letters[positie]}
        </button>
      </div>
    );
  };

  const rows = Array.from({ length: grootte }, (_, rij) => (
    <div key={rij} className={stijl.rij} role={onKies ? 'row' : undefined}>
      {Array.from({ length: grootte }, (_, kolom) => inhoud(rij * grootte + kolom))}
    </div>
  ));

  return (
    <div className={stijl.raster} role={onKies ? 'grid' : undefined} aria-label={onKies ? 'Woordzoeker' : undefined}
      style={{ '--kolommen': grootte }}>
      {rows}
    </div>
  );
}

function Spel() {
  const [thema, setThema] = useState(standaardThema);
  const [puzzel, setPuzzel] = useState(eerstePuzzel);
  const [gevonden, setGevonden] = useState([]);
  const [begin, setBegin] = useState(null);
  const [einde, setEinde] = useState(null);
  const [melding, setMelding] = useState('');
  const [versie, setVersie] = useState(0);
  const klaar = gevonden.length === puzzel.woorden.length;
  const markeringen = new Map();
  gevonden.forEach(({ lijn }, i) => lijn.forEach((positie) => markeringen.set(positie, markeerkleuren[i % markeerkleuren.length])));

  function nieuwePuzzel(naam) {
    setThema(naam);
    setPuzzel(maakPuzzel(themas[naam], 'speurneus'));
    setGevonden([]);
    setBegin(null);
    setEinde(null);
    setMelding('Nieuwe puzzel klaar.');
    setVersie((vorige) => vorige + 1);
  }

  function kies(positie) {
    if (positie === null || positie === begin) {
      setBegin(null);
      setEinde(null);
      setMelding('Selectie gewist.');
      return;
    }

    if (begin === null) {
      setBegin(positie);
      setEinde(null);
      setMelding(`Beginletter ${puzzel.letters[positie]} gekozen. Kies de eindletter.`);
      return;
    }

    const lijn = lijnTussen(begin, positie, puzzel.grootte);
    const tekst = lijn.map((plek) => puzzel.letters[plek]).join('');
    const omgekeerd = [...tekst].reverse().join('');
    const match = puzzel.woorden.find(({ woord }) => woord === tekst || woord === omgekeerd);
    setBegin(null);
    setEinde(null);

    if (!match) {
      setMelding('Geen woord uit de lijst. Kies een nieuwe beginletter.');
    } else if (gevonden.some(({ woord }) => woord === match.woord)) {
      setMelding(`${match.woord} had je al gevonden.`);
    } else {
      setGevonden((vorige) => [...vorige, { woord: match.woord, lijn }]);
      setMelding(`${match.woord} gevonden! ${gevonden.length + 1} van ${puzzel.woorden.length} woorden.`);
    }
  }

  return (
    <div className={stijl.spel}>
      <div>
        <div className={stijl.thema}>
          <label>Thema
            <select value={thema} onChange={(event) => nieuwePuzzel(event.target.value)}>
              {Object.keys(themas).map((naam) => <option key={naam}>{naam}</option>)}
            </select>
          </label>
          <button className={stijl.knop} type="button" onClick={() => nieuwePuzzel(thema)}>Nieuwe puzzel</button>
        </div>
        <p className={stijl.hulp}>Klik of tik op de eerste en laatste letter. Met het toetsenbord gebruik je de pijltjestoetsen en Enter of Spatie. Escape wist je selectie.</p>
        <Raster key={versie} puzzel={puzzel} onKies={kies} onWijs={setEinde} begin={begin} aanwijzer={einde} markeringen={markeringen} />
        <p className={stijl.hulp} role="status">{melding}</p>
      </div>
      <aside className={stijl.woordenPaneel}>
        <div className={stijl.woordkop}>
          <h2>Te vinden woorden</h2>
          <div key={gevonden.length} className={gevonden.length ? stijl.blij : undefined}>
            <Image src="/brand/lily-lio-quiz.png" alt="" width={1448} height={1086} sizes="72px" />
            {gevonden.length > 0 && <span aria-hidden="true">♥</span>}
          </div>
        </div>
        <div className={stijl.voortgang} role="progressbar" aria-label="Gevonden woorden" aria-valuenow={gevonden.length} aria-valuemax={puzzel.woorden.length}>
          {puzzel.woorden.map(({ woord }, i) => <PawPrint key={woord} size={16} data-gevuld={i < gevonden.length} aria-hidden="true" />)}
        </div>
        <p className={stijl.hulp}>{gevonden.length} van {puzzel.woorden.length} gevonden</p>
        <ul className={stijl.woorden}>
          {puzzel.woorden.map(({ woord }) => {
            const i = gevonden.findIndex((item) => item.woord === woord);
            return <li key={woord} data-gevonden={i >= 0} style={{ '--markering': markeerkleuren[i % markeerkleuren.length] }}>
              {woord}{i >= 0 && <span aria-label=" gevonden"> ✓</span>}
            </li>;
          })}
        </ul>
        {klaar && <p className={stijl.kampioen} role="status"><Stamp size={25} aria-hidden="true" /> Officieel Snuffelkampioen!</p>}
      </aside>
    </div>
  );
}

function Maker() {
  const [puzzel, setPuzzel] = useState(null);
  const [fout, setFout] = useState('');
  const [exportFout, setExportFout] = useState('');
  const [bezig, setBezig] = useState(false);
  const [bestand, setBestand] = useState(null);
  const voorbeeld = useRef(null);

  useEffect(() => {
    if (bestand) return () => URL.revokeObjectURL(bestand.url);
  }, [bestand]);

  function genereer(event) {
    event.preventDefault();
    const lees = (veld) => event.currentTarget.elements.namedItem(`snuffel-${veld}`).value;

    try {
      const woorden = normaliseerWoorden(lees('woorden'));
      const titel = lees('titel').trim() || 'Mijn Snuffelzoeker';
      const boodschap = lees('boodschap').trim();
      const resultaat = maakPuzzel(woorden, lees('niveau'));
      setPuzzel({ ...resultaat, titel, boodschap, rand: lees('rand') });
      setFout('');
      setBestand(null);
      setExportFout('');
      requestAnimationFrame(() => voorbeeld.current?.focus());
    } catch (error) {
      setFout(error.message);
    }
  }

  async function download(soort) {
    setBezig(true);
    setExportFout('');
    setBestand(null);

    try {
      const { exporteerPuzzel } = await import('./puzzel-export');
      const { blob, naam } = await exporteerPuzzel(puzzel, soort);
      const url = URL.createObjectURL(blob);
      setBestand({ url, naam });
      const link = document.createElement('a');
      link.href = url;
      link.download = naam;
      document.body.append(link);
      link.click();
      link.remove();
    } catch {
      setExportFout('Het bestand kon niet worden gemaakt. Probeer de download opnieuw.');
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className={stijl.maker}>
      <form className={stijl.formulier} onSubmit={genereer}>
        <label>Titel van de woordzoeker
          <input id="snuffel-titel" maxLength={64} placeholder="Mijn Snuffelzoeker" />
        </label>
        <label>Eigen woorden, één per regel
          <textarea id="snuffel-woorden" rows={6} required maxLength={650} aria-describedby="snuffel-woordhulp" />
        </label>
        <p id="snuffel-woordhulp" className={stijl.hulp}>Vul 1 tot 14 woorden in, met 2 tot 18 letters per woord. Spaties en accenten gaan weg en Ĳ wordt IJ. ‘Café hond’ wordt bijvoorbeeld CAFEHOND.</p>
        <label>Moeilijkheidsgraad
          <select id="snuffel-niveau" defaultValue="speurneus">
            {Object.entries(niveaus).map(([id, { label }]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        <label>Persoonlijke boodschap (optioneel)
          <input id="snuffel-boodschap" maxLength={150} />
        </label>
        <label>Decoratieve rand
          <select id="snuffel-rand">
            {Object.entries(randen).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        {fout && <p className={stijl.fout} role="alert">{fout}</p>}
        <button className={stijl.knop} type="submit" disabled={bezig}>Genereer mijn puzzel</button>
      </form>
      {puzzel && (
        <section className={stijl.voorbeeld} data-rand={puzzel.rand} aria-labelledby="snuffel-voorbeeld">
          <h2 id="snuffel-voorbeeld" tabIndex={-1} ref={voorbeeld}>{puzzel.titel}</h2>
          {puzzel.boodschap && <p>{puzzel.boodschap}</p>}
          <Raster puzzel={puzzel} begin={null} aanwijzer={null} />
          <ul className={stijl.woorden}>{puzzel.woorden.map(({ woord }) => <li key={woord}>{woord}</li>)}</ul>
          <div className={stijl.downloads}>
            <button className={stijl.knop} type="button" disabled={bezig} onClick={() => download('pdf')}>Download als PDF</button>
            <button className={stijl.knop} type="button" disabled={bezig} onClick={() => download('png')}>Download als PNG</button>
            <button className={stijl.knop} type="button" disabled={bezig} onClick={() => download('antwoorden')}>Download antwoordenblad</button>
          </div>
          <p className={stijl.hulp} role="status">{bezig ? 'Bestand wordt gemaakt…' : bestand && 'Je bestand is klaar.'}</p>
          {bestand && <a href={bestand.url} download={bestand.naam}>Download opnieuw</a>}
          {exportFout && <p role="alert" className={stijl.fout}>{exportFout}</p>}
        </section>
      )}
    </div>
  );
}

export default function Snuffelzoeker() {
  const [actief, setActief] = useState(0);
  const tabknoppen = useRef([]);

  return (
    <div className={stijl.dossier}>
      <div className={stijl.tabs} role="tablist" aria-label="De Snuffelzoeker">
        {tabs.map((tab, i) => (
          <button type="button" key={tab} role="tab" id={`snuffel-tab-${i}`} aria-controls={`snuffel-paneel-${i}`}
            aria-selected={actief === i} tabIndex={actief === i ? 0 : -1}
            ref={(node) => { tabknoppen.current[i] = node; }} onClick={() => setActief(i)}
            onKeyDown={(event) => {
              const volgende = { ArrowLeft: 1 - i, ArrowRight: 1 - i, Home: 0, End: 1 }[event.key];
              if (volgende === undefined) return;
              event.preventDefault();
              setActief(volgende);
              tabknoppen.current[volgende]?.focus();
            }}>
            {tab}
          </button>
        ))}
      </div>
      <section role="tabpanel" id="snuffel-paneel-0" aria-labelledby="snuffel-tab-0" hidden={actief !== 0}><Spel /></section>
      <section role="tabpanel" id="snuffel-paneel-1" aria-labelledby="snuffel-tab-1" hidden={actief !== 1}><Maker /></section>
      <p className={stijl.hulp}>Je puzzel en persoonlijke boodschap blijven in je browser.</p>
    </div>
  );
}
