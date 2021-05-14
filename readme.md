# Figma Helper for Linux

**Font Helper wrote in Deno**

## Prerequisites

Just have [Deno](https://github.com/denoland/deno) installed.

## Run remotely

```bash
deno run --allow-read --allow-run --allow-net https://raw.githubusercontent.com/castroclucas/figma-font-helper-deno/main/main.ts
```
## OR
## Install

```bash
git clone https://github.com/castroclucas/linux-figma-helper-deno.git && cd linux-figma-helper-deno
```
```bash
./run.sh
```

## How it works

Everytime you open Figma on your browser, it tries to connect on a local server in order to retrieve system fonts. This is used within Figma's official apps, but, since they does not work in Linux, I wrote this script. 

## Why

I know there are already great [helpers](https://github.com/Figma-Linux/figma-linux-font-helper) for this purpose but I wanted to code one myself using Deno because
1. I wanted to learn Deno
2. The code is smaller and simpler
3. Is super easy to run thanks to Deno