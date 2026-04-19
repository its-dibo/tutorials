#!/usr/bin/env -S tsx
/* eslint-disable no-console */

// @ts-ignore
import yargs from 'yargs';
import { findWorkspaces } from 'find-workspaces';
import { cwd } from 'node:process';
import { monorepoRootSync } from 'monorepo-root';
import { readFileSync } from 'node:fs';
import postBuild from './post-build';
import { resolve } from 'node:path';
import { IBuilderBaseOptions } from '@impactor/nx-manager';

/**
 * the output of yargs() operation
 * the cli flags that is passed to every task
 * each task may require additional options
 */
export interface CliFlags extends IBuilderBaseOptions {
  _?: string;
  $0?: string;
}

let argv = process.argv.slice(2),
  separator = argv.indexOf('--'),
  // the main input i.e before the '--' separator
  input: string[],
  // additional flags, passed as it to each cmd.
  // i.e not considered as cli options
  // to parse it use `yargs(flags).parseSync()`
  flags: string[];

if (separator > -1) {
  input = argv.slice(0, separator);
  flags = argv.slice(separator + 1);
} else {
  input = argv;
  flags = [];
}

// console.log({ input, flags, separator });

let cli: CliFlags = yargs(input)
  .usage('run tasks <taskName> [---options]')
  .command(['build [workspace]', 'b'], 'build the project', {
    builder: {
      alias: 'b',
      type: 'string',
      choices: ['esbuild', 'webpack', 'angular', 'nest'] as const,
      description: 'the building tool.',
      // default: 'esbuild',
    },
    outDir: {
      alias: 'o',
      type: 'string',
      desc: "the outDir folder, default: 'dist'",
    },
  })
  .demandCommand(1, `ERROR: provide a command`)
  .example('$0 build auth -b esbuild', 'build a project')
  .parserConfiguration({ 'strip-aliased': true })
  .parseSync();

// console.log({ cli, flags });

const cmd = cli['_']?.[0];

if (cli.projectPath) {
  let projectPath = findWorkspaces()?.find(
    (el) => el.package.name === cli.projectPath,
  );
  if (!projectPath) throw new Error(`package ${cli.projectPath} not existing!`);
  cli.projectPath = projectPath?.location;
  cli.projectName = projectPath?.package.name;
} else {
  cli.projectPath = cwd();
  cli.projectName = JSON.parse(
    readFileSync(`${cwd()}/package.json`, 'utf8'),
  ).name;
}

delete cli['_'];
delete cli['$0'];
cli.flags = cli.flags || [];
cli.root = monorepoRootSync() || resolve(import.meta.dirname, '..');

console.log(`> running task ${cmd} on ${cli.projectPath}`);

let options: IBuilderBaseOptions = {
  ...cli,
  flags,
  // TODO: allow absolute paths, if relative path is used, it is relative to $workspace
  outDir: cli.outDir || 'dist',
};

if (cmd === 'post-build') {
  await postBuild(options);
} else {
  throw new Error(`command ${cmd} is not allowed`);
}
