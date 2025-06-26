// ✅ src/scripts/audit.js
const fs = require('fs');
const root = '../src';

const mustHave = [
  "app/layout.js",
  "app/[locale]/layout.js",
  "components/Header.js",
  "components/Footer.js",
  "components/ProductCard.js",
  "pages/api/products/index.js",
  "models/Product.js",
  "lib/dbConnect.js",
  "lib/authOptions.js",
  // ... complète selon ton arbo actuelle !
];

let missing = mustHave.filter(f => !fs.existsSync(root + "/" + f));
if (missing.length) {
  console.log("⚠️ Fichiers manquants :", missing);
} else {
  console.log("✅ Tous les fichiers critiques sont présents.");
}
