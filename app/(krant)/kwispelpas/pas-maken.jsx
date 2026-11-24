'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { laadPasLettertypes, pasBreedte, pasHoogte, tekenPas } from './pas-tekenen';
import stijl from './kwispelpas.module.css';

const legePas = { naam: '', leeftijd: '', ras: '', karakter: '', eigenKarakter: '', hobby: '', eigenHobby: '' };
const karakters = ['Knuffelkont', 'Avonturier', 'Speelse deugniet', 'Rustige ziel', 'Eigen omschrijving'];
const bezigheden = ['Wandelen', 'Spelen', 'Slapen', 'Snacken', 'Anders'];
const fotoformaten = ['image/jpeg', 'image/png', 'image/webp'];

export default function PasMaken() {
  const [velden, setVelden] = useState(legePas);
  const [foto, setFoto] = useState(null);
  const [fotoFout, setFotoFout] = useState('');
  const [fotoLaden, setFotoLaden] = useState(false);
  const [exporteren, setExporteren] = useState(false);
  const [downloadFout, setDownloadFout] = useState('');
  const [pngBestand, setPngBestand] = useState(null);
  const canvas = useRef(null);
  const naamveld = useRef(null);
  const fotoveld = useRef(null);
  const fotopoging = useRef(0);

  const pas = useMemo(() => {
    const tekstvelden = Object.fromEntries(Object.entries(velden).map(([veld, waarde]) => [veld, waarde.trim()]));
    return {
      ...tekstvelden,
      karakter: velden.karakter === 'Eigen omschrijving' ? tekstvelden.eigenKarakter : velden.karakter,
      hobby: velden.hobby === 'Anders' ? tekstvelden.eigenHobby : velden.hobby,
    };
  }, [velden]);

  useEffect(() => {
    if (pngBestand) return () => URL.revokeObjectURL(pngBestand.url);
  }, [pngBestand]);

  useEffect(() => {
    const voorbeeld = canvas.current;
    tekenPas(voorbeeld, pas, foto);
    let actief = true;
    laadPasLettertypes().then(() => {
      if (actief) tekenPas(voorbeeld, pas, foto);
    }).catch(() => {
      // Het voorbeeld is al getekend met de beschikbare lettertypes.
    });
    return () => { actief = false; };
  }, [pas, foto]);

  function wijzig(veld, waarde) {
    setVelden((vorige) => ({ ...vorige, [veld]: waarde }));
    setPngBestand(null);
    setDownloadFout('');
    if (veld === 'naam') naamveld.current.setCustomValidity('');
  }

  async function leesFoto(event) {
    const bestand = event.currentTarget.files?.[0];
    const poging = ++fotopoging.current;
    setFoto(null);
    setFotoFout('');
    setFotoLaden(false);
    setPngBestand(null);
    if (!bestand) return;

    if (bestand.size > 8 * 1024 * 1024) {
      setFotoFout('Deze foto is groter dan 8 MB. Kies een kleiner bestand.');
      return;
    }
    if (!fotoformaten.includes(bestand.type)) {
      setFotoFout('Kies een geldige JPG-, PNG- of WebP-afbeelding.');
      return;
    }

    setFotoLaden(true);
    const url = URL.createObjectURL(bestand);
    try {
      const afbeelding = new window.Image();
      afbeelding.src = url;
      await afbeelding.decode();
      if (!afbeelding.naturalWidth || !afbeelding.naturalHeight) throw new Error();
      if (poging === fotopoging.current) setFoto(afbeelding);
    } catch {
      if (poging === fotopoging.current) setFotoFout('Deze foto kon niet worden geopend. Kies een andere afbeelding.');
    } finally {
      URL.revokeObjectURL(url);
      if (poging === fotopoging.current) setFotoLaden(false);
    }
  }

  async function download(event) {
    event.preventDefault();
    if (!pas.naam) {
      naamveld.current.setCustomValidity('Vul de naam van je hond in.');
      naamveld.current.reportValidity();
      return;
    }
    if (exporteren || fotoLaden) return;

    setExporteren(true);
    setPngBestand(null);
    setDownloadFout('');
    try {
      await laadPasLettertypes().catch(() => {});
      const uitvoer = document.createElement('canvas');
      uitvoer.width = pasBreedte;
      uitvoer.height = pasHoogte;
      tekenPas(uitvoer, pas, foto);
      const png = await new Promise((resolve) => uitvoer.toBlob(resolve, 'image/png'));
      if (!png) throw new Error();
      const url = URL.createObjectURL(png);
      const bestandsnaam = pas.naam.replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-+|-+$/g, '');
      const naam = `kwispelpas-${bestandsnaam || 'hond'}.png`;
      setPngBestand({ url, naam });

      const link = document.createElement('a');
      link.href = url;
      link.download = naam;
      document.body.append(link);
      link.click();
      link.remove();
    } catch {
      setDownloadFout('De PNG kon niet worden gemaakt. Probeer de download opnieuw.');
    } finally {
      setExporteren(false);
    }
  }

  function opnieuw() {
    fotopoging.current++;
    setVelden(legePas);
    setFoto(null);
    setFotoFout('');
    setFotoLaden(false);
    setDownloadFout('');
    setPngBestand(null);
    fotoveld.current.value = '';
    naamveld.current.setCustomValidity('');
    naamveld.current.focus();
  }

  const beschrijving = [
    `Kwispelpas voor ${pas.naam || 'jouw hond'}`, foto ? 'Met eigen hondenfoto' : 'Met een decoratieve pootafdruk',
    pas.leeftijd && `Leeftijd: ${pas.leeftijd}`, pas.ras && `Ras of kruising: ${pas.ras}`,
    pas.karakter && `Karakter: ${pas.karakter}`, pas.hobby && `Favoriete bezigheid: ${pas.hobby}`, '100% goede hond',
  ].filter(Boolean).join('. ');

  return (
    <form className={stijl.maker} onSubmit={download}>
      <section className={stijl.invoer} aria-labelledby="kwispelpas-invoer">
        <h2 id="kwispelpas-invoer">Vertel over je hond</h2>
        <label>
          Naam van je hond <small>(verplicht)</small>
          <input ref={naamveld} value={velden.naam} onChange={(event) => wijzig('naam', event.target.value)} required maxLength={64} />
        </label>
        <div className={stijl.naastElkaar}>
          <label>
            Leeftijd <small>(optioneel)</small>
            <input value={velden.leeftijd} onChange={(event) => wijzig('leeftijd', event.target.value)} maxLength={32} placeholder="Bijv. 2 jaar" />
          </label>
          <label>
            Ras of kruising <small>(optioneel)</small>
            <input value={velden.ras} onChange={(event) => wijzig('ras', event.target.value)} maxLength={64} />
          </label>
        </div>
        <label>
          Karakter
          <select value={velden.karakter} onChange={(event) => wijzig('karakter', event.target.value)}>
            <option value="">Kies een karakter</option>
            {karakters.map((optie) => <option key={optie}>{optie}</option>)}
          </select>
        </label>
        {velden.karakter === 'Eigen omschrijving' && <label>
          Eigen omschrijving van het karakter
          <input value={velden.eigenKarakter} onChange={(event) => wijzig('eigenKarakter', event.target.value)} maxLength={72} />
        </label>}
        <label>
          Favoriete bezigheid
          <select value={velden.hobby} onChange={(event) => wijzig('hobby', event.target.value)}>
            <option value="">Kies een bezigheid</option>
            {bezigheden.map((optie) => <option key={optie}>{optie}</option>)}
          </select>
        </label>
        {velden.hobby === 'Anders' && <label>
          Eigen favoriete bezigheid
          <input value={velden.eigenHobby} onChange={(event) => wijzig('eigenHobby', event.target.value)} maxLength={72} />
        </label>}
        <label>
          Hondenfoto <small>(optioneel)</small>
          <input ref={fotoveld} type="file" accept={fotoformaten.join(',')} onChange={leesFoto}
            aria-invalid={Boolean(fotoFout)} aria-describedby={fotoFout ? 'kwispelpas-fotohulp kwispelpas-fotofout' : 'kwispelpas-fotohulp'} />
        </label>
        <p className={stijl.hulp} id="kwispelpas-fotohulp">JPG, PNG of WebP, maximaal 8 MB.</p>
        {fotoFout && <p className={stijl.fout} id="kwispelpas-fotofout" role="alert">{fotoFout}</p>}
      </section>
      <section className={stijl.voorbeeld} aria-labelledby="kwispelpas-voorbeeld">
        <h2 id="kwispelpas-voorbeeld">Jouw Kwispelpas</h2>
        <canvas ref={canvas} width={pasBreedte} height={pasHoogte} role="img" aria-label={beschrijving} />
        <div className={stijl.acties}>
          <button className={stijl.download} type="submit" disabled={exporteren || fotoLaden}>
            <Download size={18} aria-hidden="true" /> {exporteren ? 'Pas maken…' : 'Download mijn Kwispelpas'}
          </button>
          <button className={stijl.opnieuw} type="button" onClick={opnieuw} disabled={exporteren}>Maak nog een pas</button>
        </div>
        <p className={stijl.hulp} role="status">{fotoLaden ? 'Foto wordt geopend…' : pngBestand && 'Je PNG is klaar.'}</p>
        {pngBestand && <p className={stijl.hulp}><a href={pngBestand.url} download={pngBestand.naam}>Download PNG opnieuw</a></p>}
        {downloadFout && <p className={stijl.fout} role="alert">{downloadFout}</p>}
      </section>
    </form>
  );
}
