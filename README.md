# mern-init-cli

**mern-init-cli** is a CLI tool that helps you quickly set up a full-stack MERN project with both frontend and backend components. This tool streamlines the project initialization process by automatically generating boilerplate code, installing dependencies, and configuring essential files.

## Features

- **Interactive Setup**: Answer a few simple prompts to generate your project.
- **Frontend Setup**:
  - Choose between React or Next.js.
  - Select your language: JavaScript (default) or TypeScript.
  - Option to integrate TailwindCSS.
  - Automatically installs dependencies and starts the development server.
- **Backend Setup**:
  - Generates a basic Express server.
  - Supports JavaScript or TypeScript.
  - Creates essential files like `index.js`/`index.ts`, `.env`, and `.gitignore`.
  - Installs dependencies such as Express, dotenv, and nodemon.
- **Git Initialization**: Automatically initializes a git repository in your project folder.
- **Simple & Elegant**: Focused on ease-of-use without unnecessary complexity.

## Installation

You can install **mern-init-cli** globally using npm:

```sh
npm install -g mern-init-cli
```

Alternatively, you can run it directly with npx:

```sh
npx mern-init-cli
```

The CLI will guide you through the following steps:

### Project Setup
- Project Name: Enter your desired project name (e.g., my-app).

#### Frontend Setup: 
- Choose whether to set up the frontend.

- Select your frontend framework (React or Next.js).

- Choose your preferred language (JavaScript or TypeScript).

- Pick a CSS option (TailwindCSS or Vanilla CSS).

#### Backend Setup:

- Choose whether to set up the backend.

- Select your backend language (JavaScript or TypeScript).

The tool will then scaffold a basic Express server and set up environment configurations.

After the process completes, your project folder will have separate client and server directories with all necessary files. The CLI also automatically initializes a git repository.

#### Remember to replace the placeholders with your actual credentials in .env file in both server and client.

### Feedback and Contributions
#### We welcome your feedback and contributions!
If you have any suggestions for improvements or encounter any issues, please submit an issue or pull request on our GitHub repository.

### Links
- NPM Package: https://www.npmjs.com/package/mern-init-cli

- GitHub Repository: https://github.com/Sujith-Srikar/mern-init-cli