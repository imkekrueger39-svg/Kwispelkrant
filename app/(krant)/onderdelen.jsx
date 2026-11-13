import Image from 'next/image';
import Link from 'next/link';
import { artikelbeeld, categorienaam, datumtekst } from '../../lib/artikelen';
import Navigatie from './navigatie';

export function Bloem({ className = '' }) {
  return <span className={'bloem ' + className} aria-hidden="true">✿</span>;
}

export function Hoofdlogo({ alt = '' }) {
  return <Image className="hoofdlogo" src="/brand/logo.png" alt={alt} width={76} height={76} priority />;
}

export function KrantKader({ children }) {
  return (
    <div className="krant">
      <a className="skiplink" href="#inhoud">Direct naar inhoud</a>
      <header>
        <div className="bovenbalk"><span aria-hidden="true">✦</span> Hondennieuws dat je bijblijft <span aria-hidden="true">✦</span></div>
        <div className="masthead kader">
          <Bloem className="masthead-links" />
          <Link href="/" className="merk" aria-label="Kwispelkrant, voorpagina">
            <Hoofdlogo />
            <span>Kwispelkrant<span className="merk-punt" aria-hidden="true">.</span></span>
          </Link>
          <Bloem className="masthead-rechts" />
        </div>
        <Navigatie />
      </header>
      <main className="kader hoofdinhoud" id="inhoud" tabIndex={-1}>{children}</main>
      <footer className="voet">
        <div className="kader voet-inhoud">
          <Link href="/" className="voet-merk">Kwispelkrant</Link>
          <span>Hondennieuws dat je bijblijft</span>
          <Link href="/over-ons">Over ons <span aria-hidden="true">↗</span></Link>
        </div>
      </footer>
    </div>
  );
}

export function Artikelbeeld({ entry, prioriteit = false, volledig = false }) {
  const { src, alt, stijl } = artikelbeeld(entry);
  return (
    <div className={`artikelbeeld beeld-${stijl}${volledig ? ' beeld-volledig' : ''}`}>
      <Image src={src} alt={alt} fill preload={prioriteit} sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 680px" />
    </div>
  );
}

export function Artikelmeta({ entry }) {
  return (
    <div className="artikelmeta">
      <Link href={`/artikelen?categorie=${entry.categorie}`} className="categorie">{categorienaam(entry.categorie)}</Link>
      <time dateTime={entry.datum}>{datumtekst(entry.datum)}</time>
      {entry.fictief && <span className="fictief">Fictief voorbeeld</span>}
    </div>
  );
}

export function Artikelkaarten({ artikelen }) {
  return (
    <div className="kaarten">
      {artikelen.map(({ slug, entry }) => (
        <article className="kaart" key={slug}>
          <Artikelbeeld entry={entry} />
          <div className="kaart-tekst">
            <Artikelmeta entry={entry} />
            <h3><Link href={`/artikelen/${slug}`}>{entry.titel}</Link></h3>
            <p>{entry.samenvatting}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
