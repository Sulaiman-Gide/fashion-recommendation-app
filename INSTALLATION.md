# Dependency Installation Instructions

Due to conflicting peer dependencies, install the required Firebase packages using one of the following commands:

- With npm:
  ```
  npm install --legacy-peer-deps @firebase/app @firebase/auth
  ```
- With yarn:
  ```
  yarn add @firebase/app @firebase/auth --ignore-engines
  ```

Check your package.json for compatible versions of React, @types/react, and React Native to avoid further conflicts.
