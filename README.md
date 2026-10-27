<div align="center">
  <img src="public/icons/icon-256.png" alt="StatureAtlas" width="72" height="72" />
  <h1>StatureAtlas</h1>
  <p><strong>身高体重对照表</strong></p>
  <p>用一张表，看见身体的坐标。</p>
  <p>交互式身高体重对照与多组数据标记工具，支持公斤 / 斤切换，数据保存在你的浏览器中。</p>
  <p>
    <img src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  </p>
  <p>
    <a href="#项目预览">项目预览</a> ·
    <a href="#功能特性">功能特性</a> ·
    <a href="#快速开始">快速开始</a> ·
    <a href="#部署">部署</a> ·
    <a href="#参与贡献">参与贡献</a>
  </p>
</div>

## 简介

StatureAtlas 将身高、体重与成人 BMI 分类放在同一张网格中，让你直观查看数据所在的区间，也能同时标记自己、家人与朋友的多组记录。

无需注册，无需后端。打开页面即可浏览对照表、计算 BMI、添加标记；记录自动保存在当前浏览器，刷新后继续使用。

## 项目预览

![StatureAtlas 桌面预览](docs-dev/evidence/preview.png)

[查看完整桌面截图](docs-dev/evidence/desktop-1280.png) · [查看移动端截图](docs-dev/evidence/mobile-390.png)

> 截图中的人物记录为演示数据。首次打开应用时，记录列表为空。

## 功能特性

- **男女双表对照**：两张表采用相同的坐标范围与 BMI 分类标准，每张包含 21 行 × 36 列数据格。
- **交互式定位**：悬停或轻点格子，在图表上方查看身高、体重、BMI 与分类；支持辅助线、点击固定、再次点击取消及键盘操作。
- **多组数据标记**：支持新增、编辑、确认删除和六种标记色；昵称选填，留空自动生成友好名称。
- **精确坐标与聚合**：按实际数值插值定位，男女记录分别显示；同坐标记录聚合展示，超范围记录保留并提示。
- **公斤 / 斤切换**：表头、录入、记录列表、图表详情和 BMI 计算器同步换算，切换不会改变 BMI 或标记位置。
- **公式与计算器两用**：未填写时展示 BMI 公式，输入身高、体重后显示代入公式、计算结果与分类。
- **浏览器本地保存**：刷新后恢复记录；存储损坏或不可用时显示提示，不阻断当前会话。
- **响应式布局**：桌面左侧录入与记录、右侧上下双表；手机单列展示，宽表格在内部滚动。

## 快速开始

### 环境要求

- **Node.js**：推荐 24.x，最低 22.13.0；项目提供 `.nvmrc`。
- **pnpm**：11.5.2，与 `package.json` 中的 `packageManager` 一致。

### 安装与启动

下载项目或克隆仓库后，在项目根目录执行：

```bash
# 已安装 nvm 时，可使用项目指定的 Node.js 版本
nvm use

# 安装依赖
pnpm install --frozen-lockfile

# 启动开发服务
pnpm dev
```

默认访问 `http://localhost:5173`，实际地址以终端输出为准。无需配置环境变量。

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务 |
| `pnpm build` | 执行严格 TypeScript 检查并构建生产产物 |
| `pnpm preview` | 本地预览生产产物，需先构建 |
| `pnpm test` | 运行全部自动测试 |
| `pnpm test:watch` | 以监听模式运行测试 |
| `pnpm lint` | 使用 Oxlint 检查代码 |

## 使用指南

### 浏览与标记

1. 选择体重单位：**公斤**或**斤**。
2. 填写性别、身高和体重，可选填昵称并选择标记颜色。
3. 点击「添加到图表」，记录会出现在列表和对应性别的图表中。
4. 在记录列表中编辑或删除数据；点击「隐藏标记」可暂时隐藏所有点，记录仍然保留。

点击单元格可固定详情，再次点击同一格取消固定，点击其他格切换固定目标。键盘可使用 `Tab` 聚焦格子、方向键移动、`Enter` / `Space` 固定或取消、`Esc` 关闭详情。

### 范围与精度

| 项目 | 范围 / 规则 |
| --- | --- |
| 图表身高轴 | 150–190 cm，步长 2 cm |
| 图表体重轴 | 40–110 kg，步长 2 kg；切换后为 80–220 斤，步长 4 斤 |
| 可录入身高 | 120–220 cm，最多一位小数 |
| 可录入体重 | 20–300 kg / 40–600 斤，精度为 0.05 kg / 0.1 斤 |
| 自定义昵称 | 最多 20 字；留空或仅输入空格时自动命名 |

超出图表范围、但符合录入规则的数据仍可保存，列表会显示提示，不会将标记强行放到图表边缘。体重单位和男女表各自的辅助线开关会自动保存，刷新或重新打开后恢复上次选择。标记显示开关仅在本次会话生效，刷新后重新显示标记。

### 即时计算 BMI

在「BMI 参考说明」的公式区域输入身高与体重，即可查看代入过程：

```text
身高 170 cm，体重 60 kg
BMI = 60 ÷ 1.7² = 20.8 → 正常
```

计算器支持公斤 / 斤切换，清空输入后恢复公式展示。计算器输入不会自动添加为记录。

## BMI 分类与适用范围

```text
BMI = 体重（kg）÷ 身高（m）²
```

分类依据[国家卫生健康委《体重管理指导原则（2024 年版）》](https://www.nhc.gov.cn/wjw/c100378/202412/f3f58b54fbeb4c87b14164fac898bf08.shtml)，男女采用相同阈值：

| 分类 | BMI 区间 |
| --- | --- |
| 过轻 | BMI < 18.5 |
| 正常 | 18.5 ≤ BMI < 24 |
| 超重 | 24 ≤ BMI < 28 |
| 肥胖 | BMI ≥ 28 |

应用使用未舍入的 BMI 判断分类，仅在展示时保留一位小数，避免因显示值四舍五入而改变分类。

> 适用于中国 18 岁及以上成人，仅供参考，不能替代临床评估。BMI 不能反映体脂率；运动员、孕妇、老人及特殊体型需结合个体情况评估。18 岁以下不适用本标准。

## 数据与隐私

- 身高体重记录仅保存在当前浏览器的 `localStorage` 中，应用不会将记录上传至服务器。
- 清理站点数据、更换设备或使用无痕模式可能导致记录丢失；当前不提供云同步、备份或导入导出。
- 浏览器禁止存储或存储空间不足时，应用会提示无法持久保存，当前会话内仍可录入和查看记录。
- 第三方部署平台可能保留常规访问日志，本地保存记录不代表访问过程完全匿名。

## 技术栈与目录

React + TypeScript + Vite，使用 Tailwind CSS v4 与局部 CSS 构建界面，Lucide React 提供图标；状态由 React Hooks 管理，测试使用 Vitest 与 Testing Library。

```text
src/
├── components/       # 对照网格、记录表单、列表与 BMI 计算器
├── hooks/            # 记录增删改与本地持久化
├── lib/              # BMI、坐标映射、单位换算与存储解析
├── models/           # 数据类型、预设颜色与字段校验
├── App.tsx           # 页面布局与状态编排
└── index.css         # 全局样式与响应式布局
tests/                # 测试用例与测试环境配置
docs-dev/             # 开发手册、验收记录与截图
public/               # 静态资源
vercel.json           # Vercel 静态部署配置
```

记录统一以公斤存储，BMI、分类和点位由原始数据实时计算。为兼容开发手册约定，存储键保留为 `height-weight-compare:records:v1`，使用带版本号的数据结构：

```json
{
  "version": 1,
  "records": []
}
```

## 部署

先构建静态产物：

```bash
pnpm build
```

将生成的 `dist/` 目录部署到静态托管服务即可，不需要 API、数据库或环境变量。

### Vercel

仓库内已提供 `vercel.json`。导入项目时使用以下配置：

| 配置项 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Node.js | 24.x |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build` |
| Output Directory | `dist` |

也可使用 Netlify、Nginx 等方式托管 `dist/`。应用只有根页面，无需配置多页面路由重写；当前静态资源使用根路径，适合部署在站点根目录。

## 参与贡献

欢迎提交问题反馈和改进建议。报告问题时，请尽量提供复现步骤、浏览器版本、屏幕尺寸及不含个人信息的示例数据。

提交代码前，请运行：

```bash
pnpm test
pnpm lint
pnpm build
```

自动测试覆盖 BMI 分类边界、连续坐标插值、异常存储恢复、记录增删改、单位换算、自动昵称和计算器交互。新增功能或修复问题时，请补充对应的必要测试。

## 品牌资源

图标采用圆角透明 PNG，内容铺满画布、四角透明，按母版等比缩放，提供 16–1024 px 方形 PNG、favicon、Apple Touch Icon，以及 1200×630、16:9、4:3 横版图片。

[下载图标资源包](assets/branding/stature-atlas-icons.zip) · [查看尺寸与使用说明](assets/branding/README.md)

## 项目文档

- [开发手册](docs-dev/README.md)
- [数据模型与 BMI 算法](docs-dev/docs/04-数据模型与BMI算法.md)
- [验收记录](docs-dev/ACCEPTANCE.md)

开发手册保留了最初的需求说明；布局、坐标范围和交互调整以手册首页的「最新产品调整」及当前实现为准。
