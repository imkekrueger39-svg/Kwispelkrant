'use client';

import { ChartNoAxesColumn, ChevronDown, Flower2, Heart, House, MessageCircleQuestion, Newspaper, PawPrint, Search, Stamp, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

const hoofdlinks = [
  { href: '/', label: 'Voorpagina', icoon: House },
  { href: '/artikelen', label: 'Artikelen', icoon: Newspaper },
  { href: '/latest-news', label: 'Latest News', icoon: Zap },
  { href: '/pootjes-in-cijfers', label: 'Pootjes in cijfers', icoon: ChartNoAxesColumn },
];

const ontdeklinks = [
  { href: '/kwispelpas', label: 'De Kwispelpas', icoon: Stamp },
  { href: '/snuffelzoeker', label: 'De Snuffelzoeker', icoon: Search },
  { href: '/blaf-of-blaat', label: 'Blaf of Blaat?', icoon: MessageCircleQuestion },
];

const overOns = { href: '/over-ons', label: 'Over ons', icoon: Heart };

function huidigeLink(pathname, href) {
  if (pathname === href) return 'page';
  if (href !== '/' && pathname.startsWith(href + '/')) return 'location';
}

function Navigatielink({ link, pathname, onNavigate }) {
  const { href, label, icoon: Icoon, accent } = link;

  return (
    <Link href={href} aria-current={huidigeLink(pathname, href)} onNavigate={onNavigate}>
      <Icoon className={accent ? 'navigatie-accent' : undefined} size={16} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

function Kwispelpoot({ pathname }) {
  const [open, setOpen] = useState(false);
  const groep = useRef(null);
  const knop = useRef(null);
  const paneelId = useId();
  const actief = ontdeklinks.some(({ href }) => huidigeLink(pathname, href));

  useEffect(() => {
    if (!open) return;

    function bijKlikBuiten(event) {
      if (!groep.current?.contains(event.target)) setOpen(false);
    }

    function bijToets(event) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (groep.current?.contains(document.activeElement)) knop.current?.focus();
      setOpen(false);
    }

    document.addEventListener('pointerdown', bijKlikBuiten);
    document.addEventListener('keydown', bijToets);
    return () => {
      document.removeEventListener('pointerdown', bijKlikBuiten);
      document.removeEventListener('keydown', bijToets);
    };
  }, [open]);

  function sluitNaKeuze() {
    knop.current?.focus();
    setOpen(false);
  }

  return (
    <div className="kwispelpoot" ref={groep}>
      <button
        ref={knop}
        type="button"
        className="kwispelpoot-knop"
        aria-expanded={open}
        aria-controls={paneelId}
        data-actief={actief || undefined}
        onClick={() => setOpen((vorige) => !vorige)}
      >
        <PawPrint className="navigatie-accent" size={18} aria-hidden="true" />
        <span>Ontdek meer</span>
        <ChevronDown className="kwispelpoot-pijl" size={14} aria-hidden="true" />
      </button>
      <div id={paneelId} className="kwispelpoot-paneel" hidden={!open}>
        <p className="kwispelpoot-titel">
          De Kwispelpoot <Flower2 className="navigatie-accent" size={18} aria-hidden="true" />
        </p>
        <ul>
          {ontdeklinks.map((link) => (
            <li key={link.href}>
              <Navigatielink link={link} pathname={pathname} onNavigate={sluitNaKeuze} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Navigatie() {
  const pathname = usePathname();

  return (
    <nav className="hoofdnavigatie" aria-label="Hoofdnavigatie">
      {hoofdlinks.map((link) => <Navigatielink key={link.href} link={link} pathname={pathname} />)}
      <Kwispelpoot key={pathname} pathname={pathname} />
      <Navigatielink link={overOns} pathname={pathname} />
    </nav>
  );
}
