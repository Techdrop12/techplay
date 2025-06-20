// src/lib/authOptions.js

import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        // On utilise ADMIN_EMAIL car la variable .env.local est ADMIN_EMAIL
        email: { label: 'Adresse e-mail', type: 'text', placeholder: 'admin@techplay.com' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: 1,
            name: 'Admin',
            email: process.env.ADMIN_EMAIL
          };
        }
        return null;
      }
    })
  ],

  session: {
    strategy: 'jwt'
  },

  pages: {
    // Page de connexion, on renvoie vers /fr/connexion
    signIn: '/fr/connexion'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET
};
