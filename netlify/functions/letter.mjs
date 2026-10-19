import { getStore } from '@netlify/blobs';
import { createLetterHandler } from '../../server/letter-handler.mjs';

export default async function letter(request) {
  const blobs = getStore({ name: 'class-garden-v1', consistency: 'strong' });
  return createLetterHandler({
    async read() {
      const result = await blobs.getWithMetadata('members', { type: 'json' });
      return result?.data ? { data: result.data, etag: result.etag } : null;
    },
    async write(data, etag) {
      const result = await blobs.setJSON('members', data, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
      return result.modified;
    }
  })(request);
}
export const config = { path: '/api/letter' };
