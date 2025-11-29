# 安装

本指南将详细介绍如何安装jvavscratch工具，包括不同的安装方式和环境要求。

## 环境要求

在安装jvavscratch之前，请确保您的系统满足以下要求：

- **Node.js**: v14.0.0 或更高版本
- **npm**: v6.0.0 或更高版本（通常与Node.js一起安装）

您可以通过以下命令检查您的Node.js和npm版本：

```bash
node -v
npm -v
```

如果您还没有安装Node.js，可以从[官方网站](https://nodejs.org/)下载并安装。

## 方法一：通过npm全局安装

最简单的安装方式是使用npm全局安装jvavscratch CLI：

```bash
npm install -g jvavscratch-cli
```

这将在您的系统上全局安装jvavscratch命令行工具，您可以在任何目录中使用`jvavscratch`命令。

安装完成后，您可以通过以下命令验证安装是否成功：

```bash
jvavscratch --version
```

如果安装成功，将显示当前安装的jvavscratch版本。

## 方法二：通过yarn安装

如果您使用yarn作为包管理器，可以使用以下命令安装：

```bash
yarn global add jvavscratch-cli
```

## 方法三：从源码安装

如果您想使用最新的开发版本，或者需要修改源代码，可以从GitHub克隆仓库并手动安装：

```bash
# 克隆仓库
git clone https://github.com/jvavscratch/jvavscratch.git
cd jvavscratch

# 安装依赖
npm install

# 构建项目
npm run build

# 链接到全局环境
npm link
```

## 疑难解答

### 权限问题

如果您在安装过程中遇到权限问题，可以尝试使用sudo（Linux/macOS）或以管理员身份运行命令提示符（Windows）：

Linux/macOS:
```bash
sudo npm install -g jvavscratch-cli
```

Windows:
- 右键点击命令提示符图标
- 选择"以管理员身份运行"
- 在打开的命令提示符中运行安装命令

### 网络问题

如果您在安装过程中遇到网络问题，可以尝试使用npm的镜像源：

```bash
npm config set registry https://registry.npmmirror.com
npm install -g jvavscratch-cli
```

### 更新jvavscratch

要更新jvavscratch到最新版本，可以使用以下命令：

```bash
npm update -g jvavscratch-cli
```