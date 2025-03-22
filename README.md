# Project Setup CLI

## Introduction
The **Project Setup CLI** is a command-line tool that automates the process of creating a full-stack web development project. It sets up a **backend with Express.js** and a **frontend with Vite (React)** while handling dependencies, configurations, and server execution.

## Features
- Initializes a **backend** with:
  - `Express.js` & `dotenv`
  - Folder structure: `models`, `controllers`, `routes`, `middlewares`, `utils`, `public`
  - Auto-creation of `index.js`, `app.js`, `.env`, `.gitignore`, and `constant.js`
  - Installs `nodemon` for automatic server restart
  - Opens a **new terminal** and runs `nodemon index.js`

- Initializes a **frontend** with:
  - Vite + React (default: JavaScript)
  - Installs dependencies and runs `npm run dev`

---

## Installation
To install the CLI globally from npm:
```sh
npm install -g setup-cli
```

---

## Usage
To create a new project, run:
```sh
setup-project <project-name>
```

For example:
```sh
setup-project my-app
```
This will create a `my-app/` folder and set up both backend and frontend inside it.

---

## Folder Structure
```
my-app/
│── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   ├── public/
│   ├── index.js
│   ├── app.js
│   ├── constant.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── node_modules/
│
│── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── node_modules/
```

---

## Steps Executed by the CLI
### 1️⃣ **Backend Setup**
- Creates a `backend/` directory.
- Runs `npm init -y`.
- Adds `{ "type": "module" }` to `package.json`.
- Installs `express` and `dotenv`.
- Installs `nodemon` as a dev dependency.
- Creates backend folder structure.
- Generates essential files (`index.js`, `app.js`, `.env`, `.gitignore`, `constant.js`).
- Opens a new terminal and runs `npx nodemon index.js`.

### 2️⃣ **Frontend Setup**
- Creates a `frontend/` directory.
- Asks the user to choose between JavaScript and TypeScript.
- Runs `npm create vite@latest frontend -- --template react` (or `react-ts`).
- Installs frontend dependencies (`npm install`).
- Starts the frontend server (`npm run dev`).

---

## Example Workflow
```sh
setup-project my-app
```
**Backend Terminal Output:**
```
🛠 Setting up backend...
📦 Installing backend dependencies...
🚀 Starting backend server...
```

**Frontend Terminal Output:**
```
⚡ Setting up frontend with Vite...
Choose language: (1) JavaScript (default) or (2) TypeScript:
📦 Installing frontend dependencies...
🚀 Starting frontend server...
```

---

## Dependencies Used
- **Backend:**
  - `express`
  - `dotenv`
  - `nodemon` (dev dependency)

- **Frontend:**
  - `vite`
  - `react`
  - `react-dom`

---

## License
MIT License

---

## Future Improvements
- Add support for **other frameworks** (e.g., Next.js, Vue.js).
- Allow **customized folder structure**.
- Provide **default backend API routes**.

---

## Contributing
Feel free to submit issues or contribute by creating a pull request! 🚀

---

## Links
- **NPM Package:** [https://www.npmjs.com/package/setup-cli](https://www.npmjs.com/package/setup-cli)
- **GitHub Repository:** [[https://github.com/aaradhayasingh811/setup-cli.git](https://github.com/aaradhayasingh811/setup-cli.git)]