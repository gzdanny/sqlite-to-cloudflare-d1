# sqlite-to-cloudflare-d1

A command-line tool to migrate local SQLite databases to Cloudflare D1. It automatically detects login status, creates remote databases, syncs table structures, and imports data in batches with progress tracking.

## 🚀 Features

- ✅ Checks Cloudflare Wrangler login status before execution
- ✅ Creates D1 database if it doesn't exist
- ✅ Reads local SQLite schema and generates matching D1 tables
- ✅ Imports data in configurable batches with progress bar
- ✅ Supports both command-line arguments and interactive prompts

## 📦 Requirements

- Node.js ≥ 18
- Cloudflare Wrangler CLI
- SQLite database file (.db)

## 📥 Installation

Install dependencies locally:

```bash
npm install better-sqlite3 cli-progress minimist inquirer
```

Install Wrangler globally:

```bash
npm install -g wrangler
wrangler login
```

## 🧰 Usage

Run with command-line arguments:

```bash
node d1sync.js -ldb ./data.db -rdb my-d1-db -b 100
```

Or run without arguments and follow interactive prompts:

```bash
node d1sync.js
```

### Command-line options

| Option   | Description                              | Required | Default         |
|----------|------------------------------------------|----------|-----------------|
| `-ldb`   | Path to local SQLite database file       | Yes      | —               |
| `-rdb`   | Cloudflare D1 database name              | No       | Derived from ldb|
| `-b`     | Batch size for data import               | No       | `100`           |
| `-h`     | Show help message                        | No       | —               |

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Pull requests and suggestions are welcome! Feel free to fork the repo, open issues, or submit improvements.

## 📚 Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Guide](https://developers.cloudflare.com/workers/wrangler/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
