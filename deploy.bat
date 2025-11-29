@echo off

rem 部署脚本：构建并部署jvavscratch文档到GitHub Pages

echo 开始构建和部署jvavscratch文档...

rem 检查是否在docs目录
if not exist "package.json" (
  echo 错误：请在docs目录下运行此脚本
  exit /b 1
)

rem 安装依赖
echo 安装依赖...
npm install
if %errorlevel% neq 0 (
  echo 错误：依赖安装失败
  exit /b 1
)

rem 构建文档
echo 构建文档...
npm run build
if %errorlevel% neq 0 (
  echo 错误：文档构建失败
  exit /b 1
)

rem 检查dist目录是否存在 - 注意：在配置中outDir设置为'../dist'
if not exist "..\dist" (
  echo 错误：构建输出目录 '..\dist' 不存在
  exit /b 1
)

echo 文档构建成功！
echo 下一步可以使用GitHub Actions自动部署到GitHub Pages，或者手动部署..\dist目录的内容。
echo 使用方法：
echo 1. 自动部署：提交代码到main分支，GitHub Actions将自动部署
echo 2. 手动部署：将..\dist目录的内容推送到gh-pages分支

echo.
echo 如需手动部署，请执行以下步骤：
echo 1. 进入..\dist目录
  echo 2. 初始化git仓库：git init
  echo 3. 添加所有文件：git add -A
  echo 4. 提交更改：git commit -m 'deploy'
  echo 5. 推送到GitHub：git push -f git@github.com:Jvavscratch/jvavscratch.git master:gh-pages

echo.
echo 注意：GitHub组织名称已设置为Jvavscratch