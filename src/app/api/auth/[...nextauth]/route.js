import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbconnect from "../../../lib/dbConnect";
import User from "../../../models/User";

// Auto-detect the correct URL: works on localhost AND Vercel without manual NEXTAUTH_URL
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

const isProduction = process.env.NODE_ENV === "production";

const handler = NextAuth({
  providers: [
    // Google Authentication
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),

    // Email & Password Authentication
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbconnect();
        const user = await User.findOne({ email: credentials.email }).select("+password");

        // Use a generic error to prevent user-enumeration attacks
        // (don't reveal whether the email or password was wrong)
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          isAdmin: user.admin ?? false,
          isLawyer: user.islaywer ?? false,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        await dbconnect();
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = new User({
            email: user.email,
            username: user.name || user.email.split("@")[0],
            password: null,
          });
          await existingUser.save();
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        // Store essential claims in the token so middleware can use them
        // without hitting the database on every request
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
        token.isLawyer = user.isLawyer;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.isAdmin = token.isAdmin;
      session.user.isLawyer = token.isLawyer;
      return session;
    },
  },

  // Tell NextAuth where your custom pages live
  pages: {
    signIn: "/Login",
    error: "/Login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // Fix cookie so it works correctly on both localhost (http) and Vercel (https)
  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },

  // Use auto-detected URL
  ...(process.env.VERCEL_URL && !process.env.NEXTAUTH_URL
    ? { url: getBaseUrl() }
    : {}),
});

export { handler as GET, handler as POST };
