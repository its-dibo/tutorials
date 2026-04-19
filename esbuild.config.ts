import { BuildOptions, build as _build } from 'esbuild';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { getEntriesSync, readJSON } from './utils/fs';

export interface EsbuildConfig extends BuildOptions {
  /**
   * the root dir of the project
   */
  projectRoot?: string;
}

export default function getConfig(config?: EsbuildConfig): EsbuildConfig {
  let opts: EsbuildConfig & { projectRoot: string } = {
    projectRoot: import.meta.dirname,
    bundle: true,
    platform: 'node',
    plugins: [
      // add tsconfig.compilerOptions.path to esbuild alias
      // see the `package` options
      // this plugin no longer needed when using `tsx` instead of `ts-node`
      // `tsk` (i.e. libs/tasks) uses tsx
      // tsPaths({ tsConfigPath: resolve(root, './tsconfig.json') }),
    ],
    // don't add `@impactor/*` to externals, no guarantee that the latest changes is published
    // add any singleton store. if it bundled each module will have its own instance.
    // all externals need to be compiled separately
    external: [],
    minify: false,
    // add all packages (not starting with ./) to external[]
    // this works after resolving aliases, i.e: has no effect on "@impactor/*"
    packages: 'external',
    splitting: false,
    // outExtension: { '.js': '.mjs' },
    entryNames: '[dir]/[name]',
    ...config,
  };

  if (!opts.outdir) {
    if (!opts.tsconfig) {
      let files = ['tsconfig.lib.json', 'tsconfig.app.json', 'tsconfig.json'];
      for (let file of files) {
        if (existsSync(`${opts.projectRoot}/${file}`)) {
          opts.tsconfig = resolve(opts.projectRoot, file);
          break;
        }
      }
    }

    if (opts.tsconfig) {
      try {
        let tsConfig = readJSON<Record<string, any>>(opts.tsconfig);
        opts.outdir = resolve(
          opts.projectRoot,
          tsConfig?.compilerOptions?.outDir || 'dist',
        );
      } catch {}
    }
  }

  if (!opts.outdir) {
    opts.outdir = resolve(opts.projectRoot, 'dist');
  }

  if (!opts.format) {
    // read the property pkg.type
    let pkg = readJSON<Record<string, unknown>>(
      `${opts.projectRoot}/package.json`,
    );
    opts.format = pkg?.type === 'module' ? 'esm' : 'cjs';
  }

  for (let key in opts) {
    if (key.startsWith('_')) delete opts[key as keyof typeof opts];
  }

  if (!opts.entryPoints) {
    // preserve the package's src structure
    // not applicable to apps (for apps provide the entry point explicitly)
    // todo: add option configs.separate or detect if the current build is for a package (not app)
    //  - build each file separately i.e. each file is an entry point
    //  - output to dist/index.mjs and dist/src/*.mjs files
    //  - add local files to external[] to prevent bundling all files into a single file

    let srcDir = existsSync(resolve(`${opts.projectRoot}/src`))
      ? resolve(`${opts.projectRoot}/src`)
      : resolve(`${opts.projectRoot}`);

    let entryPoints = getEntriesSync(
      srcDir,
      // filter .ts files, excluding declarations and spec files
      (el) =>
        ['.ts', '.mts', '.cts'].some((extension) => el.endsWith(extension)) &&
        ![
          '.d.ts',
          '.d.cts',
          '.d.mts',
          '.spec.ts',
          '.spec.cts',
          '.spec.mts',
        ].some((extension) => el.endsWith(extension)),
    );

    // also add the bridge files i.e. index.ts files
    if (existsSync(resolve(`${opts.projectRoot}/index.ts`))) {
      entryPoints.push(resolve(`${opts.projectRoot}/index.ts`));
    }

    // add local files (i.e. files from the same package) to external[]
    // as each file considered as an entry point
    // especially for libs
    opts.external?.push(opts.projectRoot);
  }

  let { projectRoot, ...otherOptions } = opts;
  return otherOptions;
}

export async function build(config: EsbuildConfig): ReturnType<typeof _build> {
  let opts = getConfig(config);
  return _build(opts as BuildOptions);
}
