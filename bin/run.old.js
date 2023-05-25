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

exec(`node ${migrationUtilPath} "${currentDirectory}" ${args.join(" ")}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
