// ✅ src/scripts/exportAll.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env.local" });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
  const collections = await mongoose.connection.db.collections();
  for (let coll of collections) {
    const data = await coll.find().toArray();
    const file = path.join(__dirname, `${coll.collectionName}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Exporté ${coll.collectionName} (${data.length} documents)`);
  }
  mongoose.disconnect();
  console.log("✅ Export terminé.");
})();
