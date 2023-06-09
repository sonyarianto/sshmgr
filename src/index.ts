#! /usr/bin/env node

import { intro } from "@clack/prompts";
import color from "picocolors";
import { readConfig } from "./app";
import * as appConfig from "./config";
import { mainMenu } from "./app";
import { cli } from "cleye";

async function main() {
  const _ = cli({
    name: appConfig.APP_NAME,
    version: appConfig.APP_VERSION,
  });

  intro(`${color.bgCyan(color.black(` ${appConfig.APP_NAME} `))}`);

  const config = readConfig({
    configFilePath: appConfig.CONFIG_FILE_PATH,
    defaultConfig: appConfig.defaultConfig,
  });

  const data = { config: config, selectedMainMenuValue: "list" };

  mainMenu(data);
}

main();
