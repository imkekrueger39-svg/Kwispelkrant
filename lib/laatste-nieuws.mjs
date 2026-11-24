import { SaxesParser } from 'saxes';

const bronnen = [
  {
    naam: 'Dogster',
    feed: 'https://www.dogster.com/feed/',
    domein: 'dogster.com',
  },
  {
    naam: 'Whole Dog Journal',
    feed: 'https://www.whole-dog-journal.com/feed/',
    domein: 'whole-dog-journal.com',
    extraHost: 'cdn.whole-dog-journal.com',
  },
  {
    naam: 'American Kennel Club',
    feed: 'https://www.akc.org/expert-advice/feed/',
    domein: 'akc.org',
  },
];

const velden = new Set(['title', 'link', 'pubDate']);
const negentigDagen = 90 * 24 * 60 * 60 * 1000;

function leesRss(xml) {
  const parser = new SaxesParser({ xmlns: true });
  const pad = [];
  const items = [];
  let item;

  parser.on('doctype', () => {
    throw new Error('RSS met een documenttypedeclaratie wordt geweigerd.');
  });
  parser.on('opentag', ({ local, uri }) => {
    pad.push(uri ? null : local);
    if (pad.length === 3 && pad.join('/') === 'rss/channel/item') item = {};
  });
  function verzamelTekst(tekst) {
    const veld = pad[3];
    if (item && pad.length === 4 && velden.has(veld)) item[veld] = (item[veld] ?? '') + tekst;
  }
  parser.on('text', verzamelTekst);
  parser.on('cdata', verzamelTekst);
  parser.on('closetag', () => {
    if (item && pad.length === 3) {
      items.push(item);
      item = undefined;
    }
    pad.pop();
  });
  parser.write(xml).close();

  return items;
}

function veiligeLink(waarde, { domein, extraHost }) {
  if (!waarde) return null;
  let url;
  try {
    url = new URL(waarde.trim());
  } catch {
    return null;
  }
  const toegestaneHosts = [domein, `www.${domein}`, extraHost];
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !toegestaneHosts.includes(url.hostname) || url.pathname === '/') return null;

  url.hash = '';
  return url;
}

function publicatietijd(waarde) {
  const datum = waarde?.trim();
  const onderdelen = datum?.match(/^(?:[A-Za-z]{3},\s+)?(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+\d{2}:\d{2}(?::\d{2})?\s+(?:[+-]\d{4}|GMT|UTC)$/i);
  if (!onderdelen) return NaN;

  const [, dag, maandnaam, jaar] = onderdelen;
  const maand = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    .indexOf(maandnaam.toLowerCase());
  const laatsteDag = new Date(Date.UTC(Number(jaar), maand + 1, 0)).getUTCDate();
  if (maand < 0 || Number(dag) < 1 || Number(dag) > laatsteDag) return NaN;
  return Date.parse(datum);
}

async function leesBron(bron, fetchFeed, nu) {
  try {
    const antwoord = await fetchFeed(bron.feed, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    if (!antwoord.ok) throw new Error(`HTTP ${antwoord.status}`);

    return leesRss(await antwoord.text()).flatMap((item) => {
      const titel = item.title?.replace(/\s+/g, ' ').trim();
      const link = veiligeLink(item.link, bron);
      const tijd = publicatietijd(item.pubDate);
      if (!titel || !link || !Number.isFinite(tijd) || tijd > nu || tijd < nu - negentigDagen) return [];

      // Uitgevers gebruiken soms meerdere hosts of trackingparameters voor dezelfde pagina.
      const sleutel = `${bron.domein}${link.pathname.replace(/\/+$/, '')}`;
      return [{ titel, link: link.href, bron: bron.naam, tijd, sleutel }];
    });
  } catch (fout) {
    console.warn(`[LATEST NEWS] ${bron.naam}: ${fout.message}`);
    return [];
  }
}

export async function haalLaatsteNieuws({ fetchFeed = fetch, nu = Date.now() } = {}) {
  const groepen = await Promise.all(bronnen.map((bron) => leesBron(bron, fetchFeed, nu)));
  const links = new Set();
  const titels = new Set();

  return groepen.flat().sort((a, b) => b.tijd - a.tijd).filter(({ sleutel, titel }) => {
    const titelSleutel = titel.normalize('NFKC').toLowerCase();
    if (links.has(sleutel) || titels.has(titelSleutel)) return false;
    links.add(sleutel);
    titels.add(titelSleutel);
    return true;
  });
}
