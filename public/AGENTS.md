# Repository Guidelines

## Project Structure & Module Organization

This is a Vite React portfolio app. The entry point is `src/main.jsx`, with the top-level app in `src/App.jsx`. Feature UI is organized under `src/components/`: `Intro/` for the opening sequence and `sections/` for page sections such as `Hero`, `About`, and `Projects`. Each component keeps its scoped styles beside it as `*.module.css`. Shared design styles live in `src/styles/`, including `global.css` and `tokens.css`. Project imagery is stored in root PNG files and `src/assets/works/` as numbered work thumbnails such as `work-01.PNG`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server with hot reload.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: preview the production build locally.

There is no configured test script yet. Run `npm run build` before handing off UI changes to catch bundling and import errors.

## Coding Style & Naming Conventions

Use ES modules, React function components, and hooks. Follow the existing style: two-space indentation, single quotes, no semicolons, and PascalCase component names (`Hero.jsx`, `Projects.jsx`). Keep CSS scoped with CSS Modules named after the component (`Hero.module.css`). Put shared variables in `src/styles/tokens.css` rather than duplicating literal values across modules. Name work images with stable numeric patterns (`work-01.PNG`, `work-02.PNG`) because the hero imports them dynamically by number.

## Testing Guidelines

No testing framework or coverage target is currently configured. For now, validate changes by running `npm run build` and checking the app with `npm run dev` in a browser. When adding tests, prefer Vitest with React Testing Library, place tests beside components as `Component.test.jsx`, and cover animation fallbacks such as reduced-motion behavior where practical.

## Commit & Pull Request Guidelines

This checkout has no Git history, so no existing commit convention can be inferred. Use short imperative commit messages, optionally scoped, for example `feat: add project filter` or `fix: preserve hero scroll lock`. Pull requests should include a brief description, screenshots or screen recordings for visual changes, notes about responsive behavior, and the commands run for verification.

## Security & Configuration Tips

Do not commit generated `dist/` output, local environment files, or new large media unless they are required assets. Keep dependency updates intentional and commit `package-lock.json` whenever `package.json` changes.
