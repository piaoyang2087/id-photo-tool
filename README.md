# 📸 证件照制作工具

一个基于 React + Vite 的证件照在线制作工具，支持移动端适配。

## ✨ 功能特性

- 📷 **图片上传** - 支持 JPG、PNG 等常见格式
- 📐 **标准尺寸** - 1 寸 (25mm×35mm)、2 寸 (35mm×49mm)
- 🎨 **背景颜色** - 红色、白色、蓝色、自定义颜色
- 💾 **导出 JPG** - 高质量输出，适合打印

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

访问 http://localhost:5173/ 即可使用。

### 构建生产版本
```bash
npm run build
```

## 📱 移动端适配

- 响应式设计，适配各种屏幕尺寸
- 触摸友好的交互界面
- 支持深色模式

## 🛠️ 技术栈

- React 18
- Vite 5
- Cropper.js - 图片裁剪库

## 📂 项目结构

```
id-photo-tool/
├── src/
│   ├── App.jsx          # 主组件
│   ├── App.css          # 样式文件
│   ├── index.css        # 全局样式
│   └── main.jsx         # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

## 📝 使用说明

1. 点击上传区域选择照片
2. 拖动/缩放调整裁剪区域
3. 选择证件照尺寸（1 寸或 2 寸）
4. 选择背景颜色
5. 点击"导出 JPG"下载

## 📄 许可证

MIT
