/**
 * npm-check-updates
 *  @type {import('npm-check-updates').RcOptions }
 */
module.exports = {
  // update package.json
  upgrade: true,
  // update workspaces recursively
  deep: true,
  // Include only packages that satisfy engines.node
  enginesNode: true,
  // Check peer dependencies of installed packages and filter updates to compatible versions
  peer: true,
  // update to the latest versions
  target: "latest",
  // peerDependencies are checked for conflicts, so they are safe to be updated?
  dep: "prod,dev,bundle,optional,peer",
  // merge the workspace's config with the root's one
  mergeConfig: true,
  reject: [
    // use angular migration guide to update Angular
    // also update them in renovate.json
    // -- start of Angular dependencies --
    "@angular/**",
    "@angular-devkit/**",
    "@schematics/angular",
    "typescript",
    "@nx/angular",
  ],
};
