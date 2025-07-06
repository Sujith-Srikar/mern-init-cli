import { parse, ParserPlugin } from "@babel/parser";
import * as t from "@babel/types";
import { logger } from "./logger.js";
import generate from "@babel/generator";
import fs from "fs";
import path from "path";

interface TemplateConfig {
  code: string;
  plugins: ParserPlugin[];
}

interface TemplateCollection {
  [key: string]: TemplateConfig;
}

interface PlainTemplateCollection {
  [key: string]: string;
}

const TEMPLATES: TemplateCollection = {
  reactRouerJS: {
    code: `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);`,
    plugins: ["jsx"],
  },
  reactRouterTS: {
    code: `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);`,
    plugins: ["jsx", "typescript"],
  },

  homePage: {
    code: `import { Routes, Route } from "react-router-dom";
import "./App.css";

const Home = () => {
  return (
    <div className="container">
      <h1>Welcome to mern-init-cli Package</h1>
      <p>A simple CLI tool to set up a MERN stack project effortlessly.</p>
    </div>
  );
}

const App = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
  );
};

export default App;`,
    plugins: ["jsx", "typescript"],
  },

  tailwindConfig: {
    code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
  
export default defineConfig({
  plugins: [react(), tailwindcss()],
});`,
    plugins: ["jsx", "typescript"],
  },

  reactClerkJS: {
    code: `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);`,
    plugins: ["jsx", "typescript"],
  },

  reactClerkTS: {
    code: `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);`,
    plugins: ["jsx", "typescript"],
  },

  reactClerkHome: {
    code: `import { Routes, Route } from "react-router-dom";
import "./App.css";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

const Home = () => {
  return (
    <div className="container">
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton  />
        </SignedIn>
      </header>
      <h1>Welcome to mern-init-cli Package</h1>
      <p>A simple CLI tool to set up a MERN stack project effortlessly.</p>
    </div>
  );
}

const App = () => {
  return (
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
      </Routes>
  );
};

export default App;`,
    plugins: ["jsx", "typescript"],
  },

  nextHome: {
    code: `"use client"

export default function Home() {
  return (
    <div className="container">
      <h1>Welcome to mern-init-cli Package</h1>
      <p>A simple CLI tool to set up a MERN stack project effortlessly.</p>
    </div>
  );
}`,
    plugins: ["jsx", "typescript"],
  },

  nextClerkMiddleware: {
    code: `import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};`,
    plugins: ["jsx", "typescript"],
  },

  nextClerkLayout: {
    code: `import type { Metadata } from "next";
import {ClerkProvider} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clerk Next.js Quickstart",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
           className={\`\$\{geistSans.variable\} \$\{geistMono.variable\} antialiased\`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}`,
    plugins: ["jsx", "typescript"],
  },

  nextPage: {
    code: `"use client"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
export default function Home() {
  return (
    <div className="container">
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <h1>Welcome to mern-init-cli Package</h1>
      <p>A simple CLI tool to set up a MERN stack project effortlessly.</p>
    </div>
  );
}`,
    plugins: ["jsx", "typescript"],
  },

  mongooseTS: {
    code: `import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;`,
    plugins: ["typescript"],
  },

  mongooseJS: {
    code: `import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;`,
    plugins: ["typescript"],
  },

  firebaseConfig: {
    code: `import admin from "firebase-admin";
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

if (!db) {
  console.log('❌ Firebase initialization failed');
} else {
  console.log('✅ Firebase initialized');
}

export default db;`,
    plugins: ["typescript"],
  },

  supabaseConfig: {
    code: `import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client created');

export default supabase;`,
    plugins: ["typescript"],
  },
};

const PLAIN_TEMPLATES: PlainTemplateCollection = {
  Appcss: `body {
  margin: 0;
  padding: 0;
  background-color: #121212;
  color: #ffffff;
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
}

.container {
  max-width: 600px;
  padding: 20px;
  border-radius: 10px;
}`,

  nextGlobalCSS: `body {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
}

.container {
  max-width: 600px;
  padding: 20px;
  border-radius: 10px;
}`,

  nextCss: `header {
  position: absolute;
  top: 30px;
  right: 30px;
  background-color: white;
  color: black;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  gap: 8px;
}`,

  reactAppCSS: `body {
        margin: 0;
        padding: 0;
        background-color: #121212;
        color: #ffffff;
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        text-align: center;
      }
      
      h1 {
        font-size: 2rem;
        font-weight: bold;
      }
      
      .container {
        max-width: 600px;
        padding: 20px;
        border-radius: 10px;
      }`,

  nodemonJSON: `{
  "watch": ["src"],
  "ext": "ts",
  "exec": "node --loader ts-node/esm src/index.ts"
}`,

  tsConfig: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": true,
    "types": ["node"],
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "incremental": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}`,
};

const cachedASTs = new Map<string, t.File>();

function generateAST() {
  try {
    for (const [key, template] of Object.entries(TEMPLATES)) {
      const ast = parse(template.code, {
        sourceType: "module",
        plugins: template.plugins,
      });
      cachedASTs.set(key, ast);
    }
  } catch (error) {
    logger.error(`Error generating AST:, ${error}`);
  }
}

function generateAllCode() {
  try {
    for (const [key, ast] of cachedASTs) {
      console.log(`Generating code for ${key}...\n`);
      console.log(generate.default(ast).code + "\n\n");
    }
  } catch (error) {
    logger.error(`Error generating code: ${error}`);
  }
}
if (cachedASTs == null) {
  generateAST();
}
// generateAllCode();

export { cachedASTs, PLAIN_TEMPLATES };
