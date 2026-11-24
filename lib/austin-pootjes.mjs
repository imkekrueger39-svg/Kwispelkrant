const bronnen = [
  {
    id: 'gsvs-ypi7',
    naam: 'Outcomes',
    datumveld: 'outcome_date',
    categorie: "outcome_status in ('Adopted','Adopted Altered','Adopted Unaltered','Adopted Offsite','Adopted Offsite(Altered)','Adopted Offsite(Unaltered)')",
  },
  { id: 'pyqf-r2dc', naam: 'Intakes', datumveld: 'source_date', categorie: "source_name = 'Stray'" },
];

// De stad startte ShelterBuddy op 5 mei 2025. Begin na die overgangsdag.
const eersteDag = '2025-05-06';
const dagInMs = 86_400_000;
const austinDag = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Chicago' });

async function zoek(bron, params, fetchFeed) {
  const url = new URL(`https://data.austintexas.gov/resource/${bron.id}.json`);
  url.search = new URLSearchParams(params).toString();
  const antwoord = await fetchFeed(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
    cache: 'no-store',
  });
  if (!antwoord.ok) throw new Error(`${bron.naam}: HTTP ${antwoord.status}`);
  const rijen = await antwoord.json();
  if (!Array.isArray(rijen)) throw new Error(`${bron.naam}: onverwachte API-respons`);
  return rijen;
}

function venster(datumveld, vanaf, tot) {
  return `${datumveld} >= '${vanaf}T00:00:00.000' AND ${datumveld} < '${tot}T00:00:00.000'`;
}

function geheelGetal(waarde) {
  if (typeof waarde !== 'string' || !/^\d+$/.test(waarde) || !Number.isSafeInteger(Number(waarde))) {
    throw new Error('Austin: ongeldig aantal in de API-respons');
  }
  return Number(waarde);
}

async function leesBron(bron, vandaag, fetchFeed) {
  const { datumveld, categorie } = bron;
  const selectie = `type = 'Dog' AND ${categorie}`;
  const dagvragen = [];
  // Per kalenderjaar zijn er hoogstens 366 daggroepen, ook als het aantal records groeit.
  for (let vanaf = eersteDag; vanaf < vandaag;) {
    const volgendJaar = `${Number(vanaf.slice(0, 4)) + 1}-01-01`;
    const tot = volgendJaar < vandaag ? volgendJaar : vandaag;
    dagvragen.push(zoek(bron, {
      $select: `date_trunc_ymd(${datumveld}) as day, count(distinct case(${selectie},id)) as events`,
      $where: venster(datumveld, vanaf, tot),
      $group: 'day',
      $order: 'day',
      $limit: 366,
    }, fetchFeed));
    vanaf = tot;
  }

  const [groepen, [controle]] = await Promise.all([
    Promise.all(dagvragen),
    zoek(bron, {
      $select: 'count(*) as rows, count(id) as with_id, count(distinct id) as unique_ids',
      $where: `${venster(datumveld, eersteDag, vandaag)} AND ${selectie}`,
    }, fetchFeed),
  ]);

  const dagen = new Map();
  let totaal = 0;
  for (const { day, events } of groepen.flat()) {
    // Socrata levert lokale kalendertijden zonder UTC-offset. Behoud de Austin-datum.
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}T00:00:00\.000$/.test(day)) {
      throw new Error(`${bron.naam}: ongeldige dag in de API-respons`);
    }
    const datum = day.slice(0, 10);
    if (dagen.has(datum) || datum < eersteDag || datum >= vandaag) {
      throw new Error(`${bron.naam}: dubbele dag of dag buiten het venster`);
    }
    const aantal = geheelGetal(events);
    dagen.set(datum, aantal);
    totaal += aantal;
  }

  // Dagtotalen moeten overeenkomen met het unieke totaal over de hele periode.
  // Dat detecteert ook een gebeurtenis-ID die op meerdere dagen voorkomt.
  if (!controle || geheelGetal(controle.unique_ids) !== totaal ||
      geheelGetal(controle.rows) !== geheelGetal(controle.with_id) || !dagen.size) {
    throw new Error(`${bron.naam}: dagtotalen of gebeurtenis-ID’s konden niet worden geverifieerd`);
  }

  return dagen;
}

export async function haalAustinPootjes({ fetchFeed = fetch, nu = new Date() } = {}) {
  const vandaag = austinDag.format(nu);
  const [adopties, opnames] = await Promise.all(bronnen.map((bron) => leesBron(bron, vandaag, fetchFeed)));
  const start = [adopties.keys().next().value, opnames.keys().next().value].sort().at(-1);
  const einde = [[...adopties.keys()].at(-1), [...opnames.keys()].at(-1)].sort()[0];
  if (start > einde) throw new Error('Austin: de bronnen hebben geen overlap');

  const data = [];
  for (let tijd = Date.parse(start); tijd <= Date.parse(einde); tijd += dagInMs) {
    const date = new Date(tijd).toISOString().slice(0, 10);
    data.push({ date, adopted: adopties.get(date) ?? null, rescued: opnames.get(date) ?? null });
  }

  return { data, opgehaaldOp: new Date().toISOString() };
}
