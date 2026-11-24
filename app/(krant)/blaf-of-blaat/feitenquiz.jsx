'use client';

import { Check, PawPrint, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import stijl from './blaf.module.css';

const stellingen = [
  {
    tekst: 'Een natte neus betekent altijd dat een hond gezond is.',
    antwoord: 'Fabel',
    uitleg: 'Een natte neus kan normaal zijn, maar zegt op zichzelf niet genoeg over de gezondheid van een hond.',
  },
  {
    tekst: 'Honden kunnen menselijke emoties vaak goed aanvoelen.',
    antwoord: 'Feit',
    uitleg: 'Honden reageren vaak op lichaamstaal, stem en gezichtsuitdrukking van mensen.',
  },
  {
    tekst: 'Elke hond is automatisch goed met kinderen.',
    antwoord: 'Fabel',
    uitleg: 'Dat hangt af van karakter, opvoeding, socialisatie en de situatie.',
  },
  {
    tekst: 'Vuurwerk kan bij honden stress en angst veroorzaken.',
    antwoord: 'Feit',
    uitleg: 'Veel honden reageren gevoelig op harde knallen, trillingen en lichtflitsen.',
  },
  {
    tekst: 'Een kwispelende staart betekent altijd dat een hond blij is.',
    antwoord: 'Fabel',
    uitleg: 'Ook spanning, onzekerheid of alertheid kunnen gepaard gaan met kwispelen.',
  },
  {
    tekst: 'Chippen helpt om verloren honden sneller terug thuis te krijgen.',
    antwoord: 'Feit',
    uitleg: 'Een chip maakt identificatie mogelijk als de gegevens correct geregistreerd zijn.',
  },
  {
    tekst: 'Honden zien alleen zwart-wit.',
    antwoord: 'Fabel',
    uitleg: 'Honden zien wel kleuren, maar minder uitgebreid dan mensen.',
  },
  {
    tekst: 'Snuffelen is belangrijk voor het welzijn van een hond.',
    antwoord: 'Feit',
    uitleg: 'Snuffelen geeft mentale stimulatie en helpt honden hun omgeving te verkennen.',
  },
];

function resultaat(score) {
  if (score <= 3) return 'Pootjes in de leer';
  if (score <= 6) return 'Slimme snuffelaar';
  return 'Topkwispelaar';
}

export default function Feitenquiz() {
  const [stap, setStap] = useState(0);
  const [antwoorden, setAntwoorden] = useState([]);
  const kop = useRef(null);
  const focusVerplaatsen = useRef(false);
  const stelling = stellingen[stap];
  const keuze = antwoorden[stap];

  useEffect(() => {
    if (focusVerplaatsen.current) {
      kop.current?.focus();
      focusVerplaatsen.current = false;
    }
  }, [stap]);

  function gaNaar(nummer) {
    focusVerplaatsen.current = true;
    setStap(nummer);
  }

  if (!stelling) {
    const score = stellingen.filter(({ antwoord }, index) => antwoorden[index] === antwoord).length;
    return (
      <section className={`${stijl.kaart} ${stijl.resultaat}`} aria-labelledby="blaf-stap">
        <PawPrint className={stijl.resultaatpoot} size={36} aria-hidden="true" />
        <p className={stijl.voortgang}>Jouw score</p>
        <h2 id="blaf-stap" ref={kop} tabIndex={-1}>{resultaat(score)}</h2>
        <p className={stijl.score}>{score} van {stellingen.length} juist</p>
        <button type="button" className={stijl.verder} onClick={() => { setAntwoorden([]); gaNaar(0); }}>Speel opnieuw</button>
      </section>
    );
  }

  const juist = keuze === stelling.antwoord;

  return (
    <section className={stijl.kaart} aria-labelledby="blaf-stap">
      <p className={stijl.voortgang}>Stelling {stap + 1} van {stellingen.length}</p>
      <h2 id="blaf-stap" ref={kop} tabIndex={-1}>{stelling.tekst}</h2>
      <div className={stijl.keuzes}>
        {['Feit', 'Fabel'].map((antwoord) => {
          const Icoon = antwoord === 'Feit' ? Check : X;
          return (
            <button
              key={antwoord}
              type="button"
              aria-disabled={Boolean(keuze)}
              aria-pressed={keuze === antwoord}
              onClick={() => setAntwoorden((vorige) => vorige[stap] ? vorige : [...vorige, antwoord])}
            >
              <Icoon size={20} aria-hidden="true" /> {antwoord}
            </button>
          );
        })}
      </div>
      <div role="status" aria-atomic="true">
        {keuze && <div className={stijl.feedback} data-juist={juist}>
          <strong>{juist ? 'Juist!' : 'Fout.'} Het antwoord is {stelling.antwoord.toLowerCase()}.</strong>
          <p>{stelling.uitleg}</p>
        </div>}
      </div>
      {keuze && <button type="button" className={stijl.verder} onClick={() => gaNaar(stap + 1)}>
        {stap + 1 === stellingen.length ? 'Bekijk je score' : 'Volgende stelling'}
      </button>}
    </section>
  );
}
