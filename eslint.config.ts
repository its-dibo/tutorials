// to load .env file when running Eslint server by VSCode
import 'dotenv/config';

import {
  eslintPresetJS,
  esLintConfigAngular,
  tsExtensionsGlob,
  markdownExtensionsGlob,
} from '@impactor/eslint-config';

const strict =
  (process.env.ESLINT_STRICT && process.env.ESLINT_STRICT !== 'false') || false;

export default [
  ...eslintPresetJS({
    root: import.meta.dirname,
    strict,
  }),
  ...esLintConfigAngular({
    strict,
    // todo: add Angular template files here
    // by default it adds all html files which may cause an issue with prettier
    // `Parsing error: Unexpected token  prettier/prettier`
    templateFiles: ['libs/ngx-*/**/*.html'],
  }),
  {
    ignores: [
      // cities files are too large, and not meant to be readable
      // they mainly meant to be used to use them programmatically as-is to seed databases
      'libs/geo/src/cities/*',
      '**/nest-swagger-metadata.ts',
      '**/templates/*',
      // as it is commonjs format, it will report `'module' is not defined`
      '.ncurc.js',
      // todo: https://github.com/ota-meshi/eslint-plugin-css/issues/34
      // https://github.com/atfzl/eslint-plugin-css-modules/issues/74
      '**/*.css',
      '**/*.scss',
      // changelog files are generated automatically by release tools
      '**/CHANGELOG.{md,mdx}',
    ],
  },
  {
    files: [`**/*.${tsExtensionsGlob}`],
    rules: {
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@angular-eslint/prefer-inject': 'warn',
      'regexp/no-unused-capturing-group': 'warn',
      'no-unreachable': 'warn',
      '@microsoft/sdl/no-inner-html': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },
  {
    files: [`**/*.${markdownExtensionsGlob}`],
    rules: {
      'markdown/fenced-code-language': 'warn',
    },
  },
];
