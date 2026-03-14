/**
 * Remplace le contenu de node-domexception (déprécié) par un re-export de
 * globalThis.DOMException (Node 18+). Supprime le warning npm deprecated.
 */
const fs = require('fs')
const path = require('path')

const content = `'use strict'
// Patched: use native DOMException (Node 18+) instead of deprecated node-domexception.
module.exports = globalThis.DOMException
`

function findAndPatch(dir, depth = 0) {
  if (depth > 15) return
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        if (e.name === 'node-domexception') {
          const index = path.join(full, 'index.js')
          if (fs.existsSync(index)) {
            fs.writeFileSync(index, content, 'utf8')
            console.log('Patched:', index)
          }
        } else if (e.name !== '.' && e.name !== '..') {
          findAndPatch(full, depth + 1)
        }
      }
    }
  } catch (_) {}
}

const root = path.join(__dirname, '..', 'node_modules')
if (fs.existsSync(root)) {
  findAndPatch(root)
}
