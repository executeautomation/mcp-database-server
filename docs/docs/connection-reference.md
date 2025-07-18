# Connection Reference

This page provides a comprehensive reference for all connection options available for each supported database type.

## SQLite Connection Options

SQLite is the simplest database to connect to, as it only requires a path to the database file.

```bash
node dist/src/index.js /path/to/your/database.db
```

### Special Paths

- `:memory:` - Creates an in-memory database (data is lost when connection is closed)
- `""` (empty string) - Creates a temporary on-disk database

## SQL Server Connection Options

| Option | Description | Default | Required |
|--------|-------------|---------|----------|
| `--sqlserver` | Specifies SQL Server mode | - | Yes |
| `--server` | SQL Server hostname or IP | - | Yes |
| `--database` | Database name | - | Yes |
| `--user` | SQL Server username | - | No* |
| `--password` | SQL Server password | - | No* |
| `--port` | SQL Server port | 1433 | No |
| `--trustServerCertificate` | Trust server certificate (true/false) | false | No |
| `--connectionTimeout` | Connection timeout in ms | 15000 | No |
| `--requestTimeout` | Request timeout in ms | 15000 | No |

*Windows Authentication is used if user and password are omitted

### Example with Windows Authentication

```bash
node dist/src/index.js --sqlserver --server localhost\\SQLEXPRESS --database Northwind
```

### Example with SQL Authentication

```bash
node dist/src/index.js --sqlserver --server dbserver.example.com --database Northwind --user sa --password P@ssw0rd --port 1433
```

## PostgreSQL Connection Options

| Option | Description | Default | Required |
|--------|-------------|---------|----------|
| `--postgresql` or `--postgres` | Specifies PostgreSQL mode | - | Yes |
| `--host` | PostgreSQL hostname or IP | - | Yes |
| `--database` | Database name | - | Yes |
| `--user` | PostgreSQL username | - | No |
| `--password` | PostgreSQL password | - | No |
| `--port` | PostgreSQL port | 5432 | No |
| `--ssl` | Use SSL connection (true/false) | false | No |
| `--connection-timeout` | Connection timeout in ms | 30000 | No |

### Basic Example

```bash
node dist/src/index.js --postgresql --host localhost --database sample_db --user postgres --password secret
```

### Example with SSL and Custom Port

```bash
node dist/src/index.js --postgresql --host dbserver.example.com --database sample_db --user appuser --password Secure123! --port 5433 --ssl true
```

## MySQL Connection Options

| Option | Description | Default | Required |
|--------|-------------|---------|----------|
| `--mysql` | Specifies MySQL mode | - | Yes |
| `--host` | MySQL hostname or IP | - | Yes |
| `--database` | Database name | - | Yes |
| `--user` | MySQL username | - | No* |
| `--password` | MySQL password | - | No* |
| `--port` | MySQL port | 3306 | No |
| `--ssl` | Use SSL connection (true/false or object) | false | No |
| `--connection-timeout` | Connection timeout in ms | 30000 | No |
| `--aws-iam-auth` | Enable AWS IAM authentication | false | No |
| `--aws-region` | AWS region for RDS IAM auth | - | No** |

*Required for standard authentication  
**Required when using `--aws-iam-auth`

### Standard Authentication Example

```bash
node dist/src/index.js --mysql --host localhost --database sample_db --port 3306 --user root --password secret
```

### AWS IAM Authentication Example

**Prerequisites:** AWS credentials must be configured using the default credential provider chain:
- `aws configure` (default profile) 
- `AWS_PROFILE=myprofile` environment variable
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables
- IAM roles (if running on EC2)

```bash
node dist/src/index.js --mysql --aws-iam-auth --host rds-endpoint.region.rds.amazonaws.com --database sample_db --user aws-username --aws-region us-east-1
```

## Environment Variables

Instead of specifying sensitive credentials on the command line, you can use environment variables:

### SQL Server Environment Variables

- `MSSQL_SERVER` - SQL Server hostname
- `MSSQL_DATABASE` - Database name
- `MSSQL_USER` - SQL Server username
- `MSSQL_PASSWORD` - SQL Server password

### PostgreSQL Environment Variables

- `PGHOST` - PostgreSQL hostname
- `PGDATABASE` - Database name
- `PGUSER` - PostgreSQL username
- `PGPASSWORD` - PostgreSQL password
- `PGPORT` - PostgreSQL port

## Connection Pooling

All database connections use connection pooling for better performance:

- **SQLite**: Uses a single persistent connection
- **SQL Server**: Default pool of 5 connections
- **PostgreSQL**: Default pool of 10 connections

## Connection Security

For secure connections:

1. **SQL Server**: Use `--trustServerCertificate false` in production and ensure proper SSL certificates are installed on the server.

2. **PostgreSQL**: Use `--ssl true` and ensure the server is configured for SSL connections.

3. For all database types, consider using environment variables instead of passing credentials on the command line.

4. Store your Claude Desktop configuration file with appropriate file system permissions. 