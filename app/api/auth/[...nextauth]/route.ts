// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
// Përdorimi i '@/' e gjen gjithmonë dosjen 'lib' pavarësisht sa thellë është ky skedar
import { authOptions } from "@/lib/auth"; 

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };