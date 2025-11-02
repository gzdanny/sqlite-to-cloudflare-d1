# sqlite-to-cloudflare-d1

一个命令行工具，用于将本地 SQLite 数据库迁移到 Cloudflare D1。它会自动检测登录状态、创建远程数据库、同步表结构，并以批量方式导入数据，支持进度条显示。

## 🚀 功能特色

- ✅ 自动检查 Cloudflare Wrangler 登录状态
- ✅ 自动创建 D1 数据库（如不存在）
- ✅ 自动读取 SQLite 表结构并在 D1 上建表
- ✅ 支持按批量导入数据并显示进度条
- ✅ 支持命令行参数和交互式输入方式

## 📦 环境要求

- Node.js ≥ 18
- Cloudflare Wrangler CLI
- SQLite 数据库文件（.db）

## 📥 安装依赖

使用以下命令安装项目所需依赖：

```bash
npm install better-sqlite3 cli-progress minimist inquirer
```

安装并登录 Cloudflare Wrangler：

```bash
npm install -g wrangler
wrangler login
```

## 🧰 使用方法

使用命令行参数运行：

```bash
node d1sync.js -ldb ./data.db -rdb my-d1-db -b 100
```

或直接运行，系统将自动提示缺失参数：

```bash
node d1sync.js
```

### 命令行参数说明

| 参数   | 说明                                 | 是否必填 | 默认值               |
|--------|--------------------------------------|----------|----------------------|
| `-ldb` | 本地 SQLite 数据库文件路径           | 是       | —                    |
| `-rdb` | Cloudflare D1 数据库名称             | 否       | 自动从 ldb 文件名推导 |
| `-b`   | 每批导入记录数                       | 否       | `100`                |
| `-h`   | 显示帮助信息                         | 否       | —                    |

## 📄 开源协议

本项目采用 MIT 协议开源，详情请见 [LICENSE](LICENSE) 文件。

## 🤝 参与贡献

欢迎提交 PR 或提出建议！你可以 Fork 本项目、提交 Issue 或直接改进代码。

## 📚 相关资源

- [Cloudflare D1 官方文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 使用指南](https://developers.cloudflare.com/workers/wrangler/)
- [better-sqlite3 项目主页](https://github.com/WiseLibs/better-sqlite3)
如果你还需要我生成 LICENSE 中文版、或者 README 中加入使用截图、演示视频链接等内容，也可以继续告诉我，我来帮你完善！
