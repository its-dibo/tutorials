// todo: import from @impactor/nodejs

import {
  lstatSync,
  mkdirSync,
  PathLike,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export function readJSON<R extends Record<string, unknown>>(path: PathLike): R {
  path = resolve(path.toString());

  let data = readFileSync(path, 'utf8');
  return <R>JSON.parse(cleanJson(data));
}

export function writeJSON(path: PathLike, data: any): void {
  path = resolve(path.toString());
  mkdirSync(dirname(path), { recursive: true });
  let dataString = JSON.stringify(data, null, 2);

  return writeFileSync(path, dataString);
}

export function cleanJson(content: string) {
  if (typeof content !== 'string') {
    throw new TypeError(`the content must be a string`);
  }

  let isInsideComment: 'single' | 'multi' | false = false;
  let isInsideString = false;
  let offset = 0;
  let result = '';

  for (let index = 0; index < content.length; index++) {
    let currentCharacter = content[index],
      chars = currentCharacter + content[index + 1];

    if (isInsideComment) {
      if (
        (isInsideComment === 'single' && chars === '\r\n') ||
        (isInsideComment === 'multi' && chars === '*/')
      ) {
        isInsideComment = false;
        index++;
        offset = ++index;
      } else if (
        isInsideComment === 'single' &&
        ['\r', '\n'].includes(currentCharacter)
      ) {
        isInsideComment = false;
        offset = ++index;
      }
    } else {
      if (currentCharacter === '"' && !isEscaped(content, index)) {
        isInsideString = !isInsideString;
      }
      if (isInsideString) continue;
      else if (['//', '/*'].includes(chars)) {
        isInsideComment = chars === '//' ? 'single' : 'multi';
        result += content.slice(offset, index);
        index++;
      }
    }
  }

  return result + content.slice(offset);
}

function isEscaped(content: string, charPosition: number) {
  let index = charPosition - 1;
  let backslashCount = 0;

  while (content[index] === '\\') {
    index--;
    backslashCount++;
  }

  return Boolean(backslashCount % 2);
}

export function getEntriesSync(
  dir: string | string[] = '.',
  filter?: ((entry: string) => boolean) | RegExp | 'files' | 'dirs',
  depth?: number,
  skip?: ((entry: string) => boolean) | RegExp,
): Array<string> {
  if (Array.isArray(dir)) {
    return dir.flatMap((el) => getEntriesSync(el, filter, depth));
  }
  dir = resolve(dir);
  let filterFunction: ((entry: string) => boolean) | undefined =
    filter === 'files'
      ? (entry) => lstatSync(entry).isFile()
      : filter === 'dirs'
        ? (entry) => lstatSync(entry).isDirectory()
        : filter instanceof RegExp
          ? (entry) => (<RegExp>filter).test(entry)
          : typeof filter === 'function'
            ? filter
            : undefined;

  let skipFunction =
    skip instanceof RegExp
      ? (entry: string) => skip.test(entry)
      : typeof skip === 'function'
        ? skip
        : (entry: string) => ['node_modules', 'dist'].includes(entry);

  let entries = readdirSync(dir);
  let result: Array<string> = [];

  for (let entry of entries) {
    let fullPath = join(dir, entry);
    if (!filterFunction || filterFunction?.(fullPath)) {
      result.push(fullPath);
    }

    if (
      (depth === undefined || depth > 0) &&
      lstatSync(fullPath).isDirectory() &&
      !skipFunction?.(entry)
    ) {
      let subEntries = getEntriesSync(
        fullPath,
        filterFunction,
        depth === undefined ? undefined : depth - 1,
      );
      result = [...result, ...subEntries];
    }
  }

  return result;
}
