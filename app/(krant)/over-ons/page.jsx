import Image from 'next/image';
import { Bloem } from '../onderdelen';
import { beelden } from '../../../lib/artikelen';

export const metadata = { title: 'Over ons' };

export default function OverOns() {
  return (
    <article className="over-ons">
      <div className="paginakop"><h1>Over ons <Bloem /></h1></div>
      <div className="over-raster">
        <div className="lopende-tekst">
          <p className="intro">Kwispelkrant is een journalistieke website over honden en de mensen met wie ze hun leven delen.</p>
          <p>Van nieuws uit de buurt tot verhalen over gezondheid, gedrag en opvoeding. We willen weten wat er verandert voor honden en hun baasjes, en geven ruimte aan de verhalen die onderweg opduiken.</p>
          <h2>Ontmoet Lily en Lio</h2>
          <p>Lily en Lio zijn de mascottes van Kwispelkrant. Lily speurt naar verhalen die makkelijk over het hoofd worden gezien. Lio is het liefst op pad en duikt met zijn neus als eerste in de krant.</p>
          <p>De eerste drie artikelen zijn fictieve voorbeelden om de krant uit te testen.</p>
        </div>
        <div className="mascottepaneel">
          <Image
            src={beelden.krant.src}
            alt={beelden.krant.alt}
            width={1082}
            height={773}
            sizes="(max-width: 700px) calc(100vw - 4rem), (max-width: 1288px) 45vw, 565px"
            style={{ display: 'block', width: '100%', height: 'auto', marginInline: 'auto', borderRadius: '0.5rem' }}
          />
        </div>
      </div>
    </article>
  );
}
