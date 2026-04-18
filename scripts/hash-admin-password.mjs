/**
 * Génère un hash bcrypt pour .env → ADMIN_PASSWORD_HASH
 * Usage : node scripts/hash-admin-password.mjs "tonMotDePasse"
 */
import bcrypt from 'bcryptjs';

const pwd = process.argv[2];
if (!pwd || pwd === '-h' || pwd === '--help') {
  console.error('Usage: node scripts/hash-admin-password.mjs "<mot de passe>"');
  process.exit(pwd ? 0 : 1);
}

const hash = await bcrypt.hash(pwd, 10);
console.log('\nCopie cette ligne dans .env.local (une seule ligne, sans guillemets superflus) :\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
