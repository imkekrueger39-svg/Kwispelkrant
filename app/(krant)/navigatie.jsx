'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Voorpagina' },
  { href: '/artikelen', label: 'Artikelen' },
  { href: '/over-ons', label: 'Over ons' },
];

export default function Navigatie() {
  const pathname = usePathname();
  return (
    <nav className="hoofdnavigatie" aria-label="Hoofdnavigatie">
      {links.map(({ href, label }) => (
        <Link key={href} href={href} aria-current={
          pathname === href ? 'page' : pathname.startsWith(href + '/') ? 'location' : undefined
        }>{label}</Link>
      ))}
    </nav>
  );
}
