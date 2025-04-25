// #!/usr/bin/env node

// import templateModule from "@babel/template";
// import generateModule from "@babel/generator";
// import * as t from "@babel/types";
// import fs from "fs";
// import path from "path";
// import inquirer from "inquirer";
// import { execSync, spawn } from "child_process";

// const CONFIG = {
//   templates: {
//     reactRouterJs: {
//       plugins: ["jsx"],
//       code: `
// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App";
// import "./index.css";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// );`,
//     },
//     reactRouterTs: {
//       plugins: ["jsx", "typescript"],
//       code: `
// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App";
// import "./index.css";

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// );`,
//     },
//   },
//   commands: {
//     createReact: "npm create vite@latest . -- --template react",
//     installRouter: "npm i react-router-dom",
//   },
// };

// const logger = {
//   info: (message) => console.log(`\x1b[36mINFO:\x1b[0m ${message}`),
//   success: (message) => console.log(`\x1b[32mSUCCESS:\x1b[0m ${message}`),
//   error: (message) => console.error(`\x1b[31mERROR:\x1b[0m ${message}`),
//   warn: (message) => console.warn(`\x1b[33mWARNING:\x1b[0m ${message}`),
// };

// function setUpReactProject(language) {
//   try {
//     const ast = new ASTGenerator();
//     const isTs = language === "typescript";
//     const template = isTs ? "react-ts" : "react";
//     fs.mkdirSync("client", { recursive: true });
//     process.chdir("client");
//     logger.info(`Setting up React project in ${process.cwd()}`);

//     logger.info("Creating Vite project...");
//     execSync(`npm create vite@latest . -- --template ${template}`, {
//       stdio: "inherit",
//     });
//     logger.success(`Vite ${template} project created successfully`);

//     logger.info("Installing React Router...");
//     execSync("npm i react-router-dom", { stdio: "inherit" });
//     logger.success("React Router installed successfully");

//     // Use the appropriate template based on language
//     const templateName = isTs ? "reactRouterTs" : "reactRouterJs";
//     const routerCode = ast.generateFromTemplate(templateName);
//     const mainFile = isTs ? "main.tsx" : "main.jsx";
//     const mainFilePath = path.join(process.cwd(), "src", mainFile);

//     if (fs.existsSync(path.join(process.cwd(), "src"))) {
//       fs.writeFileSync(mainFilePath, routerCode);
//       logger.success(`React Router code written to ${mainFilePath}`);
//       logger.info(`TypeScript mode: ${isTs ? "enabled" : "disabled"}`);
//     } else {
//       throw new Error(
//         "src directory not found. Vite project setup may have failed."
//       );
//     }
//   } catch (err) {
//     logger.error(`Error setting up React project: ${err.message}`);
//   }
// }

// class ASTGenerator {
//   constructor() {
//     this.template = templateModule.default;
//     this.generate = generateModule.default;
//     this.cachedASTs = new Map();
//   }

//   /**
//    * Generate code from an AST template
//    * @param {string} templateName - Name of the template in CONFIG.templates
//    * @returns {string} Generated code
//    */
//   generateFromTemplate(templateName) {
//     try {
//       if (this.cachedASTs.has(templateName)) {
//         return this.generate(this.cachedASTs.get(templateName)).code;
//       }

//       const templateConfig = CONFIG.templates[templateName];
//       if (!templateConfig) {
//         throw new Error(
//           `Template "${templateName}" not found in configuration`
//         );
//       }

//       const ast = this.template.ast(templateConfig.code, {
//         plugins: templateConfig.plugins || [],
//       });

//       const program = t.program(ast);
//       this.cachedASTs.set(templateName, program);

//       return this.generate(program).code;
//     } catch (error) {
//       logger.error(
//         `Failed to generate code for template "${templateName}": ${error.message}`
//       );
//       throw error;
//     }
//   }
// }

// setUpReactProject("typescript");

// #!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import logger from "./utils/logger";
import { ASTGenerator } from "./utils/ast";

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
      logger.info("✅Skipping frontend Setup");

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
    }
    else{
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

function generateReadme(projectPath: string, { frontend, backend }: { frontend: boolean; backend: boolean }) {
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

function clientSetUp(framework: string, language: string, cssChoice: string, frontendPath: string, authAccept: boolean) {
  try {
    logger.info("\n⚡ Setting up frontend...");
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
    if(framework === "React")
      fs.appendFileSync(".gitignore", ".env");
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
      isTS ? "reactRouterTs" : "reactRouterJs"
    );

    fs.writeFileSync(`src/main.${ext}`, routerCode);

    const appCode = ast.generateCode("homePage");
    fs.writeFileSync(`src/App.${ext}`, appCode);

    const cssFilePath = path.join(process.cwd(), "src", "App.css");
    const cssCode = ast.generateCode("Appcss");

    fs.writeFileSync(cssFilePath, cssCode);
    logger.success("React Router setup complete!");
  } catch (error) {
    logger.error(`❌ Error setting up React Router: ${error}`);
  }
}

init();