#! /usr/bin/env node

import { intro } from "@clack/prompts";
import color from "picocolors";
import { readConfig } from "./app/app";
import * as appConfig from "./app/config";
import { mainMenu } from "./app/clack";

const [, , command, ...args] = process.argv;
let config: any = null;

async function main() {
  intro(
    `${color.bgCyan(color.black(` ${appConfig.APP_NAME} `))} v${
      appConfig.APP_VERSION
    }`
  );

  config = readConfig({
    configFilePath: appConfig.CONFIG_FILE_PATH,
    defaultConfig: appConfig.defaultConfig,
  });

  mainMenu(config);
}

main();
