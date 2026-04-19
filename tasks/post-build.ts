/* eslint-disable no-console */
import { existsSync } from 'node:fs';
// `@impactor/*` must be added to the root package.json to be built before using them here
// todo: when this module imported via a dynamic import statement i.e. `import(tasks/post-build)`,
// NodeJS uses `pkg.exports` to resolve paths, and `pkg.exports["."]` refers to "index.js" which is not existing yet
// so we need to use the full path to a source file which resolves the issue here, i.e. `import ... from '@impactor/nodejs/fs-sync.ts'`
// but scince `@impactor/nodejs/fs-sync.ts` imports from `@impactor/javascript` the same issue happens there
import type { IBuilderBaseOptions, IPackage } from '@impactor/nx-manager';
import { readJSON, writeJSON } from '../utils/fs';

/**
 * This task make additional custom operations after post-build from "universal-builder"
 * it takes the same options that universal-builder passes to its post-build script.
 * @param options
 */
export default function postBuild(options: IBuilderBaseOptions) {
  let opts: IBuilderBaseOptions = {
    ...options,
  };

  console.info(`[tasks] post-build`);
  let dist = `${opts.projectPath}/${opts.outDir || 'dist'}`;
  if (!existsSync(`${dist}/package.json`)) {
    throw new Error(
      `[tasks] "${dist}/package.json" doesn't exist, be sure the app is built`,
    );
  }

  let pkg = readJSON<IPackage>(`${opts.projectPath}/dist/package.json`) || {};

  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts.start) {
    // todo: fix type
    let nx = readJSON<any>(`${opts.root}/nx.json`),
      serveTarget = nx?.targetDefaults?.serve,
      serveCmd =
        serveTarget?.configurations?.production?.command ||
        serveTarget?.opttions?.command;

    // todo: if(serveCmd is array) use serveCmd[0]
    pkg.scripts.start =
      serveCmd?.replaceAll(/(.\/)?dist\//g, '') || 'node main.js';
  }

  if (!pkg.scripts.prestart && pkg.scripts.preserve) {
    pkg.scripts.prestart = pkg.scripts.preserve;
    delete pkg.scripts.preserve;
  }

  // remove all build scripts
  for (let script in pkg.scripts) {
    if (script.startsWith('build')) {
      delete pkg.scripts[script];
    }
  }

  // remove all devDependencies except the allowed onces, i.e. the once are actually used inside 'dist
  let allowedDevDependencies = Object.entries(pkg.devDependencies || {}).filter(
    ([key, _value]) => ['tsx', 'kill-port'].includes(key),
  );
  pkg.devDependencies = Object.fromEntries(allowedDevDependencies);

  writeJSON(`${dist}/package.json`, pkg);
}
