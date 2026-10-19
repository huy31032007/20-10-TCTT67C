import { createGardenHandler } from '../server/garden-handler.mjs';
import { createD1Store } from './d1-store.mjs';
import { createLetterHandler } from '../server/letter-handler.mjs';
import { createReactionHandler } from '../server/reaction-handler.mjs';

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname.replace(/\/$/, '');
    if (pathname === '/api/garden' || pathname === '/api/admin/garden' || pathname === '/api/letter' || pathname === '/api/reactions') {
      try {
        if (!env.GARDEN_DB) throw new Error('Missing GARDEN_DB binding');
        if (pathname === '/api/reactions') return await createReactionHandler(createD1Store(env.GARDEN_DB))(request);
        if (pathname === '/api/letter') return await createLetterHandler(createD1Store(env.GARDEN_DB))(request);
        return await createGardenHandler(createD1Store(env.GARDEN_DB), {
          adminOnly: pathname === '/api/admin/garden', adminToken: env.GARDEN_ADMIN_TOKEN
        })(request);
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
