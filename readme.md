# MCP Database Server

[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/executeautomation-mcp-database-server-badge.png)](https://mseep.ai/app/executeautomation-mcp-database-server)

This MCP (Model Context Protocol) server provides database access capabilities to Claude, supporting SQLite, SQL Server, PostgreSQL, and MySQL databases.

## Installation

1. Clone the repository:

```shell
git clone https://github.com/executeautomation/database-server.git
cd database-server
```

1. Install dependencies:

```shell
npm install
```

1. Build the project:

```shell
npm run build
```

## Usage Options

There are two ways to use this MCP server with Claude:

1. **Direct usage**: Install the package globally and use it directly
2. **Local development**: Run from your local development environment

### Direct Usage with NPM Package

The easiest way to use this MCP server is by installing it globally:

```bash
npm install -g @executeautomation/database-server
```

This allows you to use the server directly without building it locally.

### Local Development Setup

If you want to modify the code or run from your local environment:

1. Clone and build the repository as shown in the Installation section
2. Run the server using the commands in the Usage section below

## Usage

### SQLite Database

To use with an SQLite database:

```shell
node dist/src/index.js /path/to/your/database.db [--insights-db <insights_db_path>]
```

### SQL Server Database

To use with a SQL Server database:

```shell
node dist/src/index.js --sqlserver --server <server-name> --database <database-name> [--user <username> --password <password>]
```

Required parameters:

- `--server`: SQL Server host name or IP address
- `--database`: Name of the database

Optional parameters:

- `--user`: Username for SQL Server authentication (if not provided, Windows Authentication will be used)
- `--password`: Password for SQL Server authentication
- `--port`: Port number (default: 1433)

### PostgreSQL Database

To use with a PostgreSQL database:

```shell
node dist/src/index.js --postgresql --host <host-name> --database <database-name> [--user <username> --password <password>]
```

Required parameters:

- `--host`: PostgreSQL host name or IP address
- `--database`: Name of the database

Optional parameters:

- `--user`: Username for PostgreSQL authentication
- `--password`: Password for PostgreSQL authentication
- `--port`: Port number (default: 5432)
- `--ssl`: Enable SSL connection (true/false)
- `--connection-timeout`: Connection timeout in milliseconds (default: 30000)

### MySQL Database

To use with a MySQL database:

```shell
node dist/src/index.js --mysql --host <host-name> --database <database-name> [--user <username> --password <password> --port <port>]
```

Required parameters:

- `--host`: MySQL host name or IP address
- `--database`: Name of the database

Optional parameters:

- `--user`: Username for MySQL authentication
- `--password`: Password for MySQL authentication
- `--ssl`: Enable SSL connection (true/false or object)
- `--connection-timeout`: Connection timeout in milliseconds (default: 30000)
- `--port`: Port number (default: 3306)

## Multi-Database Configuration

### Using a Config File for Multiple Databases

You can now start the MCP server with access to multiple databases by specifying a JSON config file via the `--config <file>` command line argument. This enables you to manage and query multiple databases simultaneously.

- **Config file location:** You can use either an absolute or relative path for the config file. A common convention is to place it in your project root, e.g., `./db-config.json`.
- **Config file format:** See below for an example. Each key is a unique `dbId` for the database.

#### Example Config File

```json
{
  "main_sqlite": {
    "type": "sqlite",
    "description": "Primary SQLite DB",
    "path": "/data/main.db"
  },
  "analytics_pg": {
    "type": "postgresql",
    "description": "Analytics PostgreSQL DB",
    "host": "localhost",
    "database": "analytics",
    "user": "user",
    "password": "pass"
  },
  "insights_db": "./insights.sqlite"
}
```

#### Supported Database Types and Required Fields

| type        | Required Fields                                 | Optional Fields      |
|-------------|-------------------------------------------------|---------------------|
| sqlite      | path                                            | description         |
| sqlserver   | server, database                                | user, password, port, description |
| postgresql  | host, database                                  | user, password, port, ssl, connectionTimeout, description |
| mysql       | host, database                            | user, password, port, ssl, connectionTimeout, description |

#### Starting the Server with Multiple Databases

```shell
node dist/src/index.js --config path/to/config.json
```

#### Listing Available Databases

A new tool, `list_databases`, is available to enumerate all configured databases by ID, type, and description. You can call this tool to discover which `dbId` values are available for use in subsequent requests.

**Example tool call:**

```json
{
  "name": "list_databases",
  "arguments": {}
}
```

**Response:**

```json
{
  "databases": [
    { "id": "main_sqlite", "type": "sqlite", "description": "Primary SQLite DB" },
    { "id": "analytics_pg", "type": "postgresql", "description": "Analytics PostgreSQL DB" }
  ]
}
```

#### Specifying dbId in Requests

- For all resource and tool requests, you must now specify the `dbId` parameter to indicate which database to operate on.
- **Tool call example:**

  ```json
  {
    "dbId": "main_sqlite",
    "query": "SELECT * FROM users"
  }
  ```

- **Resource request example:**

  ```json
  {
    "dbId": "main_sqlite",
    "uri": "sqlite:///data/main.db/users/schema"
  }
  ```

- For resource requests, include `dbId` in the request parameters.

#### Backward Compatibility

If you do not use the `--config` option, the server will operate in single-database mode as before, and `dbId` will default to `default` internally. You can continue to use the CLI as before for single-database use cases.

### Insights Database Configuration

You can configure a separate SQLite database for storing business insights (used by the append_insight and list_insights tools). This is independent of your main data sources and is always writable.

- **Config file:** Add a top-level field `"insights_db"` with the path to a SQLite file (e.g., `"./insights.sqlite"`).
- **CLI option:** In single-db mode, use `--insights-db <path>` to specify the insights database file.
- **Default:** If not set, the default is `./insights.sqlite` in the project root.
- **Ephemeral:** Use `:memory:` as the path for a non-persistent, in-memory insights database.

This ensures insights are always writable and never stored in your main (possibly read-only) databases.

## Environment Variables

No environment variables are required by default. If you wish to use environment variables for secrets (e.g., DB passwords), you can reference them in your config file using your own scripting or config management approach.

## Troubleshooting

**Common errors and solutions:**

- **Config file not found:**
  - Ensure the path to your config file is correct and the file exists.
- **Invalid config file format:**
  - The config file must be a valid JSON object mapping dbId to config objects.
- **Missing dbId in request:**
  - All requests must specify a valid `dbId` when in multi-database mode.
- **Database connection errors:**
  - Check your connection parameters (host, user, password, etc.) and ensure the database server is running and accessible.
- **Unsupported database type:**
  - Ensure the `type` field in your config is one of: `sqlite`, `sqlserver`, `postgresql`, or `mysql`.

## Running Tests

If you have tests:

```shell
npm test
```

If not, you can check your build and lint the code with:

```shell
npm run build
npm run lint
```

## Contact / Support

For help, questions, or to report bugs, please open an issue on the [GitHub Issues page](https://github.com/executeautomation/database-server/issues).

## Available Database Tools

The MCP Database Server provides the following tools that Claude can use:

| Tool | Description | Required Parameters |
|------|-------------|---------------------|
| `read_query` | Execute SELECT queries to read data | `query`: SQL SELECT statement |
| `write_query` | Execute INSERT, UPDATE, or DELETE queries | `query`: SQL modification statement |
| `create_table` | Create new tables in the database | `query`: CREATE TABLE statement |
| `alter_table` | Modify existing table schema | `query`: ALTER TABLE statement |
| `drop_table` | Remove a table from the database | `table_name`: Name of table<br>`confirm`: Safety flag (must be true) |
| `list_tables` | Get a list of all tables | None |
| `describe_table` | View schema information for a table | `table_name`: Name of table |
| `export_query` | Export query results as CSV/JSON | `query`: SQL SELECT statement<br>`format`: "csv" or "json" |
| `append_insight` | Add a business insight to memo | `insight`: Text of insight |
| `list_insights` | List all business insights | None |

> **Note:** The `append_insight` and `list_insights` tools are currently mock implementations and do not persist insights between requests.

For practical examples of how to use these tools with Claude, see [Usage Examples](docs/usage-examples.md).

## Additional Documentation

- [SQL Server Setup Guide](docs/sql-server-setup.md): Details on connecting to SQL Server databases
- [PostgreSQL Setup Guide](docs/postgresql-setup.md): Details on connecting to PostgreSQL databases
- [Usage Examples](docs/usage-examples.md): Example queries and commands to use with Claude

## Development

To run the server in development mode:

```shell
npm run dev
```

To watch for changes during development:

```shell
npm run watch
```

## Requirements

- Node.js 18+
- For SQL Server connectivity: SQL Server 2012 or later
- For PostgreSQL connectivity: PostgreSQL 9.5 or later

## License

MIT
