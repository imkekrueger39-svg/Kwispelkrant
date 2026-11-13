import Link from 'next/link';
import '@fontsource-variable/bodoni-moda';
import '@fontsource/young-serif/latin-400.css';
import './(krant)/krant.css';
import { Bloem } from './(krant)/onderdelen';

export default function NietGevonden() {
  return (
    <main className="krant foutpagina">
      <div className="kader">
        <p className="rubriek"><Bloem /> 404</p>
        <h1>Het spoor is zoek</h1>
        <p>Deze pagina bestaat niet of is verhuisd.</p>
        <Link className="knop" href="/">Naar de voorpagina <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}
