# 常见问题

这里收集了用户在使用jvavscratch过程中可能遇到的常见问题和解答。如果您的问题没有在此处找到答案，请在[GitHub Issues](https://github.com/your-org/jvavscratch/issues)中提出。

## 基础问题

### jvavscratch是什么？

jvavscratch是一个强大的工具，允许开发者使用JavaScript语法编写代码，并将其转换为Scratch项目文件(.sb3)。它的主要目标是让有JavaScript编程经验的开发者能够更高效地创建Scratch项目。

### jvavscratch支持哪些JavaScript特性？

jvavscratch支持JavaScript的部分核心特性，包括：
- 变量声明和赋值
- 条件语句（if, else if, else）
- 循环语句（while, for）
- 函数定义和调用
- 类定义和继承
- 基本运算符

请注意，由于Scratch的限制，jvavscratch不支持JavaScript的所有高级特性，如闭包、Promise、异步/await等。

## 安装与配置

### 安装jvavscratch需要什么环境？

jvavscratch需要以下环境：
- Node.js v14.0.0或更高版本
- npm v6.0.0或更高版本

### 如何验证安装是否成功？

安装完成后，您可以在命令行中运行以下命令来验证安装是否成功：

```bash
jvavscratch --version
```

如果安装成功，将显示jvavscratch的版本号。

## 使用问题

### 如何创建一个新的jvavscratch项目？

您可以使用以下命令创建一个新的jvavscratch项目：

```bash
jvavscratch init my-project
cd my-project
```

### 如何编译jvavscratch项目为Scratch文件？

在项目目录中运行以下命令来编译项目：

```bash
jvavscratch build
```

编译后的Scratch文件将默认输出到`dist`目录。

### 如何在开发过程中实时预览效果？

您可以使用以下命令启动开发服务器，它将监视文件变化并自动重新编译：

```bash
jvavscratch dev
```

### jvavscratch支持自定义Scratch块吗？

当前版本的jvavscratch主要支持Scratch的标准块。对于自定义块的支持，我们正在开发中。

### 如何使用jvavscratch访问Scratch中的列表？

您可以使用以下语法访问Scratch中的列表：

```js
// 引用名为 'example' 的列表
let items = _list_example;
```

## 转换问题

### 为什么我的JavaScript代码无法完全转换？

jvavscratch只能转换与Scratch功能相对应的JavaScript特性。某些JavaScript高级特性（如闭包、Promise等）无法在Scratch中表示，因此会被转换为等效的简单实现或导致编译错误。

### 如何处理转换错误？

当遇到转换错误时，jvavscratch会提供详细的错误信息，包括错误位置和原因。您需要根据错误信息修改代码，使其符合jvavscratch的语法规则。

## 性能问题

### jvavscratch生成的Scratch项目性能如何？

jvavscratch尽可能生成高效的Scratch积木块，但复杂的JavaScript逻辑可能会导致生成的Scratch项目性能下降。对于性能敏感的项目，建议优化JavaScript代码结构，避免复杂的嵌套逻辑。

### 大型项目的编译速度如何？

编译速度取决于项目的复杂度和文件数量。对于大型项目，编译时间可能会增加。如果您遇到编译性能问题，可以尝试将项目拆分为多个较小的模块。

## 高级使用

### 如何扩展jvavscratch的功能？

jvavscratch采用模块化设计，您可以通过开发插件来扩展其功能。插件开发相关文档正在编写中。

### 如何贡献代码到jvavscratch项目？

我们欢迎社区贡献！请在GitHub上fork项目，创建您的特性分支，提交更改，然后创建Pull Request。详情请查看[贡献指南](/contributing)。

## 故障排除

### 编译时遇到"Cannot find module"错误怎么办？

这通常意味着缺少依赖项。请尝试重新安装依赖：

```bash
npm install
```

### 生成的Scratch文件在Scratch编辑器中无法打开怎么办？

这可能是由于编译错误或生成的文件格式不正确。请检查编译过程中的错误信息，确保代码符合jvavscratch的语法规则。如果问题仍然存在，请在GitHub Issues中报告。

### 变量和列表同名会发生什么？

如果变量和列表同名，sb3将无法正确构建。请确保变量和列表使用不同的名称。