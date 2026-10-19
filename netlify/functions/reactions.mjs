import { getStore } from '@netlify/blobs';
import { createReactionHandler } from '../../server/reaction-handler.mjs';

export default async function reactions(request) {
  const blobs = getStore({ name:'class-garden-v1', consistency:'strong' });
  return createReactionHandler({
    async read() {
      const result = await blobs.getWithMetadata('members', { type:'json' });
      return result?.data ? { data:result.data, etag:result.etag } : null;
    },
    async write(data, etag) {
      const result = await blobs.setJSON('members', data, etag ? { onlyIfMatch:etag } : { onlyIfNew:true });
      return result.modified;
    }
  })(request);
}
export const config = { path:'/api/reactions' };
