import { createGardenHandler } from '../server/garden-handler.mjs';
import { createD1Store } from './d1-store.mjs';

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname.replace(/\/$/, '');
    if (pathname === '/api/garden') {
      try {
        if (!env.GARDEN_DB) throw new Error('Missing GARDEN_DB binding');
        return await createGardenHandler(createD1Store(env.GARDEN_DB))(request);
      } catch (error) {
        console.error('Garden connection error:', error.message);
        return Response.json({ error: 'Vườn tạm mất kết nối. Thử lại sau.' }, {
          status: 503, headers: { 'Cache-Control': 'no-store' }
        });
      }
    }
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Không tìm thấy API.' }, { status: 404 });
    }
    return env.ASSETS.fetch(request);
  }
};
