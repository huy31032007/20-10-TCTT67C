import { getStore } from '@netlify/blobs';
import { createGardenHandler } from '../../server/garden-handler.mjs';

export default async function garden(request) {
  // Site-wide storage survives deploys and is shared by all visitors.
  const blobs = getStore({ name: 'class-garden-v1', consistency: 'strong' });
  const store = {
    async read() {
      const result = await blobs.getWithMetadata('members', { type: 'json' });
      return result?.data ? { data: result.data, etag: result.etag } : null;
    },
    async write(data, etag) {
      const result = await blobs.setJSON('members', data, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
      return result.modified;
    }
  };
  return createGardenHandler(store)(request);
}

export const config = { path: '/api/garden' };
