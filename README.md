# Migrei

Migrei is an SQL migration npm library specifically designed for PostgreSQL databases. It allows you to manage and execute SQL migration scripts to evolve your database schema over time.

## Usage

Migrei provides a command-line interface (CLI) that you can use to perform migrations. To use Migrei, you don't need to globally install the package. Instead, you can run it using `npx`, which will automatically install Migrei if it's not already installed in your project.

The CLI automatically reads the database configuration from the `.env` file in the execution folder.

Make sure you have a `.env` file in your project directory, and define the `DATABASE_URL` variable in the following format:

```bash
DATABASE_URL=postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

Migrei will use the values provided in the `DATABASE_URL` to establish a connection to your PostgreSQL database.

The CLI supports the following commands:

### Up

The `up` command applies migrations to the database by executing SQL scripts in alphabetical order. It iterates over all files in the `./migrations` folder and applies the queries within them.

To run migrations, use the following command:

```bash
npx migrei up
```

Migrei assumes that the migration files are named in a pattern such as `001.sql`, `002.sql`, `003.sql`, and so on. Naming your migration files in this pattern helps ensure the correct order of execution.

### Down

The `down` command reverses the migrations by undoing the changes made by the previously executed migration scripts. You don't need to write the opposite queries explicitly. Migrei tracks the applied migrations and generates the appropriate rollback statements automatically.

To undo migrations, use the following command:

```bash
npx migrei down
```


### Batch Size

Both the `up` and `down` commands support an optional batch size parameter (`n`). This allows you to specify the number of files to process in each run. It can be helpful when you want to apply or rollback migrations in smaller batches.

To process a specific number of files at a time, use the following commands:

```bash
npx migrei up n
npx migrei down n
```

Replace `n` with the integer for desired batch size.

### Multiple Queries in a File

Migrei supports having multiple queries within a single migration file. Each query is separated by a semicolon (`;`). When executing the migration, Migrei will split the file into individual queries and execute them sequentially.

## Example

Here's an example of how you can use Migrei to manage your database migrations:

1. Create a new folder called `migrations` in your project directory.

2. Add your migration SQL files in the `migrations` folder, following the naming pattern `001.sql`, `002.sql`, `003.sql`, and so on. Each file should contain one or more SQL queries. You can also use more meaningful names like `001_create_table_users.sql`

3. To apply the migrations and update the database, run:

```bash
npx migrei up
```

4. To rollback all migrations and undo its changes, run:

```bash
npx migrei down
```

5. You can also specify a batch size for the up and down commands. For example, to process two files at a time, use:

```bash
npx migrei up 2
npx migrei down 2
```

That's it! Now you can effectively manage your database schema using Migrei.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request for any improvements or new features you'd like to add.