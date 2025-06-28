// ✅ /src/lib/getMessages.js (récupération messages i18n pour next-intl)
import fs from 'fs/promises';
import path from 'path';

export default async function getMessages(locale) {
  const filePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}
