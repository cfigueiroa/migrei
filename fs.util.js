import fs from "fs";
import path from "path";

function readFileSync(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFileSync(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function getFilesWithExtension(directoryPath, extension) {
  return fs.readdirSync(directoryPath).filter((file) => path.extname(file) === extension);
}

export { readFileSync, writeFileSync, getFilesWithExtension };
