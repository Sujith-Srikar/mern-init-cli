#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

async function init() {
  try {
    const { projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Enter your project name:",
        default: process.argv[2] || "my-project",
      },
    ]);

    const projectPath = path.join(process.cwd(), projectName);
    if (fs.existsSync(projectPath)) {
      console.error("Project already exists!");
      process.exit(1);
    }

    fs.mkdirSync(projectPath, { recursive: true });

    const { frontendAccept } = await inquirer.prompt([
      {
        type: "confirm",
        name: "frontendAccept",
        message: "Do you want to set up frontend in your project?",
        default: true,
      },
    ]);

    if (frontendAccept) {
      const { framework, language, cssChoice, authAccept } = await inquirer.prompt([
        {
          type: "list",
          name: "framework",
          message: "Choose your frontend framework:",
          choices: ["React", "Next.js"],
          default: "React",
        },
        {
          type: "list",
          name: "language",
          message: "Choose your frontend language:",
          choices: ["JavaScript", "TypeScript"],
          default: "JavaScript",
        },
        {
          type: "list",
          name: "cssChoice",
          message: "Choose your CSS framework:",
          choices: ["TailwindCSS", "Vanilla CSS"],
          default: "TailwindCSS",
        },
        {
          type: "confirm",
          name: "authAccept",
          message: "Do you want to use Clerk for authentication in your project? (Requires a Clerk account)",
          default: false,
        }
      ]);

      const frontendPath = path.join(projectPath, "client");
      fs.mkdirSync(frontendPath, { recursive: true });
      clientSetUp(framework, language, cssChoice, frontendPath, authAccept);
    }

    if(!frontendAccept)
      console.log("✅Skipping frontend Setup");

    const { backendAccept } = await inquirer.prompt([
      {
        type: "confirm",
        name: "backendAccept",
        message: "Do you want to set up backend in your project?",
        default: true,
      },
    ]);

    if (!backendAccept) {
      console.log("✅Skipping backend  Setup");
      process.exit(0);
    }

    const { serverlanguage } = await inquirer.prompt([
      {
        type: "list",
        name: "serverlanguage",
        message: "Choose your backend language:",
        choices: ["JavaScript", "TypeScript"],
        default: "JavaScript",
      },
    ]);

    const { database } = await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: "Choose your database:",
        choices: ["MongoDB", "FireBase", "SupaBase", "None"],
        default: "MongoDB",
      },
    ]);

    const backendPath = path.join(projectPath, "server");
    fs.mkdirSync(backendPath, { recursive: true });
    serverSetUp(backendPath, serverlanguage, database);

    generateReadme(projectPath, {
      frontend: frontendAccept,
      backend: backendAccept,
    });
    execSync("git init", { cwd: projectPath, stdio: "inherit" });
    console.log("\n✅ Project setup complete!");
  } catch (error) {
    console.error("❌ An error occurred during project setup:", error.message);
    process.exit(1);
  }
}

function generateReadme(projectPath, { frontend, backend }) {
  const readmeContent = `# ${path.basename(projectPath)}

This project was generated using our custom project scaffolding tool. It includes:

${
  frontend
    ? "- A frontend project (React or Next.js) with optional TailwindCSS setup.\n"
    : ""
}
${
  backend
    ? "- A backend project (JavaScript/TypeScript) with Express and a database configuration.\n"
    : ""
}

## Setup Instructions

### Frontend
${
  frontend
    ? `1. Navigate to the client folder: \`cd ${path.join(".", "client")}\`
    2. Update the \`.env\` file with your configuration:
3. Run the development server: \`npm run dev\`
`
    : "No frontend setup was performed."
}

### Backend
${
  backend
    ? `1. Navigate to the server folder: \`cd ${path.join(".", "server")}\`
2. Update the \`.env\` file with your configuration:

   - For MongoDB, set \`MONGODB_URI\` (e.g., \`mongodb+srv://<username>:<password>@cluster0.mongodb.net/<databaseName>?retryWrites=true&w=majority\`)
   - For FireBase, set \`FIREBASE_SERVICE_ACCOUNT\` and \`FIREBASE_DATABASE_URL\`
   - For SupaBase, set \`SUPABASE_URL\` and \`SUPABASE_KEY\`

3. Run the development server: \`npm run dev\`
`
    : "No backend setup was performed."
}

## Notes
- Ensure you have Node.js installed.
- For any environment variables required, please update the \`.env\` file in the respective folders.
- For more details, refer to the documentation in each project folder.
`;

  try {
    fs.writeFileSync(path.join(projectPath, "README.md"), readmeContent);
    console.log("\nREADME.md created in the project root.");
  } catch (err) {
    console.error("Failed to create README.md:", err.message);
  }
}

function clientSetUp(framework, language, cssChoice, frontendPath, authAccept) {
  try {
    console.log("\n⚡ Setting up frontend...");
    process.chdir(frontendPath);

    if (framework === "React") {
      setupReactProject(language, cssChoice);
    } else if (framework === "Next.js") {
      setupNextJsProject(language, cssChoice);
    }

    if(authAccept){
      if(framework === "React")
        setupReactClerk(language);
      else setupNextClerk(language);
    }

    fs.appendFileSync(".gitignore", ".env");
    console.log("\n✅ Frontend setup complete!");
  } catch (error) {
    console.error("❌ Error setting up frontend:", error.message);
    process.exit(1);
  }
}

function setupReactProject(language, cssChoice) {
  const isTS = language === "TypeScript";
  const template = isTS ? "react-ts" : "react";

  execSync(`npm create vite@latest . -- --template ${template}`, {
    stdio: "inherit",
  });

  console.log("\n📦 Installing React Router...");
  execSync(`npm install react-router-dom`, { stdio: "inherit" });

  setupReactRouting(isTS);

  if (cssChoice === "TailwindCSS") {
    setupTailwind(language);
  }

  execSync(`npm install`, { stdio: "inherit" });
}

function setupReactRouting(isTS) {
  console.log("\n🛠 Setting up React Router...");

  const ext = isTS ? "tsx" : "jsx";

  fs.writeFileSync(
    `src/main.${ext}`,
    `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")${isTS ? "!" : ""}).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);`
  );

  fs.writeFileSync(
    `src/App.${ext}`,
    `import { Routes, Route } from "react-router-dom";
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

export default App;`
  );
  const cssFilePath = path.join(process.cwd(), "src", "App.css");
  fs.writeFileSync(
    cssFilePath,
    `body {
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
}`
  );

}

function setupReactClerk(language) {
  const isTS = language === "TypeScript";

  console.log("\n📦 Installing Clerk...");

  execSync(`npm install @clerk/clerk-react}`, {stdio: "inherit"});
  fs.appendFileSync(".env", `VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY\n`);

  fs.writeFileSync(
    `src/main.${isTS ? "tsx" : "jsx"}`,
    `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

ReactDOM.createRoot(document.getElementById("root")${isTS ? "!" : ""}).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);`);

  fs.writeFileSync(
    `src/App.${isTS ? "tsx" : "jsx"}`,
    `
    import { Routes, Route } from "react-router-dom";
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

export default App;`
  );

  const cssFilePath = path.join(process.cwd(), "src", "App.css");
  fs.appendFileSync(
    cssFilePath,
    `header {
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
}`
  );
}

function setupTailwind(language) {
  console.log("\n📦 Installing TailwindCSS...");
  execSync(`npm i tailwindcss @tailwindcss/vite`);
  const configFileName =
    language === "JavaScript" ? "vite.config.js" : "vite.config.ts";

  const configContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
  
export default defineConfig({
  plugins: [react(), tailwindcss()],
});`;

  fs.writeFileSync(configFileName, configContent);

  const cssFilePath = path.join(process.cwd(), "src", "index.css");
  if (fs.existsSync(cssFilePath)) {
    fs.writeFileSync(
      cssFilePath,
      `@import "tailwindcss";`
    );
  }
}

function setupNextJsProject(language, cssChoice) {
  const isTS = language === "TypeScript";
  const tsFlag = isTS ? "--typescript" : "--javascript";
  const cssFlag = cssChoice === "TailwindCSS" ? "--tailwind" : "";

  execSync(
    `npx create-next-app@latest . ${tsFlag} --use-npm --eslint --src-dir --app ${cssFlag} --no-import-alias --yens`,
    { stdio: "inherit" }
  );

  setupNextJsRouting(isTS);

  execSync(`npm install`, { stdio: "inherit" });
}

function setupNextJsRouting(isTS) {
  console.log("\n🛠 Setting up Next.js routing...");

  const ext = isTS ? "tsx" : "js";
  const pagesDir = "src/app";

  fs.writeFileSync(
    `${pagesDir}/page.${ext}`,
    `"use client"

export default function Home() {
  return (
    <div className="container">
      <h1>Welcome to mern-init-cli Package</h1>
      <p>A simple CLI tool to set up a MERN stack project effortlessly.</p>
    </div>
  );
}`
  );

  fs.appendFileSync(
    `${pagesDir}/globals.css`,
    `body {
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
}
    `
  );

  console.log("\n✅ Next.js routing setup complete!");
}

function setupNextClerk(language){
  try {
    
    const isTS = language === "TypeScript";
    execSync(`npm install @clerk/nextjs`, { stdio: "inherit" });
    fs.appendFileSync(
      ".env",
      "\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY\n"
    );
    const srcDir = path.join(process.cwd(), "src");
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }
    const middlewareExt = isTS ? "ts" : "js";
    const middlewarePath = path.join(srcDir, `middleware.${middlewareExt}`);
    const middlewareContent = `import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
`;
    fs.writeFileSync(middlewarePath, middlewareContent);
    console.log(`Created: ${middlewarePath}`);
    const appDir = path.join(srcDir, "app");
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir);
    }
    const compExt = isTS ? "tsx" : "jsx";
    const layoutPath = path.join(appDir, `layout.${compExt}`);
    const layoutContent = `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
} from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
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
          className={\`${geistSans.variable} ${geistMono.variable} antialiased\`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
`
    fs.writeFileSync(layoutPath, layoutContent);
    console.log(`Created: ${layoutPath}`);

    // Create page file in src/app as the Home page
    const pagePath = path.join(appDir, `page.${compExt}`);
    const pageContent = `"use client";

export default function Home() {
  return (
    <div className="container">
      <h1>Welcome to mern-init-cli Package</h1>
      <p>A simple CLI tool to set up a MERN stack project effortlessly.</p>
    </div>
  );
}
`;
    fs.writeFileSync(pagePath, pageContent);
    console.log(`Created: ${pagePath}`);

    // Append header styles to globals.css in src directory
    const globalsCssPath = path.join(srcDir, "globals.css");
    const headerStyles = `
/* Header styles for Clerk buttons */
.clerk-header {
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
}
`;
    if (fs.existsSync(globalsCssPath)) {
      fs.appendFileSync(globalsCssPath, headerStyles);
      console.log(`Appended styles to: ${globalsCssPath}`);
    } else {
      fs.writeFileSync(globalsCssPath, headerStyles);
      console.log(`Created: ${globalsCssPath}`);
    }

    console.log("\n✅ Next.js Clerk setup complete!");
  } catch (error) {
    console.error("❌ Error setting up Next.js Clerk:", error.message);
    process.exit(1);
  }
}

function serverSetUp(backendPath, serverlanguage, database) {
  try {
    console.log("\n⚡ Setting up backend...");
    process.chdir(backendPath);

    // Initialize npm package
    execSync("npm init -y", { stdio: "inherit" });

    // Modify package.json to use ES modules
    const backendPackageJsonPath = path.join(process.cwd(), "package.json");
    const backendPackageJson = JSON.parse(
      fs.readFileSync(backendPackageJsonPath, "utf-8")
    );
    backendPackageJson.type = "module";
    fs.writeFileSync(
      backendPackageJsonPath,
      JSON.stringify(backendPackageJson, null, 2)
    );

    const isTS = serverlanguage === "TypeScript";
    backendPackageJson.scripts = {
      ...backendPackageJson.scripts,
      dev: isTS
        ? "nodemon"
        : "nodemon src/index.js",
    };

    fs.writeFileSync(
      backendPackageJsonPath,
      JSON.stringify(backendPackageJson, null, 2)
    );

    // Install core dependencies
    execSync("npm i express dotenv cors nodemon", { stdio: "inherit" });

    if (isTS) {
      installTSDependencies();
      createTSConfig();
    }

    createSrcStructure();

    // Now we are in the "src" folder.
    const fileType = isTS ? "ts" : "js";
    createIndexFile(fileType, database);
    createEnvFile(backendPath);
    if(database !== "None")
      setupDatabaseConfig(database, fileType, isTS);

    // Create .gitignore in the backend folder
    fs.writeFileSync(
      path.join(backendPath, ".gitignore"),
      "node_modules\ndist\n.env\nfirebaseServiceAccount.json"
    );

    console.log("\n✅ Backend setup complete!");
  } catch (error) {
    console.error("❌ Error setting up backend:", error);
    process.exit(1);
  }
}

function installTSDependencies() {
  try {
    const nodemonJSONcontent = `{
  "watch": ["src"],
  "ext": "ts",
  "exec": "node --loader ts-node/esm src/index.ts"
}`;

    fs.writeFileSync("nodemon.json", nodemonJSONcontent);
    execSync(
      "npm install --save-dev typescript ts-node @types/node @types/express @types/cors",
      { stdio: "inherit" }
    );
  } catch (error) {
    console.error(
      "❌ Error installing TypeScript dependencies:",
      error.message
    );
    process.exit(1);
  }
}

function createTSConfig() {
  const tsConfigContent = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Node",
      strict: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
      isolatedModules: true,
      resolveJsonModule: true,
      outDir: "./dist",
      rootDir: "./src",
      noEmit: true,
      types: ["node"],
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      incremental: true,
    },
    include: ["src/**/*.ts"],
    exclude: ["node_modules", "dist"],
  };
  fs.writeFileSync("tsconfig.json", JSON.stringify(tsConfigContent, null, 2));
}

function createSrcStructure() {
  // Create and move into the "src" folder
  const srcPath = path.join(process.cwd(), "src");
  if (!fs.existsSync(srcPath)) fs.mkdirSync(srcPath);
  process.chdir(srcPath);

  // Create subfolders under "src"
  const folders = [
    "models",
    "controllers",
    "routes",
    "middlewares",
    "utils",
    "config",
  ];
  folders.forEach((folder) => {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  });
}

function createIndexFile(fileType, database) {
  try {
    let importStatement = "";
    let connectCall = "";

    if (database === "MongoDB") {
      importStatement = `import connectDB from './config/db.config.${fileType}';`;
      connectCall = `  connectDB();`;
    } else if (database === "FireBase") {
      importStatement = `import db from './config/db.config.${fileType}';`;
    } else if (database === "SupaBase") {
      importStatement = `import supabase from './config/db.config.${fileType}';`;
    } else {
      throw new Error("Unsupported database type");
    }

    const indexContent = `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
${importStatement}

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
${connectCall}
  console.log(\`🚀 Server started on port: \${PORT}\`);
});
`;

    fs.writeFileSync(`index.${fileType}`, indexContent);
  } catch (error) {
    console.error("Error creating index file:", error);
  }
}

function createEnvFile(backendPath) {
  const envPath = path.join(backendPath, ".env");
  const envContent = `PORT=8000\n`;
  fs.writeFileSync(envPath, envContent, { flag: "w" });
}

function setupDatabaseConfig(database, fileType, isTS) {
  if (database === "MongoDB") {
    execSync("npm i mongoose", { stdio: "inherit" });
    // Append MongoDB URI to the .env file in backend folder
    const envPath = path.join(process.cwd(), "..", ".env");
    fs.appendFileSync(
      envPath,
      `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<databaseName>?retryWrites=true&w=majority\n`
    );
    // Write DB config file inside the "config" folder (current dir is "src")
    const dbConfigFile = `db.config.${fileType}`;
    const dbConfigPath = path.join(process.cwd(), "config", dbConfigFile);
    const dbConfigContent = isTS
      ? `import mongoose from 'mongoose';
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

export default connectDB;
`
      : `
import mongoose from 'mongoose';
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

export default connectDB;
`;
    fs.writeFileSync(dbConfigPath, dbConfigContent);
  } else if (database === "FireBase") {
    execSync("npm i firebase-admin", { stdio: "inherit" });
    const dbConfigFile = `db.config.${fileType}`;
    const dbConfigPath = path.join(process.cwd(), "config", dbConfigFile);
    const firebaseContent = `import * as admin from 'firebase-admin';
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

export default db;
`;
    fs.writeFileSync(dbConfigPath, firebaseContent);
    const envPath = path.join(process.cwd(), "..", ".env");
    fs.appendFileSync(
      envPath,
      "FIREBASE_SERVICE_ACCOUNT=`your-firebase-service-account-json keep in quotes`\n"
    );
  } else if (database === "SupaBase") {
    const dbConfigFile = `db.config.${fileType}`;
    const dbConfigPath = path.join(process.cwd(), "config", dbConfigFile);
    const supabaseContent = `import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client created');

export default supabase;
`;
    fs.writeFileSync(dbConfigPath, supabaseContent);
    const envPath = path.join(process.cwd(), "..", ".env");
    fs.appendFileSync(
      envPath,
      "SUPABASE_URL=https://your-supabase-url\nSUPABASE_KEY=your-supabase-key\n"
    );
  }
}

init();