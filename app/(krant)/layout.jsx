import '@fontsource-variable/bodoni-moda';
import '@fontsource/young-serif/latin-400.css';
import './krant.css';
import { KrantKader } from './onderdelen';

export default function KrantLayout({ children }) {
  return <KrantKader>{children}</KrantKader>;
}
