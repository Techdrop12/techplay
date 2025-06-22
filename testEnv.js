import dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env.local' });

console.log('MONGODB_URI =', process.env.MONGODB_URI);
