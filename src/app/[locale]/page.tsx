import HomePage, { generateMetadata as generateHomeMetadata } from '../page'

export const revalidate = 300

export async function generateMetadata() {
  return generateHomeMetadata()
}

export default HomePage