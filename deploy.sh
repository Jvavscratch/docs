#!/bin/bash

# 部署脚本：构建并部署jvavscratch文档到GitHub Pages

echo "开始构建和部署jvavscratch文档..."

# 确保有执行权限
chmod +x "$0"

# 检查是否在docs目录
if [ ! -f "package.json" ]; then
  echo "错误：请在docs目录下运行此脚本"
  exit 1
fi

# 安装依赖
echo "安装依赖..."
npm install
if [ $? -ne 0 ]; then
  echo "错误：依赖安装失败"
  exit 1
fi

# 构建文档
echo "构建文档..."
npm run build
if [ $? -ne 0 ]; then
  echo "错误：文档构建失败"
  exit 1
fi

# 检查dist目录是否存在 - 注意：在配置中outDir设置为'../dist'
if [ ! -d "../dist" ]; then
  echo "错误：构建输出目录 '../dist' 不存在"
  exit 1
fi

echo "文档构建成功！"
echo "下一步可以使用GitHub Actions自动部署到GitHub Pages，或者手动部署../dist目录的内容。"
echo "使用方法："
echo "1. 自动部署：提交代码到main分支，GitHub Actions将自动部署"
echo "2. 手动部署：将../dist目录的内容推送到gh-pages分支"

# 提示如何手动部署
echo ""
echo "如需手动部署，可执行以下命令："
echo "cd ../dist"
echo "git init"
echo "git add -A"
echo "git commit -m 'deploy'"
echo "git push -f git@github.com:Jvavscratch/jvavscratch.git master:gh-pages"
echo ""
echo "注意：GitHub组织名称已设置为Jvavscratch"