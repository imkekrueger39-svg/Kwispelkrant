'use client';

import { Flower2, Heart, House, Newspaper, PawPrint, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Voorpagina', icoon: House },
  { href: '/artikelen', label: 'Artikelen', icoon: Newspaper },
  { href: '/latest-news', label: 'Latest News', icoon: Zap },
  { href: '/quiz', label: 'Kwispelquiz', icoon: Flower2, accent: true },
  { href: '/pootjes-in-cijfers', label: 'Pootjes in cijfers', icoon: PawPrint, accent: true },
  { href: '/over-ons', label: 'Over ons', icoon: Heart },
];

export default function Navigatie() {
  const pathname = usePathname();
  return (
    <nav className="hoofdnavigatie" aria-label="Hoofdnavigatie">
      {links.map(({ href, label, icoon: Icoon, accent }) => (
        <Link key={href} href={href} aria-current={
          pathname === href ? 'page' : pathname.startsWith(href + '/') ? 'location' : undefined
        }>
          <Icoon className={accent ? 'navigatie-accent' : undefined} size={16} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
