import { notFound } from 'next/navigation';
import config from '../../../keystatic.config';
import Beheer from '../beheer';

export const metadata = { title: 'Artikelbeheer', robots: { index: false, follow: false } };

export default function Page() {
  if (config.storage.kind === 'local' && process.env.NODE_ENV !== 'development') {
    notFound();
  }
  return <Beheer />;
}
