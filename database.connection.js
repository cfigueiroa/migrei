import pg from "pg";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";

const currentDirectory = process.cwd();

const myEnv = dotenv.config({ path: path.resolve(currentDirectory, ".env") });
dotenvExpand.expand(myEnv);

const { Pool } = pg;

const configDatabase = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.MODE === "prod") configDatabase.ssl = true;

const db = new Pool(configDatabase);

export default db;
