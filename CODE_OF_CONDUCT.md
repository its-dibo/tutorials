# Code of conduct

## start developing

The development environment is design to plug and play, you don't need to install any tool or setup anything.

1- if you're using Windows, use wsl to install Ubuntu

2- generate a SSH key, add it to the SSH agent and at it to your Github account

3- clone the repo as ssh

4- ensure you have Docker installed, if not install Docker desktop or Docker engine

5- once the repo open in VSCode, a notification popups to open the project in a container

6- you don't need to install or setup anything, as all tools already installed in your development container

7- every time you open the project in VSCode, the working branch is automatically updated and all missing dependencies are installed

for a step by step guidance, read the [start development guide](/start-developing.md)

## contributing to the code

- we use the standard [conventional commits](https://conventionalcommits.org) to submit our commits
- each commit should hold a single change
- the commit message should clearly describe the issue it resolves
- **NEVER** push directly to the main branch, instead create a PR
- each PR resolves a single task or sub-task
- each feature branch should be created from the main branch, not from any other feature branch.
- before submitting a PR make sure to:
  - merge from the main branch and resolve any conflicts
  - perform a full testing locally by running `pnpm t`
- after creating your PR, track its review status and fix any comment from the reviewer until all comments are resolved and it fully approved.
- when updating a PR to fix any requested change, submit each change with a separate commit.
- once a PR is merged to the main branch, it is deleted from the remote and you should delete it locally either.

## issue tracking

- we use jira for issue tracking.
- before starting a task, carefully read its description and understand its requirements.
- feel free to discuss any idea with your team lead or reporter before start working on it.
- before adding **any** external package or library, you must get an approval from your team lead.
- add your estimation time to the task **before** start working on any ticket.
- add subtasks to the ticket you're going to work on before starting it.
- once you decided to start working on a task change its status into `in progress`
- if, for any reason, you needed to pause the task, move its status into `paused`, and change it back into `in progress` once you restart working on it again
- once you finished your work on a task and a PR is created, move its status into `in review`
- if you have tasks in `failed testing` you should start with these tasks to fix any discovered bug rather than opening new tasks, move its status back to `in progress` when you start working on it, and move it again to `in review` when the PR is created.

## testing

we perform several types of testing to ensure high quality code, performance and stability.

each functionality is tested by a unit test that covers all possible test cases, and the whole module is tested by a full e2e test.

finally we perform a performance test to ensure the product is robust and withstands with mass requests.

all dependencies are reviewed against potential vulnerabilities and patched immediately as soon as a vulnerability is discovered

every time a code is pushed to the main branch via a PR, a full test is performed to ensure no vulnerabilities or deficiency.

- each function added or modified should be covered with a unit test.
- each module and microservice should be covered with an e2e test.
- the accepted coverage ratio shouldn't be less that 50%

## style guide

We are committed to [Google style guide](https://github.com/google/styleguide) standards.
