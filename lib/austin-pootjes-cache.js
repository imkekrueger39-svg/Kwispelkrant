import { unstable_cache } from 'next/cache';
import { haalAustinPootjes } from './austin-pootjes.mjs';

export const austinVerversing = 86400;
export const leesAustin = unstable_cache(haalAustinPootjes, ['austin-pootjes-dagelijks'], {
  revalidate: austinVerversing,
});
