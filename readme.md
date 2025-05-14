[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/executeautomation-mcp-database-server-badge.png)](https://mseep.ai/app/executeautomation-mcp-database-server)

# MCP Database Server

This MCP (Model Context Protocol) server provides database access capabilities to Claude, supporting SQLite, SQL Server, and PostgreSQL databases.

## Installation

1. Clone the repository:
```
git clone https://github.com/executeautomation/database-server.git
cd database-server
```

2. Install dependencies:
```
npm install
```

3. Build the project:
```
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

```
node dist/src/index.js /path/to/your/database.db
```

### SQL Server Database

To use with a SQL Server database:

```
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

```
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

## Configuring Claude Desktop

### Direct Usage Configuration

If you installed the package globally, configure Claude Desktop with:

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/database-server",
        "/path/to/your/database.db"
      ]
    },
    "sqlserver": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/database-server",
        "--sqlserver",
        "--server", "your-server-name",
        "--database", "your-database-name",
        "--user", "your-username",
        "--password", "your-password"
      ]
    },
    "postgresql": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/database-server",
        "--postgresql",
        "--host", "your-host-name",
        "--database", "your-database-name",
        "--user", "your-username",
        "--password", "your-password"
      ]
    }
  }
}
```

### Local Development Configuration

For local development, configure Claude Desktop to use your locally built version:

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-database-server/dist/src/index.js", 
        "/path/to/your/database.db"
      ]
    },
    "sqlserver": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-database-server/dist/src/index.js",
        "--sqlserver",
        "--server", "your-server-name",
        "--database", "your-database-name",
        "--user", "your-username",
        "--password", "your-password"
      ]
    },
    "postgresql": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-database-server/dist/src/index.js",
        "--postgresql",
        "--host", "your-host-name",
        "--database", "your-database-name",
        "--user", "your-username",
        "--password", "your-password"
      ]
    }
  }
}
```

The Claude Desktop configuration file is typically located at:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

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

For practical examples of how to use these tools with Claude, see [Usage Examples](docs/usage-examples.md).

## Additional Documentation

- [SQL Server Setup Guide](docs/sql-server-setup.md): Details on connecting to SQL Server databases
- [PostgreSQL Setup Guide](docs/postgresql-setup.md): Details on connecting to PostgreSQL databases
- [Usage Examples](docs/usage-examples.md): Example queries and commands to use with Claude

## Development

To run the server in development mode:

```
npm run dev
```

To watch for changes during development:

```
npm run watch
```

## Requirements

- Node.js 18+
- For SQL Server connectivity: SQL Server 2012 or later
- For PostgreSQL connectivity: PostgreSQL 9.5 or later

## License

MIT
