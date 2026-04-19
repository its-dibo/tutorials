import setup, {
  CloudRunOptions,
  SetupOptions,
  gcloudDeploy,
} from './setup-gcloud';
import { execSync as _execSync } from 'node:child_process';
import buildDockerImage, { BuildDockerImageOptions } from './build-image';

export type DeployOptions = SetupOptions &
  BuildDockerImageOptions &
  CloudRunOptions;

/**
 * build a docker image and deploy it to gcloud run
 * gcloud must be installed, run task: setup
 *
 * @param options overrides gcloudConfig
 * @param cloudRunOptions
 */
// todo: detect if gcloud not installed, run task: setup
export default function deployToGcloudRun(options: DeployOptions): void {
  let opts: DeployOptions = { ...options };

  if (!opts.serviceAccountPath && typeof opts.serviceAccount === 'string') {
    opts.serviceAccountPath = opts.serviceAccount;
  }

  opts.tag = opts.tag || opts.serviceName;

  setup(opts);

  buildDockerImage({
    tag: opts.tag,
    dockerfilePath: opts.dockerfilePath || '.',
    push: false,
  });

  gcloudDeploy(opts);
}
