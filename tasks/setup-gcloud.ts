/* eslint-disable no-console */
import { execSync, readSync } from '@impactor/nodejs';
import { BuildDockerImageOptions, pushDockerImage } from './build-image';

export interface SetupOptions {
  init?: boolean;
  // pass "false" if run in CI
  browser?: boolean;
  // used to authenticate gcloud if it is not already authenticated,
  // if not provided the command `gcloud auth login` is executed
  serviceAccountPath?: string;
}
/**
 * install the required SDKs
 *
 * @param options
 */
// this setup is for Debian and Ubuntu systems
// todo: auto detect system
export default function (options: SetupOptions = {}): void {
  gcloudSetup();
  containerRegistryAuth();
  gcloudLogin(options);
}

/**
 * install gcloud if it is not already installed
 * https://cloud.google.com/sdk/docs/install
 */
export function gcloudSetup(): void {
  try {
    // check if gcloud tools is installed
    execSync('gcloud version');
  } catch {
    console.log('installing gcloud tools...');
    // possible values: https://nodejs.org/api/process.html#process_process_platform
    let os = process.platform;
    if (os === 'linux') gcloudSetupLinux();
    else if (os === 'win32') gcloudSetupWindows();
    else
      throw new Error(
        `installing gCloud on ${os} platform is not supported right now, install it manually`,
      );
  }
}

/**
 * gcloudSetup() for POSIX OS
 */
export function gcloudSetupLinux(): void {
  // Add the Cloud SDK distribution URI as a package source
  execSync(
    `echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list`,
  );

  // to fix the issue for 'apt-get install apt-transport-https'
  // https://unix.stackexchange.com/a/338918
  // https://appuals.com/fix-could-not-open-lock-file-var-lib-dpkg-lock
  try {
    execSync('sudo rm /var/lib/dpkg/lock && sudo rm /var/lib/apt/lists/lock');
    execSync('sudo apt-get update && apt-get upgrade');
  } catch {}

  // confirm that apt-transport-https installed
  // use '--yes' to suppress the confirmation message
  execSync(
    `sudo apt-get install apt-transport-https ca-certificates gnupg --yes`,
  );

  // Import the Google Cloud public key
  execSync(
    `curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -`,
  );

  // Update and install the Cloud SDK
  execSync(
    `sudo apt-get update && sudo apt-get install google-cloud-sdk --yes`,
  );
}

/**
 * gcloudSetup() for windows
 */
export function gcloudSetupWindows(): void {
  // download gcloud installer into Temp directory
  let link =
      'https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe',
    destination = 'GoogleCloudSDKInstaller.exe',
    temporaryPath;

  try {
    // using powershell
    temporaryPath = '$env:Temp';
    execSync(
      `(New-Object Net.WebClient).DownloadFile("${link}","${temporaryPath}\\${destination}")`,
    );
  } catch {
    // using curl
    temporaryPath = '%Temp%';
    execSync(
      `curl.exe --url "${link}" --output "${temporaryPath}\\${destination}"`,
    );

    // other methods:
    // https://superuser.com/questions/25538/how-to-download-files-from-command-line-in-windows-like-wget-or-curl
  }

  // launch the installer
  // todo: silent install for CI
  execSync(`${temporaryPath}\\${destination}`);
}

/**
 * authenticate docker to use gcloud registry
 * https://cloud.google.com/container-registry/docs/advanced-authentication#linux
 */
export function containerRegistryAuth(): void {
  if (process.platform === 'linux') {
    // add the user to docker user group to use it with non-root users
    // https://gist.github.com/mshRoR/555f26c2c9048030d1ae7b1770fae63f
    execSync('sudo groupadd -f docker');
    execSync('sudo usermod -a -G docker ${USER}');
  }

  execSync('gcloud auth configure-docker --quiet');
}

/**
 * login to gcloud
 * @param serviceAccountPath the path to the service account file.
 */
export function gcloudLogin(options?: SetupOptions): void {
  if (!execSync(`gcloud auth list --format="value(account)"`)) {
    try {
      if (!options?.serviceAccountPath) {
        throw new Error(
          `provide the service account's path to login to gcloud`,
        );
      }

      execSync(
        `gcloud auth activate-service-account --key-file=${options.serviceAccountPath}`,
      );
      console.log('gcloud service account is activated');
      // todo: if !permissions throw error
      // check permissions for container registry
      // https://cloud.google.com/container-registry/docs/access-control#grant
    } catch {
      console.log('login to gcloud');
      execSync(
        `gcloud auth login ${
          options?.browser === true ? '' : '--no-launch-browser'
        }`,
      );

      // must login first
      if (options?.init !== false) execSync(`gcloud init`);
    }
  }
}

export interface CloudRunOptions extends Partial<BuildDockerImageOptions> {
  // the cloud run service name
  serviceName?: string;
  platform?: 'managed' | 'gke' | 'kubernetes';
  region?: string;
  allowUnauthenticated?: boolean;
  port?: number | string;
  // used to deploy the image to cloud run
  // if not provided, the default service account is used
  serviceAccount?: { [key: string]: string } | string;
  imageUrl?: string;
}

export function gcloudDeploy(options: CloudRunOptions) {
  console.log('> deploying ...');

  let opts: CloudRunOptions = {
    platform: 'managed',
    region: 'europe-west1',
    allowUnauthenticated: true,
    port: 5000,
    ...options,
  };

  if (typeof opts.serviceAccount === 'string') {
    opts.serviceAccount = <{ [key: string]: string }>(
      readSync(opts.serviceAccount)
    );
  }

  let projectId = opts.serviceAccount?.project_id;
  if (!projectId) throw new Error(`provide a projectId`);

  opts.serviceName = opts.serviceName || `${projectId}-run`;
  opts.imageUrl = opts.imageUrl || `gcr.io/${projectId}/${opts.serviceName}`;

  // we must push the image to gcloud container registry (or gcloud artifact registry)
  // before deploying to gcloud run
  pushDockerImage(opts.imageUrl, opts.tag);

  // todo: add all args
  // https://cloud.google.com/sdk/gcloud/reference/run/deploy
  execSync(
    `gcloud run deploy ${opts.serviceName} --image=${opts.imageUrl} --port=${
      opts.port
    } --project=${projectId} --platform=${opts.platform} --region=${
      opts.region
    } ${opts.allowUnauthenticated ? '--allow-unauthenticated' : ''}  ${
      opts.serviceAccount
        ? '--service-account=' + opts.serviceAccount.client_email
        : ''
    }`,
  );

  console.log('deployed');
}
