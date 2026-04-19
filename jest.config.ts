import {
  type JestConfigWithTsJest,
  createJsWithTsEsmPreset,
  createJsWithTsPreset,
  pathsToModuleNameMapper,
} from 'ts-jest';
import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { cleanJson } from './utils/fs';
import angularPresets from 'jest-preset-angular/presets';
import { IPackage } from '@impactor/nx-manager';

export type JestConfig = JestConfigWithTsJest;

export interface Options extends JestConfig {
  /**
   * The module type, by default it inferred from package.json
   */
  module?: 'commonjs' | 'es';
  /**
   * path to tsconfig file
   * @default tsconfig.spec.json or tsconfig.json in $rootDir
   */
  tsConfigPath?: string;
  /**
   * The project's framework, may have impact in some properties like 'preset'
   */
  framework?: 'Angular' | 'NestJs' | 'reactJs';
}

export default function jestConfig(config?: Options): JestConfig {
  config = {
    rootDir: '.',
    /*
      ignore files inside 'dist' dirs to solve the error:
      `The name `@impactor/*` was looked up in the Haste module map. 
       It cannot be resolved, because there exists several different files, or packages`
       this error occurs when ./dist/package.json has the same name as ./package.json
      */
    modulePathIgnorePatterns: ['dist', '~test', 'libs/ngx-'],
    ...config,
  };

  let cache: { pkg?: IPackage } = {};

  if (!config.tsConfigPath) {
    config.tsConfigPath = getTsConfigPath([config.rootDir!]);
  }

  if (!config.moduleNameMapper) {
    config.moduleNameMapper = getAliasPaths(
      config.tsConfigPath,
      config.rootDir,
      config.module === 'es',
    );
  }

  if (!config.module) {
    // read the property pkg.type
    let pkg = cache.pkg || readJson(`${config.rootDir}/package.json`);
    config.module = pkg?.type === 'module' ? 'es' : 'commonjs';
  }

  if (!config.framework) {
    // detect if the project is Angular
    let project = basename(config.rootDir!);
    if (project.startsWith('ngx-') || project.startsWith('ng-')) {
      config.framework = 'Angular';
    } else {
      let pkg = cache.pkg || readJson(`${config.rootDir}/package.json`);
      // or pkg.name.startsWith('ngx-')
      if (pkg?.dependencies?.['@angular/core']) config.framework = 'Angular';
    }
  }

  // adds transform, extensionsToTreatAsEsm
  // replaces ts-jest legacy presets such as `ts-jest/presets/default-esm`
  // https://kulshekhar.github.io/ts-jest/docs/getting-started/presets/#legacy-presets
  config = {
    ...config,
    // https://thymikee.github.io/jest-preset-angular/docs/getting-started/installation/
    ...(config.framework === 'Angular'
      ? {
          ...angularPresets.createEsmPreset({ tsconfig: config.tsConfigPath }),
          setupFilesAfterEnv: [`${__dirname}/jest-setup.ts`],
        }
      : config.module === 'es'
        ? createJsWithTsEsmPreset()
        : createJsWithTsPreset()),
  };

  // define the default jest configs in root jest.config only
  // other jest config files define only the option that are needed to be overridden
  // to avoid warnings of "unknown option", see `config.projects` option
  if (config.rootDir === '.') {
    config = {
      ...config,
      // rootDir: __dirname || config.projectRoot,
      // the location of jest.config file, defaults to PWA
      // setting it to __dirname may cause that jest cannot resolve tsconfig.paths correctly
      // rootDir: __dirname,
      testEnvironment: 'node',
      // don't inject jest methods (test,describe,...) to the global scope
      // you must import them from '@jest/globals
      injectGlobals: false,
      // run tests for only files that changed from the last commit
      onlyChanged: false,
      // output the coverage report (--coverage in cli)
      collectCoverage: true,
      coveragePathIgnorePatterns: [
        '/nodemodules/',
        '/\.module\.ts$/',
        '/\.entity\.ts$/',
        '/utils\//',
      ],
      moduleDirectories: ['node_modules', 'types'],
      moduleFileExtensions: [
        'ts',
        'tsx',
        'mts',
        'cts',
        'mjs',
        'cjs',
        'js',
        'jsx',
        'json',
        'html',
        'scss',
        'css',
        'node',
      ],
      passWithNoTests: true,
      projects: ['<rootDir>/*/**/jest.config.ts'],
    };
  }

  // remove additional config options
  ['module', 'tsConfigPath', 'framework'].map((el) => {
    delete config?.[el as keyof typeof config];
  });

  return config;
}

/**
 * get alias paths from tsconfig paths
 *
 * @param tsConfigPath
 * @param rootDir
 * @returns
 */
export function getAliasPaths(
  tsConfigPath = './tsconfig.json',
  rootDir = '<rootDir>',
  useESM = false,
) {
  let tsConfig = readJson(tsConfigPath);

  /*
   pathsToModuleNameMapper generates moduleNameMapper from tsconfig.compilerConfig.paths
   https://huafu.github.io/ts-jest/user/config/#paths-mapping
   */
  let mappings: Record<string, string | string[]> =
    pathsToModuleNameMapper(tsConfig?.compilerOptions?.paths || {}, {
      prefix: rootDir,
      useESM,
    }) || {};

  delete mappings[String.raw`^(\.{1,2}/.*)\.js$`];

  // apply `resolve()` on each value, so something like `/workspaces/dibo/apps/trips/../../$1` resolves to `/workspaces/dibo/$1`
  return Object.fromEntries(
    Object.entries(mappings).map(([key, values]) => [
      key,
      Array.isArray(values)
        ? values.map((value) => resolve(value))
        : resolve(values),
    ]),
  );
}

/**
 * return the first exist file from configFiles list in the specified paths in order
 *
 * @param paths the paths to search in
 * @param configFiles the files list to search for
 * @returns the first matched path
 * @example getExistPath(['.', '..'], ['tsconfig.app.json', 'tsconfig.json'])
 */
function getExistPath(
  paths: string[],
  configFiles: string[],
): string | undefined {
  if (!configFiles?.length) return;

  for (let path of paths) {
    if (!path) return;
    if (path === '<rootDir>') path = '.';

    for (let configFile of configFiles) {
      let tsConfigPath = resolve(path, configFile);
      if (existsSync(tsConfigPath)) return tsConfigPath;
    }
  }
  return;
}

function getTsConfigPath(
  paths: string[],
  configFiles = ['tsconfig.spec.json', 'tsconfig.app.json', 'tsconfig.json'],
) {
  paths.push(__dirname);
  return getExistPath(paths, configFiles);
}

function readJson(path: string) {
  try {
    let content = readFileSync(resolve(path), 'utf8'),
      cleanContent = cleanJson(content),
      jsonContent = JSON.parse(cleanContent);
    return jsonContent;
  } catch (error) {
    throw error;
  }
}
