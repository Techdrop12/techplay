// ✅ /src/lib/sanity.js (Sanity.io CMS, compatible Next.js)
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-11-01',
  useCdn: true,
});

export default client;
