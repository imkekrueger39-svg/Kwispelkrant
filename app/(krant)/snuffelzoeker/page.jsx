import Image from 'next/image';
import hero from '../../../public/brand/snuffelzoeker.png';
import { Bloem } from '../onderdelen';
import Snuffelzoeker from './snuffelzoeker';
import stijl from './snuffelzoeker.module.css';

export const metadata = {
  title: 'De Snuffelzoeker',
  description: 'Speel een woordzoeker over honden of maak en download je eigen puzzel.',
};

export default function SnuffelzoekerPagina() {
  return (
    <div className={stijl.pagina}>
      <header className={stijl.hero}>
        <div>
          <h1>De Snuffelzoeker <Bloem /></h1>
          <p>Snuffel jij alle woorden bij elkaar?</p>
        </div>
        <Image src={hero} alt="" sizes="(max-width: 720px) 90vw, 500px" />
      </header>
      <Snuffelzoeker />
    </div>
  );
}
