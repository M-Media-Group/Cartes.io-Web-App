# Cartes.io Frontend Web App
This is an in-development version of the Cartes.io frontend web app, built in VueJS with Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more (but we may need to move away from this in favor of DefineComponent).

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Development

### Run locally
Run `npm run dev` in the directory of the project.

### Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's Take Over mode by following these steps:

1. Run `Extensions: Show Built-in Extensions` from VS Code's command palette, look for `TypeScript and JavaScript Language Features`, then right click and select `Disable (Workspace)`. By default, Take Over mode will enable itself if the default TypeScript extension is disabled.
2. Reload the VS Code window by running `Developer: Reload Window` from the command palette.

You can learn more about Take Over mode [here](https://github.com/johnsoncodehk/volar/discussions/471).

## Todo
This is not slated for public release just yet. If you'd like to contribute to the following, feel free!

We need to:
- [ ] Add better testing handling (currently unit test shows warnings/errors due to setup)
- [ ] Add E2E testing
- [ ] Add precommit hooks with Husky
- [ ] Verify TSconfig is setup correctly
- [ ] Add linting config
- [ ] Add a 404 page
- [ ] Add vue-router
- [ ] Finalise the UI draft version 1.0
