#!/usr/bin/env node

import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const thisFileUrl = import.meta.url;
const thisFilePath = fileURLToPath(thisFileUrl);
const currentDirectory = process.cwd();
const migrationUtilPath = path.join(path.dirname(thisFilePath), "..", "migration.util.js");

const args = process.argv.slice(2);

const createMigrationsDirectoryIfNotExists = () => {
  const migrationsDirectoryPath = path.join(currentDirectory, "migrations");
  if (!fs.existsSync(migrationsDirectoryPath)) {
    fs.mkdirSync(migrationsDirectoryPath);
  }
};

createMigrationsDirectoryIfNotExists();

const captureAndDisplayLogs = (childProcess) => {
  let stdoutData = "";
  let stderrData = "";

  childProcess.stdout.on("data", (data) => {
    stdoutData += data;
    stdoutData = removeTrailingNewline(stdoutData);
    console.log(stdoutData);
    stdoutData = "";
  });

  childProcess.stderr.on("data", (data) => {
    stderrData += data;
    stderrData = removeTrailingNewline(stderrData);
    console.error(stderrData);
    stderrData = "";
  });
};

const removeTrailingNewline = (str) => {
  if (str.endsWith("\n")) {
    return str.slice(0, -1);
  }
  return str;
};

const executeMigrationUtil = () => {
  const childProcess = exec(`node ${migrationUtilPath} "${currentDirectory}" ${args.join(" ")}`);

  captureAndDisplayLogs(childProcess);

  childProcess.on("error", (error) => {
    console.error(`Error: ${error.message}`);
  });

  childProcess.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
  });
};

executeMigrationUtil();
