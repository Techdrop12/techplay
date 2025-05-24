import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await dbConnect()

  const products = await Product.find().lean()

  const csvHeader = 'ID,Title,Price,Slug\n'
  const csvRows = products.map(p =>
    `${p._id},"${p.title}",${p.price},"${p.slug}"`
  )

  const csv = csvHeader + csvRows.join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=products.csv')
  res.status(200).send(csv)
}
