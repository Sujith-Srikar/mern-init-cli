#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { logger } from "./utils/logger.js";
import { ASTGenerator } from "./utils/ast.js";

const ast = new ASTGenerator();

async function init() {
  try {
    const { projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Enter your project name:",
        default:
          process.argv[2] ||
          "my-project (enter . if you want to setup in current directory)",
      },
    ]);

    let projectPath;
    if (projectName === ".") {
      projectPath = process.cwd();
    } else {
      projectPath = path.join(process.cwd(), projectName);
      if (fs.existsSync(projectPath)) {
        logger.error("Project already exists!");
        process.exit(1);
      }
      fs.mkdirSync(projectPath, { recursive: true });
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
      const { framework, language, cssChoice, authAccept } =
        await inquirer.prompt([
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
            message:
              "Do you want to use Clerk for authentication in your project? (Requires a Clerk account)",
            default: false,
          },
        ]);

      const frontendPath = path.join(projectPath, "client");
      fs.mkdirSync(frontendPath, { recursive: true });
      clientSetUp(framework, language, cssChoice, frontendPath, authAccept);
    }

    if (!frontendAccept) logger.info("✅Skipping frontend Setup");

    const { backendAccept } = await inquirer.prompt([
      {
        type: "confirm",
        name: "backendAccept",
        message: "Do you want to set up backend in your project?",
        default: true,
      },
    ]);

    if (!backendAccept) {
      logger.info("✅Skipping backend  Setup");
    } else {
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
    }
    generateReadme(projectPath, {
      frontend: frontendAccept,
      backend: backendAccept,
    });
    execSync("git init", { cwd: projectPath, stdio: "inherit" });
    logger.info("\n✅ Project setup complete!");
  } catch (error) {
    logger.error(`❌ An error occurred during project setup:, ${error}`);
    process.exit(1);
  }
}

function generateReadme(
  projectPath: string,
  { frontend, backend }: { frontend: boolean; backend: boolean }
) {
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
    logger.success("README.md created successfully!");
  } catch (err) {
    logger.error(`Failed to create README.md: ${err}`);
  }
}

function clientSetUp(
  framework: string,
  language: string,
  cssChoice: string,
  frontendPath: string,
  authAccept: boolean
) {
  try {
    logger.info("\n⚡ Setting up frontend...");
    process.chdir(frontendPath);

    if (framework === "React") {
      setupReactProject(language, cssChoice);
    } else if (framework === "Next.js") {
      setupNextJsProject(language, cssChoice);
    }

    if (authAccept) {
      if (framework === "React") setupReactClerk(language);
      else setupNextClerk(language);
    }
    if (framework === "React") fs.appendFileSync(".gitignore", ".env");
    logger.info("\n✅ Frontend setup complete!");
  } catch (error) {
    logger.error(`❌ Error setting up frontend:, ${error}`);
    process.exit(1);
  }
}

function setupReactProject(language: string, cssChoice: string) {
  const isTS = language === "TypeScript";
  const template = isTS ? "react-ts" : "react";

  execSync(`npm create vite@latest . -- --template ${template}`, {
    stdio: "inherit",
  });

  logger.info("\n📦 Installing React Router...");
  execSync(`npm install react-router-dom`, { stdio: "inherit" });

  setupReactRouting(isTS);

  if (cssChoice === "TailwindCSS") {
    setupTailwind(language);
  }

  fs.unlinkSync("README.md");

  execSync(`npm install`, { stdio: "inherit" });
}

function setupReactRouting(isTS: boolean) {
  try {
    logger.info("\n🛠 Setting up React Router...");

    const ext = isTS ? "tsx" : "jsx";

    const routerCode = ast.generateCode(
      isTS ? "reactRouterTS" : "reactRouterJS"
    );

    fs.writeFileSync(`src/main.${ext}`, routerCode);

    const appCode = ast.generateCode("homePage");
    fs.writeFileSync(`src/App.${ext}`, appCode);

    const cssFilePath = path.join(process.cwd(), "src", "App.css");
    fs.writeFileSync(cssFilePath, ast.generateCode("reactAppCSS"));
    logger.success("React Router setup complete!");
  } catch (error) {
    logger.error(`❌ Error setting up React Router: ${error}`);
  }
}

function setupTailwind(language: string) {
  try {
    logger.info("\n📦 Installing TailwindCSS...");
    execSync(`npm i tailwindcss @tailwindcss/vite`);
    const configFileName =
      language === "JavaScript" ? "vite.config.js" : "vite.config.ts";

    const configContent = ast.generateCode("tailwindConfig");

    fs.writeFileSync(configFileName, configContent);

    const cssFilePath = path.join(process.cwd(), "src", "index.css");
    if (fs.existsSync(cssFilePath)) {
      fs.writeFileSync(cssFilePath, `@import "tailwindcss";`);
    }
  } catch (error) {
    logger.error(`❌ Error setting up TailwindCSS: ${error}`);
  }
}

function setupReactClerk(language: string) {
  const isTS = language === "TypeScript";

  logger.info("\n📦 Installing Clerk...");

  execSync(`npm install @clerk/clerk-react`, { stdio: "inherit" });
  fs.appendFileSync(
    ".env",
    `VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY\n`
  );

  const mainCode = ast.generateCode(isTS ? "reactClerkTS" : "reactClerkJS");
  fs.writeFileSync(`src/main.${isTS ? "tsx" : "jsx"}`, mainCode);

  fs.writeFileSync(
    `src/App.${isTS ? "tsx" : "jsx"}`,
    ast.generateCode("reactClerkHome")
  );

  const cssFilePath = path.join(process.cwd(), "src", "App.css");
  fs.appendFileSync(
    cssFilePath,
    `
  header {
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

function setupNextJsProject(language: string, cssChoice: string) {
  const isTS = language === "TypeScript";
  const tsFlag = isTS ? "--typescript" : "--javascript";
  const cssFlag = cssChoice === "TailwindCSS" ? "--tailwind" : "";

  execSync(
    `npx create-next-app@latest . ${tsFlag} --use-npm --eslint --src-dir --app ${cssFlag} --no-import-alias --yens --turbopack`,
    { stdio: "inherit" }
  );

  setupNextJsRouting(isTS);
  fs.unlinkSync("README.md");
  execSync(`npm install`, { stdio: "inherit" });
}

function setupNextJsRouting(isTS: boolean) {
  try {
    logger.info("\n🛠 Setting up Next.js routing...");

    const ext = isTS ? "tsx" : "js";
    const pagesDir = "src/app";

    const nextCode = ast.generateCode("nextHome");
    fs.writeFileSync(`${pagesDir}/page.${ext}`, nextCode);

    const globalsCss = ast.generateCode("nextGlobalCSS");
    fs.appendFileSync(`${pagesDir}/globals.css`, globalsCss);

    logger.info("\n✅ Next.js routing setup complete!");
  } catch (error) {
    logger.error(`❌ Error setting up Next.js routing: ${error}`);
  }
}

function setupNextClerk(language: string) {
  try {
    const isTS = language === "TypeScript";
    execSync(`npm install @clerk/nextjs`, { stdio: "inherit" });
    fs.appendFileSync(
      ".env",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY\nCLERK_SECRET_KEY=YOUR_SECRET_KEY\n"
    );
    const srcDir = path.join(process.cwd(), "src");
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }
    const middlewareExt = isTS ? "ts" : "js";
    const middlewarePath = path.join(srcDir, `middleware.${middlewareExt}`);
    const middlewareContent = ast.generateCode("nextClerkMiddleware");

    fs.writeFileSync(middlewarePath, middlewareContent);
    const appDir = path.join(srcDir, "app");
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir);
    }
    const compExt = isTS ? "tsx" : "js";
    const layoutPath = path.join(appDir, `layout.${compExt}`);
    const layoutContent = ast.generateCode("nextClerkLayout");
    fs.writeFileSync(layoutPath, layoutContent);

    const pagePath = path.join(appDir, `page.${compExt}`);
    const pageContent = ast.generateCode("nextPage");
    fs.writeFileSync(pagePath, pageContent);

    const globalsCssPath = path.join(appDir, "globals.css");
    const headerStyles = ast.generateCode("nextCss");
    fs.appendFileSync(globalsCssPath, headerStyles);

    logger.info("\n✅ Next.js Clerk setup complete!");
  } catch (error) {
    logger.error(`❌ Error setting up Next.js Clerk: ${error}`);
    process.exit(1);
  }
}

// ------------ Backend Setup -----------

function serverSetUp(
  backendPath: string,
  serverlanguage: string,
  database: string
) {
  try {
    logger.info("\n⚡ Setting up backend...");
    process.chdir(backendPath);

    execSync("npm init -y", { stdio: "inherit" });

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
      dev: isTS ? "nodemon" : "nodemon src/index.js",
    };

    fs.writeFileSync(
      backendPackageJsonPath,
      JSON.stringify(backendPackageJson, null, 2)
    );

    execSync("npm i express dotenv cors nodemon", { stdio: "inherit" });

    if (isTS) {
      installTSDependencies();
      createTSConfig();
    }

    createSrcStructure();

    const fileType = isTS ? "ts" : "js";
    createIndexFile(fileType, database);
    createEnvFile(backendPath);
    if (database !== "None") setupDatabaseConfig(database, fileType, isTS);

    fs.writeFileSync(
      path.join(backendPath, ".gitignore"),
      "node_modules\ndist\n.env\nfirebaseServiceAccount.json"
    );

    logger.info("\n✅ Backend setup complete!");
  } catch (error) {
    logger.error(`❌ Error setting up backend:, ${error}`);
    process.exit(1);
  }
}

function installTSDependencies() {
  try {
    const nodemonJSONcontent = ast.generateCode("nodemonJSON");

    fs.writeFileSync("nodemon.json", nodemonJSONcontent);
    execSync(
      "npm install --save-dev typescript ts-node @types/node @types/express @types/cors",
      { stdio: "inherit" }
    );
  } catch (error) {
    logger.error(`❌ Error installing TypeScript dependencies: ${error}`);
    process.exit(1);
  }
}

function createTSConfig() {
  const tsConfigContent = ast.generateCode("tsConfig");
  fs.writeFileSync("tsconfig.json", JSON.stringify(tsConfigContent, null, 2));
}

function createSrcStructure() {
  const srcPath = path.join(process.cwd(), "src");
  if (!fs.existsSync(srcPath)) fs.mkdirSync(srcPath);
  process.chdir(srcPath);

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

function createIndexFile(fileType: string, database: string) {
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
    logger.error(`Error creating index file:, ${error}`);
  }
}

function createEnvFile(backendPath: string) {
  const envPath = path.join(backendPath, ".env");
  const envContent = `PORT=8000\n`;
  fs.writeFileSync(envPath, envContent, { flag: "w" });
}

function setupDatabaseConfig(
  database: string,
  fileType: string,
  isTS: boolean
) {
  if (database === "MongoDB") {
    execSync("npm i mongoose", { stdio: "inherit" });
    const envPath = path.join(process.cwd(), "..", ".env");
    fs.appendFileSync(
      envPath,
      `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<databaseName>?retryWrites=true&w=majority\n`
    );
    const dbConfigFile = `db.config.${fileType}`;
    const dbConfigPath = path.join(process.cwd(), "config", dbConfigFile);
    const dbConfigContent = isTS
      ? ast.generateCode("mongooseTS")
      : ast.generateCode("mongooseJS");
    fs.writeFileSync(dbConfigPath, dbConfigContent);
  } else if (database === "FireBase") {
    execSync("npm i firebase-admin", { stdio: "inherit" });
    const dbConfigFile = `db.config.${fileType}`;
    const dbConfigPath = path.join(process.cwd(), "config", dbConfigFile);
    const firebaseContent = ast.generateCode("firebaseConfig");
    fs.writeFileSync(dbConfigPath, firebaseContent);
    const envPath = path.join(process.cwd(), "..", ".env");
    fs.appendFileSync(
      envPath,
      "FIREBASE_SERVICE_ACCOUNT=`your-firebase-service-account-json keep in quotes`\n"
    );
  } else if (database === "SupaBase") {
    execSync("npm i @supabase/supabase-js", { stdio: "inherit" });
    const dbConfigFile = `db.config.${fileType}`;
    const dbConfigPath = path.join(process.cwd(), "config", dbConfigFile);
    const supabaseContent = ast.generateCode("supabaseConfig");
    fs.writeFileSync(dbConfigPath, supabaseContent);
    const envPath = path.join(process.cwd(), "..", ".env");
    fs.appendFileSync(
      envPath,
      "SUPABASE_URL=https://your-supabase-url\nSUPABASE_ANON_KEY=your-supabase-key\n"
    );
  }
}

init();
