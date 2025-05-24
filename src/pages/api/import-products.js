import formidable from 'formidable';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de l’upload' });
    }

    try {
      await dbConnect();

      const filePath = files.file.filepath;
      const fileContent = fs.readFileSync(filePath, 'utf8');

      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const inserted = await Product.insertMany(records, { ordered: false });

      return res.status(200).json({ importedCount: inserted.length });
    } catch (error) {
      console.error('Erreur d’import CSV :', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  });
}
