import Nieuwsfeed from './nieuwsfeed';

export const revalidate = 3600;

export const metadata = {
  title: 'Latest News',
  description: 'Recente externe nieuwsberichten van hondenpublicaties, verzameld door Kwispelkrant.',
};

export default function LatestNewsPagina() {
  return <Nieuwsfeed overzicht />;
}
