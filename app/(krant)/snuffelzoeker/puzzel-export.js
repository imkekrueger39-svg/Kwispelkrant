import { markeerkleuren } from '../../../lib/snuffelzoeker.mjs';

const breedte = 827;
const hoogte = 1170;
const kleuren = { kers: '#640D14', rood: '#AD2831', goud: '#D8973C', roze: '#FD9BB7', beige: '#F3E6BD', papier: '#fffdf6' };

function vak(ctx, x, y, w, h, radius, kleur) {
  ctx.fillStyle = kleur;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function tekstregels(ctx, tekst, x, y, breedte, grootte, lettertype) {
  let regels;
  do {
    ctx.font = `${grootte}px ${lettertype}`;
    regels = [];
    let regel = '';
    for (const woord of tekst.split(/\s+/u)) {
      if (regel && ctx.measureText(`${regel} ${woord}`).width > breedte) {
        regels.push(regel);
        regel = '';
      }
      regel = regel ? `${regel} ${woord}` : woord;
    }
    regels.push(regel);
    if (regels.length <= 2) break;
    grootte -= 1;
  } while (grootte > 0);
  regels.forEach((regel, i) => ctx.fillText(regel, x, y + i * (grootte + 5), breedte));
}

function ornament(ctx, x, y, kleur, soort) {
  ctx.fillStyle = kleur;
  const stippen = soort === 'pootjes'
    ? [[-9, -4], [-4, -9], [4, -9], [9, -4], [0, 4]]
    : [[-7, 0], [0, -7], [7, 0], [0, 7], [0, 0]];
  for (const [i, [dx, dy]] of stippen.entries()) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, i === 4 ? 5 : 3.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

async function tekenBlad(puzzel, antwoorden) {
  const logo = new Image();
  logo.src = '/brand/logo.png';
  await Promise.allSettled([
    logo.decode(),
    document.fonts.load('34px "Young Serif"'),
    document.fonts.load('19px "Bodoni Moda Variable"'),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = breedte * 2;
  canvas.height = hoogte * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is niet beschikbaar.');
  ctx.scale(2, 2);
  ctx.textBaseline = 'top';
  ctx.fillStyle = kleuren.papier;
  ctx.fillRect(0, 0, breedte, hoogte);
  ctx.strokeStyle = kleuren.kers;
  ctx.lineWidth = 2;
  ctx.strokeRect(25, 25, breedte - 50, hoogte - 50);
  ctx.strokeStyle = kleuren.rood;
  if (puzzel.rand !== 'bloemen') ctx.setLineDash(puzzel.rand === 'pootjes' ? [3, 8] : [8, 4]);
  ctx.strokeRect(33, 33, breedte - 66, hoogte - 66);
  ctx.setLineDash([]);
  if (puzzel.rand !== 'krant') {
    for (const x of [42, breedte - 42]) {
      for (const y of [42, hoogte - 42]) ornament(ctx, x, y, kleuren.rood, puzzel.rand);
    }
  }

  vak(ctx, 53, 50, breedte - 106, 144, 14, kleuren.beige);
  if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, 68, 62, 53, 53);
  ctx.fillStyle = kleuren.rood;
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(antwoorden ? 'KWISPELKRANT · ANTWOORDENBLAD' : 'KWISPELKRANT · DE SNUFFELZOEKER', 135, 65);
  ctx.fillStyle = kleuren.kers;
  tekstregels(ctx, puzzel.titel, 135, 94, 612, 34, '"Young Serif", Georgia, serif');
  tekstregels(ctx, puzzel.boodschap || 'Snuffel jij alle woorden bij elkaar?', 67, 204, 693, 19, '"Bodoni Moda Variable", Georgia, serif');

  const maat = 630;
  const x0 = (breedte - maat) / 2;
  const y0 = 258;
  const cel = maat / puzzel.grootte;
  ctx.strokeStyle = kleuren.kers;
  ctx.strokeRect(x0, y0, maat, maat);
  const midden = (index) => [x0 + (index % puzzel.grootte + .5) * cel, y0 + (Math.floor(index / puzzel.grootte) + .5) * cel];

  if (antwoorden) {
    ctx.lineCap = 'round';
    ctx.lineWidth = cel * .68;
    for (const [i, { posities }] of puzzel.woorden.entries()) {
      ctx.strokeStyle = markeerkleuren[i % markeerkleuren.length];
      ctx.beginPath();
      ctx.moveTo(...midden(posities[0]));
      ctx.lineTo(...midden(posities.at(-1)));
      ctx.stroke();
    }
  }

  ctx.fillStyle = kleuren.kers;
  ctx.font = `bold ${Math.min(29, cel * .49)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  puzzel.letters.forEach((letter, index) => ctx.fillText(letter, ...midden(index)));

  ctx.textAlign = 'start';
  ctx.textBaseline = 'top';
  ctx.fillStyle = kleuren.rood;
  ctx.font = '24px "Young Serif", Georgia, serif';
  ctx.fillText(antwoorden ? 'Gevonden woorden' : 'Te vinden woorden', 67, 911);
  ctx.font = 'bold 16px system-ui, sans-serif';
  puzzel.woorden.forEach(({ woord }, i) => {
    const x = 70 + (i % 3) * 233;
    const y = 951 + Math.floor(i / 3) * 29;
    ctx.fillStyle = antwoorden ? markeerkleuren[i % markeerkleuren.length] : kleuren.goud;
    ctx.fillRect(x, y + 5, 9, 9);
    ctx.fillStyle = kleuren.kers;
    ctx.fillText(woord, x + 16, y, 206);
  });

  return canvas;
}

export async function exporteerPuzzel(puzzel, soort) {
  const antwoorden = soort === 'antwoorden';
  const canvas = await tekenBlad(puzzel, antwoorden);
  const naam = puzzel.titel.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'snuffelzoeker';

  if (soort === 'png') {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('De PNG is leeg.');
    return { blob, naam: `${naam}.png` };
  }

  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  return { blob: pdf.output('blob'), naam: `${naam}${antwoorden ? '-antwoorden' : ''}.pdf` };
}
