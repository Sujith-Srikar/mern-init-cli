#!/usr/bin/env node

import templateModule from "@babel/template";
import generateModule from "@babel/generator";
import * as t from "@babel/types";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";

/**
 * Configuration and constants
 */
const CONFIG = {
  templates: {
    reactRouter: {
      plugins: ["jsx"],
      code: `
import React from "react";
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
    },
  },
  commands: {
    createReact: "npm create vite@latest . -- --template react",
    installRouter: "npm i react-router-dom",
  },
};

/**
 * Logger utility for consistent logging
 */
const logger = {
  info: (message) => console.log(`\x1b[36mINFO:\x1b[0m ${message}`),
  success: (message) => console.log(`\x1b[32mSUCCESS:\x1b[0m ${message}`),
  error: (message) => console.error(`\x1b[31mERROR:\x1b[0m ${message}`),
  warn: (message) => console.warn(`\x1b[33mWARNING:\x1b[0m ${message}`),
};

/**
 * AST Template Generator
 */
class ASTGenerator {
  constructor() {
    this.template = templateModule.default;
    this.generate = generateModule.default;
    this.cachedASTs = new Map();
  }

  /**
   * Generate code from an AST template
   * @param {string} templateName - Name of the template in CONFIG.templates
   * @returns {string} Generated code
   */
  generateFromTemplate(templateName) {
    try {
      // Check if we have a cached AST
      if (this.cachedASTs.has(templateName)) {
        return this.generate(this.cachedASTs.get(templateName)).code;
      }

      const templateConfig = CONFIG.templates[templateName];
      if (!templateConfig) {
        throw new Error(
          `Template "${templateName}" not found in configuration`
        );
      }

      const ast = this.template.ast(templateConfig.code, {
        plugins: templateConfig.plugins || [],
      });

      const program = t.program(ast);
      this.cachedASTs.set(templateName, program);

      return this.generate(program).code;
    } catch (error) {
      logger.error(
        `Failed to generate code for template "${templateName}": ${error.message}`
      );
      throw error;
    }
  }
}

/**
 * Project Setup Service
 */
class ProjectSetupService {
  constructor() {
    this.astGenerator = new ASTGenerator();
  }

  /**
   * Setup React application with React Router
   * @param {string} frontendPath - Path to frontend directory
   */
  async setupReact(frontendPath) {
    try {
      logger.info(`Setting up React in ${frontendPath}`);
      process.chdir(frontendPath);

      logger.info("Creating Vite React application...");
      execSync(CONFIG.commands.createReact, { stdio: "inherit" });

      logger.info("Installing React Router...");
      execSync(CONFIG.commands.installRouter, { stdio: "inherit" });

      logger.info("Generating React Router configuration...");
      const routerCode = this.astGenerator.generateFromTemplate("reactRouter");

      fs.writeFileSync(path.join(frontendPath, "src/main.jsx"), routerCode);
      logger.success("React setup completed successfully");
    } catch (error) {
      logger.error(`React setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize the project structure
   */
  async init() {
    try {
      const { projectName } = await inquirer.prompt({
        type: "input",
        name: "projectName",
        message: "Enter your project name:",
        default:
          process.argv[2] ||
          "my-project (enter . if you want to setup in current directory)",
      });

      let projectPath;
      if (projectName === ".") {
        projectPath = process.cwd();
        logger.info("Setting up in current directory");
      } else {
        projectPath = path.join(process.cwd(), projectName);

        if (fs.existsSync(projectPath)) {
          logger.error("Project directory already exists!");
          process.exit(1);
        }

        logger.info(`Creating project directory: ${projectName}`);
        fs.mkdirSync(projectPath, { recursive: true });
      }

      const frontendPath = path.join(projectPath, "client");
      fs.mkdirSync(frontendPath, { recursive: true });

      await this.setupReact(frontendPath);
    } catch (error) {
      logger.error(`Project initialization failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Create instance and start the application
const setupService = new ProjectSetupService();
setupService.init().catch((err) => {
  logger.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
