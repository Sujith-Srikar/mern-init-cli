import template from '@babel/template';
import generate from '@babel/generator';
import * as t from '@babel/types';
import logger from './logger';
import {parse, ParserPlugin} from '@babel/parser';

interface TemplateConfig{
  code: string;
  plugins: ParserPlugin[];
}

interface TemplateCollection{
  [key: string]: TemplateConfig;
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

  Appcss: {
    code: `body {
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
plugins: ["jsx", "typescript"],
  },
};

export class ASTGenerator {
  private cachedASTs: Map<string, t.File> = new Map();

  generateCode(templateName: string): string {
    try{
      if(this.cachedASTs.has(templateName)){
      const cachedAST  = this.cachedASTs.get(templateName);
      return generate(cachedAST!).code;
    }

    const templateConfig = TEMPLATES[templateName];
    if (!templateConfig) {
      throw new Error(`Template ${templateName} not found`);
    }

    const ast = parse(templateConfig.code, {
      sourceType: 'module',
      plugins: templateConfig.plugins});

    this.cachedASTs.set(templateName, ast);

    return generate(ast).code;
    }
    catch(err){
      logger.error(`Error generating code for template ${templateName}: ${err}`);
      throw err;
    }
  }
}