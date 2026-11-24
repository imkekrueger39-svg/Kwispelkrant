import Image from 'next/image';
import { Bloem } from '../onderdelen';
import Hondentest from './hondentest';
import stijl from './quiz.module.css';

export const metadata = {
  title: 'Welke hond past bij jou?',
  description: 'Beantwoord vier vragen en ontdek jouw hondenmatch met de miniquiz van Kwispelkrant.',
};

export default function QuizPagina() {
  return (
    <div className={stijl.pagina}>
      <header className={stijl.kop}>
        <div>
          <p className="rubriek"><Bloem /> Miniquiz</p>
          <h1>Welke hond past bij jou?</h1>
          <p>Kies per vraag het antwoord dat het best bij jou past.</p>
        </div>
        <Image
          className={stijl.mascottes}
          src="/brand/lily-lio-quiz.png"
          alt=""
          width={1448}
          height={1086}
          sizes="(max-width: 600px) min(100vw - 4rem, 20rem), 18rem"
        />
      </header>
      <Hondentest />
      <p className={stijl.toelichting}>
        Deze quiz is speels bedoeld. Bij het kiezen van een hond tellen ook de verzorging,
        de nodige beweging, je woonomgeving en de individuele behoeften van de hond mee.
      </p>
    </div>
  );
}
