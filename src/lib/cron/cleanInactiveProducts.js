// /src/lib/cron/cleanInactiveProducts.js
// Nettoyage (ou archivage) des produits inactifs.
// - Par défaut : *soft-delete* (archive=true) au lieu de deleteMany.
// - Options : months, onlyOutOfStock, mode ('soft' | 'hard'), dryRun, batchSize.

import dbConnect from '../dbConnect.js'
import Product from '../../models/Product.js'

/**
 * @typedef {Object} CleanOptions
 * @property {number} [months=6] - Nombre de mois sans vente.
 * @property {boolean} [onlyOutOfStock=true] - Cible uniquement les stocks <= 0.
 * @property {'soft'|'hard'} [mode=process.env.PRODUCT_CLEAN_MODE || 'soft'] - Archivage ou suppression.
 * @property {boolean} [dryRun=false] - Compte seulement, ne modifie rien.
 * @property {number} [batchSize=500] - Taille de lot (utile pour les très gros catalogues).
 */

/**
 * @param {CleanOptions} opts
 * @returns {Promise<{matched:number, modified:number, mode:string}>}
 */
export async function cleanInactiveProducts (opts = {}) {
  const {
    months = 6,
    onlyOutOfStock = true,
    mode = process.env.PRODUCT_CLEAN_MODE || 'soft',
    dryRun = false,
    batchSize = 500,
  } = opts

  await dbConnect()

  const threshold = new Date()
  threshold.setMonth(threshold.getMonth() - months)

  /** @type {any} */
  const query = { lastSoldAt: { $lte: threshold } }
  if (onlyOutOfStock) query.stock = { $lte: 0 }

  if (dryRun) {
    const matched = await Product.countDocuments(query)
    return { matched, modified: 0, mode: 'dry-run' }
  }

  // Soft delete = on archive le produit
  if (mode !== 'hard') {
    const res = await Product.updateMany(
      query,
      { $set: { archived: true, archivedAt: new Date() } },
      { strict: false } // au cas où le schéma n'a pas (encore) ces champs
    )
    const matched = res.matchedCount ?? res.n ?? 0
    const modified = res.modifiedCount ?? res.nModified ?? 0
    return { matched, modified, mode: 'soft' }
  }

  // Hard delete (irréversible)
  // Astuce : on fait par batch pour ne pas bloquer le serveur si très volumineux
  let matched = 0
  let modified = 0
  // @ts-ignore (JS file)
  const cursor = Product.find(query).select('_id').cursor()

  const ids = []
  for await (const doc of cursor) {
    ids.push(doc._id)
    if (ids.length >= batchSize) {
      const r = await Product.deleteMany({ _id: { $in: ids } })
      matched += ids.length
      modified += r.deletedCount || 0
      ids.length = 0
    }
  }
  if (ids.length) {
    const r = await Product.deleteMany({ _id: { $in: ids } })
    matched += ids.length
    modified += r.deletedCount || 0
  }
  return { matched, modified, mode: 'hard' }
}

export default cleanInactiveProducts
