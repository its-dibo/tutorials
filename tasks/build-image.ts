/* eslint-disable no-console */
import { execSync } from '@impactor/nodejs';
import { execSync as _execSync } from 'node:child_process';

export interface BuildDockerImageOptions {
  // the path of Dockerfile
  dockerfilePath?: string;
  // the image tag
  tag?: string;
  // whether to push the built image
  push?: boolean;
}

/**
 * build and publish a docker image.
 * @param options
 */
export default function buildDockerImage(options: BuildDockerImageOptions) {
  let opts: BuildDockerImageOptions = {
    // relative to Dockerfile, relative to dist/
    dockerfilePath: '.',
    push: false,
    ...options,
  };
  console.log(`> building the image ${opts.tag} ...`);
  // check if Docker is installed
  // in windows:
  //   1- download Docker desktop
  //   2- from the icon trey, switch to windows containers
  //   3- in windows, search for "turn windows features on" and check "containers" and "hyper-v"
  execSync(
    `docker build ${opts.dockerfilePath} ${opts.tag ? '-t ' + opts.tag : ''}`,
  );

  if (opts.push) {
    // pushDockerImage(opts.imageUrl);
  }
}

/**
 * push a docker image to a container registry such as docker hub or gcloud container registry
 * @param tag
 * @param imageId
 */
export function pushDockerImage(tag: string, imageId?: string) {
  console.log(`> pushing the image ${tag} ...`);

  if (imageId) {
    execSync(`docker tag ${imageId} ${tag}`);
  }
  // to check if the user already logged in:
  // https://stackoverflow.com/a/55744359/12577650
  // https://stackoverflow.com/a/47580834/12577650
  // 1- `docker system info | grep -E 'Username|Registry'`
  // 2- read "~/.docker/config.json"
  // todo: login to docker hub only when pushing to docker hub, not to another service like google container registry
  execSync(`docker login`);
  execSync(`docker push ${tag}`);
}
