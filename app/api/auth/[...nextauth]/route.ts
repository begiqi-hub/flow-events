import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Kredencialet",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@flow-events.com" },
        password: { label: "Fjalëkalimi", type: "password" }
      },
      async authorize(credentials) {
        // Kontrollojmë nëse ka futur të dhëna
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Kërkojmë përdoruesin në databazë
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null; // Nuk u gjet emaili
        }

        // Kontrollojmë fjalëkalimin
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null; // Fjalëkalim i gabuar
        }

        // Nëse gjithçka është OK, e lejojmë të futet
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login', // Këtu i themi që faqja e hyrjes do të quhet /login
  }
});

export { handler as GET, handler as POST };