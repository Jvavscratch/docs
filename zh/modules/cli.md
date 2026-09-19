# CLI 模块

CLI（Command Line Interface）模块是jvavscratch的命令行工具，提供了项目创建、编译、开发等功能的命令行接口，是用户与jvavscratch交互的主要入口点。

## 安装CLI

安装jvavscratch后，CLI工具会自动安装到您的系统中：

```bash
npm install -g jvavscratch
```

安装完成后，您可以通过`jvavscratch`命令访问CLI工具。

## 基本命令

### 查看版本

```bash
jvavscratch --version
# 或
jvavscratch -v
```

显示jvavscratch的当前版本。

### 查看帮助

```bash
jvavscratch --help
# 或
jvavscratch -h
```

显示CLI工具的帮助信息，包括所有可用命令和选项。

## 核心命令

### 1. 初始化项目

```bash
jvavscratch init [project-name]
# 或简写
jvavscratch i [project-name]
```

创建一个新的jvavscratch项目。如果不指定项目名称，将在当前目录初始化项目。

**选项：**
- `--template <template-name>`: 指定项目模板（目前仅支持默认模板）
- `--no-install`: 跳过依赖安装

**示例：**
```bash
# 在当前目录初始化项目
jvavscratch init

# 创建新目录并初始化项目
jvavscratch init my-project
```

### 2. 构建项目

```bash
jvavscratch build
# 或简写
jvavscratch b
```

将jvavscratch项目编译为Scratch项目文件(.sb3)。

**选项：**
- `--config <config-path>`: 指定配置文件路径
- `--output <output-path>`: 指定输出目录或文件
- `--watch`: 监视文件变化并自动重新构建

**示例：**
```bash
# 使用默认配置构建项目
jvavscratch build

# 指定输出目录
jvavscratch build --output ./my-output

# 监视模式
jvavscratch build --watch
```

### 3. 开发服务器

```bash
jvavscratch dev
# 或简写
jvavscratch d
```

启动开发服务器，监视文件变化并自动重新构建，便于实时预览开发效果。

**选项：**
- `--port <port>`: 指定开发服务器端口（默认：3000）
- `--config <config-path>`: 指定配置文件路径

**示例：**
```bash
# 使用默认端口启动开发服务器
jvavscratch dev

# 指定端口
jvavscratch dev --port 4000
```

### 4. 反编译Scratch项目

```bash
jvavscratch decompile <sb3-file>
# 或简写
jvavscratch dc <sb3-file>
```

将Scratch项目文件(.sb3)反编译为jvavscratch JavaScript代码。

**选项：**
- `--output <output-path>`: 指定输出目录

**示例：**
```bash
# 反编译Scratch项目
jvavscratch decompile ./project.sb3

# 指定输出目录
jvavscratch decompile ./project.sb3 --output ./decompiled
```

### 5. 验证代码

```bash
jvavscratch validate [files...]
# 或简写
jvavscratch v [files...]
```

验证jvavscratch代码的语法和结构是否正确。如果不指定文件，将验证当前项目中的所有代码文件。

**示例：**
```bash
# 验证特定文件
jvavscratch validate ./src/main.js

# 验证所有文件
jvavscratch validate
```

## 配置文件

CLI工具会读取项目根目录下的`jvavscratch.config.js`文件作为配置。一个基本的配置文件如下：

```javascript
module.exports = {
  // 输入文件或目录
  input: './src',
  // 输出目录
  output: './dist',
  // Scratch项目信息
  project: {
    name: 'My Project',
    author: 'Your Name',
    description: 'Project description'
  },
  // 编译选项
  compiler: {
    strictMode: true
  }
};
```

## 全局配置

CLI工具支持以下环境变量：

- `JVAVSCRATCH_HOME`: jvavscratch的主目录，默认为用户主目录下的`.jvavscratch`
- `JVAVSCRATCH_CACHE_DIR`: 缓存目录，默认为`JVAVSCRATCH_HOME/cache`

## 常见问题

### 命令不被识别

如果您在安装后无法使用`jvavscratch`命令，请检查：

1. Node.js和npm是否正确安装
2. npm全局目录是否添加到了系统PATH中
3. 是否使用了正确的权限安装（可能需要管理员权限）

### 构建失败

如果构建失败，请检查：

1. 项目结构是否正确
2. JavaScript代码是否符合jvavscratch的语法规则
3. 查看错误信息，定位具体问题

### 开发服务器无法启动

如果开发服务器无法启动，请检查：

1. 指定的端口是否已被占用
2. 项目配置是否正确
3. 是否有足够的权限创建临时文件和目录