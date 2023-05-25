import path from "path";
//import { fileURLToPath } from "url";
import db from "./database.connection.js";
import { readFileSync, writeFileSync, getFilesWithExtension } from "./fs.util.js";

const [currentDirectory, action, numTables] = process.argv.slice(2);

//const thisFileAbsolutePath = fileURLToPath(import.meta.url);
//const thisDirectoryAbsolutePath = path.dirname(thisFileAbsolutePath);
const migrationsDirectoryPath = path.join(currentDirectory, "/migrations");
const migrationIndexFilePath = path.join(migrationsDirectoryPath, "migrationIndex.txt");

function reverseQuery(query) {
  const queryParts = query.split(/\s+/);
  const queryType = queryParts[0].toUpperCase();

  switch (queryType) {
    case "CREATE":
      if (queryParts[1].toUpperCase() === "TABLE") {
        const tableNameMatch = query.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(")?(\w+)\1?/i);
        if (tableNameMatch && tableNameMatch.length > 2) {
          const tableName = tableNameMatch[2];
          return `DROP TABLE IF EXISTS "${tableName}";`;
        }
      }
      break;

    case "ALTER":
      if (queryParts[1].toUpperCase() === "TABLE") {
        const tableNameMatch = query.match(/ALTER\s+TABLE\s+(["]?)(\w+)\1/i);
        if (tableNameMatch && tableNameMatch.length > 2) {
          const tableName = tableNameMatch[2];
          const constraintNameMatch = query.match(/ADD\s+CONSTRAINT\s+(["]?)(\w+)\1/i);
          if (constraintNameMatch && constraintNameMatch.length > 2) {
            const constraintName = constraintNameMatch[2];
            return `ALTER TABLE "${tableName}" DROP CONSTRAINT "${constraintName}";`;
          }
        }
      }
      break;

    default:
      break;
  }

  throw new Error(`Unsupported query type: ${queryType}`);
}

async function migrateTables(migrationFiles, numTables = null, isCreating = true) {
  let currentMigrationIndex = getCurrentMigrationIndex();
  const startIndex = isCreating ? currentMigrationIndex : 0;
  const endIndex = isCreating ? migrationFiles.length : currentMigrationIndex;

  const migrationFilesToProcess = migrationFiles.slice(startIndex, endIndex);
  const actionLabel = isCreating ? "created" : "dropped";
  const actionVerb = isCreating ? "creating" : "dropping";

  let numFilesToProcess =
    numTables !== null ? Math.min(numTables, migrationFilesToProcess.length) : migrationFilesToProcess.length;

  if (!isCreating) migrationFilesToProcess.reverse();

  for (const migrationFile of migrationFilesToProcess) {
    const migrationFilePath = path.join(migrationsDirectoryPath, migrationFile);
    const migrationQueries = readFileSync(migrationFilePath).split(";");

    const reversedMigrationQueries = isCreating ? migrationQueries : migrationQueries.reverse();

    let processedQueries = 0;

    for (const migrationQuery of reversedMigrationQueries) {
      const trimmedQuery = migrationQuery.trim();

      if (trimmedQuery.length === 0) continue;

      try {
        await db.query(isCreating ? trimmedQuery : reverseQuery(trimmedQuery));
        const queryNumber = isCreating ? processedQueries + 1 : reversedMigrationQueries.length - processedQueries - 1;
        console.log(`Query ${queryNumber} of file ${migrationFile} was sucessful executed!`);
      } catch (error) {
        console.error(`Error ${actionVerb} query ${trimmedQuery}:`, error);
      }

      processedQueries++;

      if (processedQueries === reversedMigrationQueries.length) {
        break;
      }
    }

    currentMigrationIndex += isCreating ? 1 : -1;
    updateMigrationIndex(currentMigrationIndex);

    numFilesToProcess--;

    if (numFilesToProcess === 0) {
      break;
    }
  }

  console.log(`\nQueries ${actionLabel} successfully!`);
  db.end();
}

function getCurrentMigrationIndex() {
  try {
    const index = readFileSync(migrationIndexFilePath);
    return parseInt(index.trim()) || 0;
  } catch (error) {
    return 0;
  }
}

function updateMigrationIndex(index) {
  writeFileSync(migrationIndexFilePath, index.toString());
}

function handleMigrationAction(action, numTables) {
  const currentMigrationIndex = getCurrentMigrationIndex();
  const migrationFiles = getFilesWithExtension(migrationsDirectoryPath, ".sql");

  switch (action) {
    case "create":
      if (currentMigrationIndex === migrationFiles.length) {
        console.log("All tables already created. Skipping migration.");
      } else {
        const remainingTables = migrationFiles.length - currentMigrationIndex;
        const tablesToCreate = numTables !== null ? Math.min(numTables, remainingTables) : remainingTables;
        migrateTables(migrationFiles, tablesToCreate, true);
      }
      break;

    case "drop":
      if (currentMigrationIndex === 0) {
        console.log("No tables to drop. Skipping migration.");
      } else {
        const tablesToDrop = numTables !== null ? Math.min(numTables, currentMigrationIndex) : currentMigrationIndex;
        migrateTables(migrationFiles, tablesToDrop, false);
      }
      break;

    default:
      console.error('Invalid action. Use "create" or "drop"');
      process.exit(1);
  }
}

handleMigrationAction(action, parseInt(numTables) || null);
