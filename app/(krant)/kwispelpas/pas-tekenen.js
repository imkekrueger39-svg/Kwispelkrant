export const pasBreedte = 1440;
export const pasHoogte = 1240;

const kleur = {
  papier: '#fff8e9',
  beige: '#F3E6BD',
  goud: '#D8973C',
  roze: '#FD9BB7',
  rood: '#AD2831',
  kers: '#640D14',
};

export async function laadPasLettertypes() {
  await Promise.all([
    document.fonts.load('38px "Young Serif"'),
    document.fonts.load('25px "Bodoni Moda Variable"'),
  ]);
}

function kader(ctx, x, y, w, h, radius, vulling, rand) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  if (vulling) {
    ctx.fillStyle = vulling;
    ctx.fill();
  }
  if (rand) {
    ctx.strokeStyle = rand;
    ctx.stroke();
  }
}

function poot(ctx, x, y, schaal, vulling) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(schaal, schaal);
  ctx.fillStyle = vulling;
  for (const [px, py, rx, ry, draai] of [
    [-25, -11, 8, 12, -.4], [-10, -23, 8, 13, -.2],
    [10, -23, 8, 13, .2], [25, -11, 8, 12, .4], [0, 12, 21, 15, 0],
  ]) {
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, draai, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function regels(ctx, tekst, breedte) {
  const resultaat = [];
  let regel = '';
  for (const woord of tekst.trim().split(/\s+/u)) {
    const gecombineerd = regel ? `${regel} ${woord}` : woord;
    if (ctx.measureText(gecombineerd).width <= breedte) {
      regel = gecombineerd;
      continue;
    }
    if (regel) resultaat.push(regel);
    regel = '';
    for (const teken of woord) {
      if (regel && ctx.measureText(regel + teken).width > breedte) {
        resultaat.push(regel);
        regel = '';
      }
      regel += teken;
    }
  }
  resultaat.push(regel);
  return resultaat;
}

function schrijfWaarde(ctx, tekst, { x, y, breedte, grootte, maxRegels, familie }) {
  let regelsTekst;
  do {
    ctx.font = `${grootte}px ${familie}`;
    regelsTekst = regels(ctx, tekst, breedte);
    if (regelsTekst.length <= maxRegels) break;
    grootte -= 1;
  } while (grootte > 0);

  ctx.fillStyle = kleur.kers;
  regelsTekst.forEach((regel, index) => ctx.fillText(regel, x, y + index * (grootte + 3), breedte));
}

export function tekenPas(canvas, pas, foto) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Deze browser kan de pas niet tekenen.');

  ctx.setTransform(pasBreedte / 720, 0, 0, pasHoogte / 620, 0, 0);
  ctx.textAlign = 'start';
  ctx.textBaseline = 'top';
  ctx.fillStyle = kleur.beige;
  ctx.fillRect(0, 0, 720, 620);
  ctx.lineWidth = 2;
  kader(ctx, 15, 15, 690, 590, 25, kleur.papier, kleur.kers);
  ctx.setLineDash([4, 5]);
  kader(ctx, 24, 24, 672, 572, 19, null, kleur.rood);
  ctx.setLineDash([]);

  kader(ctx, 39, 39, 642, 89, 14, kleur.roze, null);
  poot(ctx, 77, 85, .67, kleur.rood);
  ctx.fillStyle = kleur.kers;
  ctx.font = '35px "Young Serif", Georgia, serif';
  ctx.fillText('De Kwispelpas', 118, 50);
  ctx.font = '19px "Bodoni Moda Variable", Georgia, serif';
  ctx.fillText('KWISPELKRANT', 119, 94);

  const fotovak = { x: 44, y: 154, w: 226, h: 270 };
  ctx.save();
  kader(ctx, fotovak.x, fotovak.y, fotovak.w, fotovak.h, 12, kleur.beige, kleur.rood);
  ctx.clip();
  if (foto) {
    const verhouding = Math.max(fotovak.w / foto.naturalWidth, fotovak.h / foto.naturalHeight);
    const w = foto.naturalWidth * verhouding;
    const h = foto.naturalHeight * verhouding;
    ctx.drawImage(foto, fotovak.x + (fotovak.w - w) / 2, fotovak.y + (fotovak.h - h) / 2, w, h);
  } else {
    ctx.fillStyle = kleur.roze;
    ctx.beginPath();
    ctx.arc(157, 278, 68, 0, Math.PI * 2);
    ctx.fill();
    poot(ctx, 157, 278, 1.5, kleur.rood);
    poot(ctx, 73, 389, .35, kleur.goud);
    poot(ctx, 235, 184, .39, kleur.goud);
  }
  ctx.restore();
  kader(ctx, fotovak.x, fotovak.y, fotovak.w, fotovak.h, 12, null, kleur.rood);

  const x = 292;
  const bodoni = '"Bodoni Moda Variable", Georgia, serif';
  const onderdelen = [
    ['NAAM', pas.naam || 'Jouw hond', 154, 38, '"Young Serif", Georgia, serif'],
    ['LEEFTIJD', pas.leeftijd, 255, 22, bodoni],
    ['RAS OF KRUISING', pas.ras, 325, 22, bodoni],
    ['KARAKTER', pas.karakter, 395, 22, bodoni],
    ['FAVORIETE BEZIGHEID', pas.hobby, 465, 22, bodoni],
  ];

  for (const [label, tekst, y, grootte, familie] of onderdelen) {
    ctx.fillStyle = kleur.rood;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(label, x, y);
    schrijfWaarde(ctx, tekst || '—', { x, y: y + 21, breedte: 373, grootte, maxRegels: 2, familie });
  }

  ctx.save();
  ctx.translate(156, 485);
  ctx.rotate(-.08);
  ctx.lineWidth = 2.5;
  kader(ctx, -100, -34, 200, 66, 17, kleur.beige, kleur.rood);
  poot(ctx, -66, 1, .49, kleur.rood);
  ctx.fillStyle = kleur.rood;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText('100% GOEDE', -39, -19);
  ctx.fillText('HOND', -39, 3);
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(44, 548);
  ctx.lineTo(676, 548);
  ctx.strokeStyle = kleur.goud;
  ctx.stroke();
  ctx.fillStyle = kleur.kers;
  ctx.font = 'italic 20px "Bodoni Moda Variable", Georgia, serif';
  ctx.fillText('Elke hond verdient een eigen verhaal.', 44, 562);
}
