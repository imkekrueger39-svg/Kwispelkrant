import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../keystatic.config';

const handlers = makeRouteHandler({ config });

export const runtime = 'nodejs';

function route(method) {
  return (request) => {
    if (config.storage.kind === 'local' && process.env.NODE_ENV !== 'development') {
      return new Response(null, { status: 404 });
    }
    return handlers[method](request);
  };
}

export const GET = route('GET');
export const POST = route('POST');
