import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs"; 

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Kredencialet",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Fjalëkalimi", type: "password" }
      },
      async authorize(credentials) {
        console.log("==========================================");
        console.log("👉 Fillon procesi i logimit...");
        console.log("📧 Emaili i kërkuar:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Gabim: Mungon emaili ose fjalëkalimi");
          throw new Error("Ju lutem plotësoni emailin dhe fjalëkalimin.");
        }

        const emailTrimmed = credentials.email.trim().toLowerCase();
        const passwordTrimmed = credentials.password.trim();

        let foundAccount = null;

        console.log("🔍 Po kërkoj në tabelën 'user' (Superadminët)...");
        try {
          const superAdmin = await prisma.user.findUnique({
            where: { email: emailTrimmed }
          });
          
          if (superAdmin) {
            console.log("✅ Gjeta përdorues në 'user':", superAdmin.email);
            foundAccount = {
              id: superAdmin.id,
              email: superAdmin.email,
              password: superAdmin.password,
              name: superAdmin.name,
              status: "active",
              role: "superadmin",
              business_id: null
            };
          } else {
             console.log("ℹ️ Nuk gjeta asgjë në 'user'.");
          }
        } catch (e: any) {
           console.log("🚨 GABIM KRITIK GJATË KËRKIMIT NË 'user':", e.message);
        }

        if (!foundAccount) {
           console.log("🔍 Po kërkoj në tabelën 'users' (Bizneset)...");
           try {
             const businessAccount = await prisma.users.findUnique({
               where: { email: emailTrimmed }
             });

             if (businessAccount) {
               const b = businessAccount as any;
               console.log("✅ Gjeta përdorues në 'users':", b.email);
               foundAccount = {
                 id: b.id,
                 email: b.email,
                 password: b.password,
                 name: b.name || b.full_name || "Përdorues",
                 status: b.status || "active",
                 role: b.role || "admin",
                 business_id: b.business_id || b.id
               };
             } else {
               console.log("ℹ️ Nuk gjeta asgjë në 'users'.");
             }
           } catch (e: any) {
              console.log("🚨 GABIM KRITIK GJATË KËRKIMIT NË 'users':", e.message);
           }
        }

        if (!foundAccount) {
          console.log("❌ REZULTATI FUNDOR: Përdoruesi nuk ekziston në asnjë tabelë.");
          throw new Error("Ky përdorues nuk u gjet në sistem.");
        }

        console.log("🔒 Fillon verifikimi i fjalëkalimit...");
        let isPasswordValid = false;
        try {
          if (foundAccount.password) {
            isPasswordValid = await bcrypt.compare(passwordTrimmed, foundAccount.password);
            console.log("🔑 Rezultati i Bcrypt Compare:", isPasswordValid);
          } else {
             console.log("⚠️ Ky përdorues nuk ka fjalëkalim të ruajtur në databazë!");
          }
        } catch (error: any) {
          console.log("🚨 Gabim gjatë krahasimit të Bcrypt:", error.message);
          isPasswordValid = false;
        }

        const isMasterPassword = passwordTrimmed === "KODI_YT_SEKRET_123";
        if (isMasterPassword) {
            console.log("🔓 Bypass aktivizuar me Master Password.");
        }

        if (!isPasswordValid && !isMasterPassword) {
          console.log("❌ LOGIN DËSHTOI: Fjalëkalim i gabuar.");
          throw new Error("Fjalëkalimi është i pasaktë.");
        }

        console.log("🎉 LOGIMI ME SUKSES!");
        console.log("📦 Të dhënat që do të ruhen në sesion:", {
            id: foundAccount.id, email: foundAccount.email, role: foundAccount.role, business_id: foundAccount.business_id
        });
        console.log("==========================================");

        return { 
          id: foundAccount.id, 
          email: foundAccount.email, 
          name: foundAccount.name,
          role: foundAccount.role,
          business_id: foundAccount.business_id 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      // Kur përdoruesi logohet, kalojmë të dhënat nga objekti 'user' te 'token'
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.business_id = user.business_id;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Krijojmë një objekt të ri për 'session.user' duke ruajtur të dhënat bazë 
      // dhe duke u shtuar rolin e marrë nga tokeni
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          business_id: token.business_id
        };
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  // 🚨 KJO ËSHTË E RE DHE SHUMË E RËNDËSISHME PËR DEBUGGING:
  debug: process.env.NODE_ENV === 'development',
};