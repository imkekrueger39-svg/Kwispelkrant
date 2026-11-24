import Image from 'next/image';
import illustratie from '../../../public/brand/blaf of blaat.png';
import { Bloem } from '../onderdelen';
import Feitenquiz from './feitenquiz';
import stijl from './blaf.module.css';

export const metadata = {
  title: 'Blaf of Blaat?',
  description: 'Feit of fabel over honden. Test je kennis met acht stellingen van Kwispelkrant.',
};

export default function BlafOfBlaat() {
  return (
    <div className={stijl.pagina}>
      <header className={stijl.hero}>
        <div className={stijl.herotekst}>
          <h1>Blaf of Blaat? <Bloem /></h1>
          <p className={stijl.subtitel}>Feit of fabel over honden</p>
          <p>Van hardnekkige hondenmythes tot verrassende weetjes: weet jij wat klopt en wat pure fabel is?</p>
        </div>
        <Image
          src={illustratie}
          alt="Een hond met een microfoon en een schaap met een bril presenteren samen de quiz."
          sizes="(max-width: 680px) calc(100vw - 4rem), (max-width: 1100px) 50vw, 516px"
        />
      </header>
      <Feitenquiz />
    </div>
  );
}
