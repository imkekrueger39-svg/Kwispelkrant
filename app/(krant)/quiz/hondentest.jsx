'use client';

import { useEffect, useRef, useState } from 'react';
import stijl from './quiz.module.css';

const vragen = [
  {
    vraag: 'Hoe ziet jouw ideale weekend eruit?',
    opties: ['Lange wandelingen en buiten zijn', 'Knus thuis met dekentje en snacks', 'Op pad, veel mensen en nieuwe indrukken'],
  },
  {
    vraag: 'Hoeveel tijd heb je voor beweging?',
    opties: ['Veel, ik ben graag actief', 'Een paar rustige rondjes per dag', 'Gemiddeld, liefst afwisselend'],
  },
  {
    vraag: 'Wat past het best bij jouw persoonlijkheid?',
    opties: ['Sportief en avontuurlijk', 'Rustig en zorgzaam', 'Sociaal en nieuwsgierig'],
  },
  {
    vraag: 'Wat zoek je in een hond?',
    opties: ['Een energieke buddy', 'Een zachte knuffelvriend', 'Een slimme allemansvriend'],
  },
];

const profielen = [
  { letter: 'A', rassen: 'Duitse herder of bordercollie' },
  { letter: 'B', rassen: 'Maltezer of cavalier king charles-spaniël' },
  { letter: 'C', rassen: 'Labrador of cockapoo' },
];

export default function Hondentest() {
  const [stap, setStap] = useState(0);
  const [antwoorden, setAntwoorden] = useState([]);
  const kop = useRef(null);
  const verplaatsFocus = useRef(false);
  const huidigeVraag = vragen[stap];

  useEffect(() => {
    if (verplaatsFocus.current) {
      kop.current?.focus();
      verplaatsFocus.current = false;
    }
  }, [stap]);

  function gaNaar(stapnummer) {
    verplaatsFocus.current = true;
    setStap(stapnummer);
  }

  function kies(letter) {
    setAntwoorden((vorige) => {
      const bijgewerkt = [...vorige];
      bijgewerkt[stap] = letter;
      return bijgewerkt;
    });
  }

  function volgende(event) {
    event.preventDefault();
    if (antwoorden[stap]) gaNaar(stap + 1);
  }

  function opnieuw() {
    setAntwoorden([]);
    gaNaar(0);
  }

  if (!huidigeVraag) {
    const scores = profielen.map((profiel) => ({
      ...profiel,
      score: antwoorden.filter((antwoord) => antwoord === profiel.letter).length,
    }));
    const hoogsteScore = Math.max(...scores.map(({ score }) => score));
    const winnaars = scores.filter(({ score }) => score === hoogsteScore);

    return (
      <section className={stijl.kaart} aria-labelledby="quiz-stap">
        <h2 id="quiz-stap" ref={kop} tabIndex={-1}>
          {winnaars.length === 1 ? 'Jouw hondenmatch' : 'Jouw gedeelde hondenmatch'}
        </h2>
        {winnaars.length > 1 && <p>Deze profielen kregen evenveel punten. Ze passen volgens jouw antwoorden allebei bij jou.</p>}
        <ul className={stijl.uitslagen}>
          {winnaars.map(({ letter, rassen }) => (
            <li key={letter}>
              <span className={stijl.letter}>{letter}</span>
              <strong>{rassen}</strong>
            </li>
          ))}
        </ul>
        <button className={stijl.knop} type="button" onClick={opnieuw}>Begin opnieuw</button>
      </section>
    );
  }

  return (
    <form className={stijl.kaart} onSubmit={volgende}>
      <p className={stijl.voortgang}>Vraag {stap + 1} van {vragen.length}</p>
      <h2 id="quiz-stap" ref={kop} tabIndex={-1}>{huidigeVraag.vraag}</h2>
      <fieldset key={stap} className={stijl.opties} aria-labelledby="quiz-stap">
        {huidigeVraag.opties.map((optie, index) => {
          const { letter } = profielen[index];
          return (
            <label key={letter} className={stijl.optie}>
              <input
                type="radio"
                name={`vraag-${stap + 1}`}
                value={letter}
                checked={antwoorden[stap] === letter}
                onChange={() => kies(letter)}
                required
              />
              <span className={stijl.letter}>{letter}</span>
              <span>{optie}</span>
            </label>
          );
        })}
      </fieldset>
      <div className={stijl.acties}>
        {stap > 0 && <button className={stijl.terug} type="button" onClick={() => gaNaar(stap - 1)}>Vorige vraag</button>}
        <button className={stijl.knop} type="submit">
          {stap === vragen.length - 1 ? 'Bekijk jouw uitslag' : 'Volgende vraag'}
        </button>
      </div>
    </form>
  );
}
