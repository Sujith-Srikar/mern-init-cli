import generate from "@babel/generator";
import * as t from "@babel/types";
import { logger } from "./logger.js";
import { cachedASTs, PLAIN_TEMPLATES } from "./template.js";

interface AST {
  [key: string]: string;
}

export class ASTGenerator {
  generateCode(templateName: string): string {
    try {
      if (PLAIN_TEMPLATES[templateName]) return PLAIN_TEMPLATES[templateName];

      if (cachedASTs.has(templateName)) {
        const cachedAST = cachedASTs.get(templateName);
        return generate.default(cachedAST!).code;
      }

      return "Not Correct Template Name";
    } catch (err) {
      logger.error(
        `Error generating code for template ${templateName}: ${err}`
      );
      throw err;
    }
  }
}
