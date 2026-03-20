<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://raw.githubusercontent.com/THU-SIGS-LLM-APP/2026-PROJECT-Sanbu-enterpreneur_mock/main/image.png" />
</div>

# 创业全流程模拟器 (Entrepreneur Mock)

基于 DeepSeek AI 的创业全流程模拟系统，提供从创意验证到最终评估的完整创业模拟体验。

## 功能特性

- 🎯 **创意验证** - AI 评估创业想法的市场潜力和可行性
- 📊 **战略规划** - 定义商业模式和增长策略
- 💰 **资产管理** - 管理资本分配和财务预测
- 🎯 **决策矩阵** - 经历关键业务决策点
- 🎤 **路演模拟** - 向 AI 投资人进行路演并获得反馈
- 🏆 **最终评估** - 获得全面的创业成就评价

## 技术栈

- **前端框架**: React 19 + Vite
- **AI 服务**: DeepSeek Chat API
- **样式**: Tailwind CSS 4.1
- **动画**: Motion (Framer Motion)

## 快速开始

### 前置要求

- Node.js (v18+)
- DeepSeek API Key ([获取地址](https://platform.deepseek.com/))

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/THU-SIGS-LLM-APP/2026-PROJECT-Sanbu-enterpreneur_mock.git
   cd 2026-PROJECT-Sanbu-enterpreneur_mock
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local` 文件，填入你的 DeepSeek API Key：
   ```
   DEEPSEEK_API_KEY=你的API密钥
   ```

4. 运行开发服务器
   ```bash
   npm run dev
   ```

5. 打开浏览器访问
   ```
   http://localhost:3000
   ```

## 项目结构

```
src/
├── services/
│   └── deepseek.ts          # DeepSeek API 服务
├── types.ts                 # TypeScript 类型定义
├── App.tsx                  # 主应用组件
├── main.tsx                 # 入口文件
└── index.css                # 全局样式
```

## API 配置

项目使用 DeepSeek 的 `deepseek-chat` 模型进行文本生成，包括：

- 创意验证分析
- 决策点生成
- 路演反馈
- 最终评估

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
