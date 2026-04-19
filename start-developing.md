# Developing guide

This handbook guides you how to setup your environment to start contributing to our project

## using Ubuntu in Windows WSL

If you're using windows you'll need to use WSL to install Ubuntu.
Windows already comes with WSL preinstalled, we just need to add a distro.

we recommend to install and use [windows terminal](https://apps.microsoft.com/detail/9N0DX20HK701) from the windows store.

to open the windows terminal run `wt` or search for "windows terminal".

run the following commands to install Ubuntu and set it as the default distro.

```
wsl --install ubuntu
```

```
wsl --set-default ubuntu
```

from now on, use wsl to work with the project's repo.

to access wsl:

- if you're using windows terminal, open a new tab and select Ubuntu, it is created automatically for you.
- otherwise run `wsl` in your preferred terminal

## Setup SSH key

First, be sure you're working in Ubuntu

1- generate a new SSH key

```
ssh-keygen -t ed25519 -C "your_email@gmail.com"
```

2- add your ssh to the agent

```
eval "$(ssh-agent -s)"
```

```
ssh-add ~/.ssh/id_ed25519
```

3- add the ssh key to your github account

- copy the public key, it should start with `ssh-ed25519` and ends with your email

```
cat ~/.ssh/id_ed25519.pub
```

- open github -> settings -> SSH and GPG keys -> new ssh

- and paste it

- test your key

```
ssh -T git@github.com
```

## Clone the repo

Open Ubuntu (if you're using window, use WSL as mentioned above) and clone your repo there

be sure that you are cloning the repo using ssh, not http.

i.e. it should be similar to git@github.com:<username>/<repo>.git, not https://github.com/<username>/<repo>.git

now open vs code from the cloned repo's folder `code .`

## Working in dev container

The dev container includes everything you'll need to work, you don't need to install anything manually.

if you're using windows install & run [Docker Desktop](https://www.docker.com/products/docker-desktop/).

when you open the project in vs code for the first time it asks you for:

- installing Docker extension, if not installed
- re-open the repo inside a container

it'll take some time at the first time building the required images, but next times it opens as usual.

## Troubleshooting

### Github rejected to authenticate me inside the container

If you faced troubles using your SSH key inside the container make sure the container can access the host's keys

from inside the container run `ls ~/.ssh` to check they are existing, if not do the following steps from the host:

- check that key is existing by running `ls ~/.ssh` from the host, not container, if not generate a new key and follow the steps above.
- be sure that the key is added to the agent.

### The dev container cannot be build or run as usual

destroy the docker containers used to launch the containers, they are grouped into a container's group to easily find them, and rebuild the dev container again.

### New Postgres extensions or databases doesn't created in my container

For safety reasons, once the image is built for the first time it propagates Postgres data into a special volume.

next builds are prevented from touching this volume again, for example if new databases or extensions added to the Postgres container, they have no effect in subsequence build.

to force running Postgres scripts, you need to delete the Postgres volume and rebuild the image again
