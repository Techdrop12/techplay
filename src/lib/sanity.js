import { createClient } from 'next-sanity'

export const sanity = createClient({
  projectId: 'your_project_id', // à remplacer par le vrai ID
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-01-01'
})