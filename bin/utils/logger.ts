export const logger = {
  info: (message: string): void =>
    console.log(`\x1b[36mINFO:\x1b[0m ${message}`),
  success: (message: string): void =>
    console.log(`\x1b[32mSUCCESS:\x1b[0m ${message}`),
  error: (message: string): void =>
    console.error(`\x1b[31mERROR:\x1b[0m ${message}`),
  warn: (message: string): void =>
    console.warn(`\x1b[33mWARNING:\x1b[0m ${message}`),
};

// here \x1b is the escape character for color codes
// \x1b[36m is the code for cyan text