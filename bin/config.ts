npmPackage/
├── src/                       # Main source code directory
│   ├── templates/             # Template files for code generation
│   │   ├── frontend/          # Frontend templates
│   │   └── backend/           # Backend templates
│   ├── utils/                 # Utility functions
│   │   ├── logger.ts          # Logger utility
│   │   └── ast.ts             # AST handling 
│   ├── services/              # Core services
│   │   ├── frontend.ts        # Frontend setup service
│   │   ├── backend.ts         # Backend setup service
│   │   └── project.ts         # Project setup service
│   └── index.ts               # Main entry point
├── dist/                      # Compiled output
├── bin/                       # Binary entry point
│   └── index.js               # Binary file (generated)
├── package.json
├── tsconfig.json
├── babel.config.js
├── .gitignore
└── README.md