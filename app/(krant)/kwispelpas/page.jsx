import Image from 'next/image';
import illustratie from '../../../public/brand/kwispelpas.png';
import { Bloem } from '../onderdelen';
import PasMaken from './pas-maken';
import stijl from './kwispelpas.module.css';

export const metadata = {
  title: 'De Kwispelpas',
  description: 'Maak een persoonlijke paspoortkaart voor je hond en download die als PNG.',
};

export default function KwispelpasPagina() {
  return (
    <div className={stijl.pagina}>
      <header className={stijl.hero}>
        <div>
          <h1>De Kwispelpas <Bloem /></h1>
          <p>Elke hond verdient een eigen verhaal.</p>
        </div>
        <Image src={illustratie} alt="Een hond met een medaille naast een open Kwispelpas, omringd door bloemen." sizes="(max-width: 680px) 90vw, 500px" />
      </header>
      <PasMaken />
      <footer className={stijl.noot}>
        <p>De Kwispelpas is een speelse kaart, geen officieel dierenpaspoort of identificatiedocument.</p>
        <p>Je gegevens en foto blijven in deze browser. Kwispelkrant uploadt of bewaart ze nergens.</p>
      </footer>
    </div>
  );
}
