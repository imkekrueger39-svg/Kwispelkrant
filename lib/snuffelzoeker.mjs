export const themas = {
  Hondenrassen: ['LABRADOR', 'POEDEL', 'HERDER', 'TECKEL', 'BEAGLE', 'WHIPPET', 'HUSKY', 'BOXER'],
  Hondenweetjes: ['NEUS', 'GEHOOR', 'SNUFFELEN', 'KWISPELEN', 'PUPPY', 'VACHT', 'TANDEN', 'DROMEN'],
  Hondenleven: ['WANDELEN', 'SPELEN', 'SLAPEN', 'SNACKEN', 'RIEM', 'MAND', 'BAL', 'WATER'],
};

export const niveaus = {
  puppy: { label: 'Puppy (makkelijk)', maat: 10, richtingen: [[0, 1], [1, 0], [1, 1], [1, -1]] },
  speurneus: { label: 'Speurneus (gemiddeld)', maat: 13, richtingen: [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0]] },
  topdog: { label: 'Topdog (moeilijk)', maat: 16, richtingen: [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]] },
};

export const randen = { krant: 'Krantensierlijn', bloemen: 'Retro bloemen', pootjes: 'Pootjesspoor' };
export const markeerkleuren = ['#FD9BB7', '#D8973C', '#F3E6BD', '#edb1ac', '#efbd78', '#ffc5d3'];
const alfabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function normaliseerWoorden(invoer) {
  const regels = invoer.split(/\r?\n/).map((regel) => regel.trim()).filter(Boolean);
  if (!regels.length || regels.length > 14) throw new Error('Vul 1 tot 14 woorden in, één woord per regel.');

  const woorden = new Set();
  for (const regel of regels) {
    const tekst = regel.replace(/Ĳ/g, 'IJ').replace(/ĳ/g, 'ij').normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/gu, '');
    if (!/^[a-z]+$/i.test(tekst)) throw new Error(`Gebruik alleen letters en spaties in ‘${regel}’. Haal cijfers en leestekens weg.`);
    const woord = tekst.toUpperCase();
    if (woord.length < 2 || woord.length > 18) throw new Error(`‘${regel}’ moet na verwerking 2 tot 18 letters lang zijn.`);
    if (woorden.has(woord)) throw new Error(`‘${regel}’ komt dubbel voor na verwerking. Verwijder één versie.`);
    woorden.add(woord);
  }

  return [...woorden];
}

export function lijnTussen(start, einde, maat) {
  const rij = Math.floor(start / maat);
  const kolom = start % maat;
  const dr = Math.floor(einde / maat) - rij;
  const dk = einde % maat - kolom;
  if (dr && dk && Math.abs(dr) !== Math.abs(dk)) return [];
  return Array.from({ length: Math.max(Math.abs(dr), Math.abs(dk)) + 1 }, (_, i) =>
    (rij + i * Math.sign(dr)) * maat + kolom + i * Math.sign(dk));
}

export function maakPuzzel(woorden, niveau, willekeurig = Math.random) {
  const { maat, richtingen } = niveaus[niveau];
  const geordend = [...woorden].sort((a, b) => b.length - a.length);
  const minimum = Math.max(maat, geordend[0]?.length ?? 0);
  for (let grootte = minimum; grootte <= Math.min(18, minimum + 2); grootte++) {
    for (let poging = 0; poging < 12; poging++) {
      const letters = Array(grootte * grootte).fill('');
      const oplossingen = new Map();

      for (const woord of geordend) {
        let keuze;
        let besteScore = -Infinity;
        for (let start = 0; start < letters.length; start++) {
          const rij = Math.floor(start / grootte);
          const kolom = start % grootte;
          for (const [dr, dk] of richtingen) {
            const eindRij = rij + dr * (woord.length - 1);
            const eindKolom = kolom + dk * (woord.length - 1);
            if (eindRij < 0 || eindRij >= grootte || eindKolom < 0 || eindKolom >= grootte) continue;
            const posities = lijnTussen(start, eindRij * grootte + eindKolom, grootte);
            if (!posities.every((positie, i) => !letters[positie] || letters[positie] === woord[i])) continue;
            const overlap = posities.filter((positie) => letters[positie]).length;
            const score = overlap * .3 + willekeurig();
            if (score > besteScore) {
              besteScore = score;
              keuze = { posities, richting: [dr, dk] };
            }
          }
        }
        if (!keuze) break;
        keuze.posities.forEach((positie, i) => { letters[positie] = woord[i]; });
        oplossingen.set(woord, { woord, ...keuze });
      }

      if (oplossingen.size === woorden.length) {
        return {
          grootte,
          letters: letters.map((letter) => letter || alfabet[Math.floor(willekeurig() * alfabet.length)]),
          woorden: woorden.map((woord) => oplossingen.get(woord)),
        };
      }
    }
  }
  throw new Error('Niet alle woorden passen samen. Kies Topdog of gebruik minder lange woorden en probeer opnieuw.');
}
