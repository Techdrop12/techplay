import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'votre_project_id',       // ← remplace par ton ID
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: true,
})
