// ✅ src/lib/authOptions.js (auth sécurisé, NextAuth, full option)
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongoClientPromise';
import dbConnect from './dbConnect';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    // 👉 Ajoute ici d'autres providers (Google, GitHub...) si besoin
  ],
  callbacks: {
    async session({ session, token }) {
      session.userId = token.sub;
      return session;
    },
    async signIn({ user }) {
      await dbConnect();
      // 👉 Tu peux vérifier ici si user.email correspond à un admin
      return true;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: '/fr/admin/login',
    error: '/fr/admin/login', // ou une page personnalisée
  },
  secret: process.env.NEXTAUTH_SECRET,
};
