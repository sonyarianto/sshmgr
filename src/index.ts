#! /usr/bin/env node

import { intro } from "@clack/prompts";
import color from "picocolors";
import { readConfig } from "./app/app";
import * as appConfig from "./app/config";
import { mainMenu } from "./app/clack";
import { cli } from "cleye";

let config: any = null;

async function main() {
  const argv = cli({
    name: appConfig.APP_NAME,
    version: appConfig.APP_VERSION,
  });

  intro(`${color.bgCyan(color.black(` ${appConfig.APP_NAME} `))}`);

  config = readConfig({
    configFilePath: appConfig.CONFIG_FILE_PATH,
    defaultConfig: appConfig.defaultConfig,
  });

  mainMenu(config);
}

main();
