# 开发指南

[← 返回 README](../README.md)

## 准备环境

- Node.js 20+ 与 npm。
- Windows 上的 DeepSeek Harness 0.2.0-rc.2，用于实际宿主联调。
- Microsoft Edge，用于当前 Playwright 浏览器测试（使用 `msedge` channel）。

在项目根目录执行：

```shell
npm ci
npm run build
npm test
npm run test:browser
```

浏览器测试不需要模型 API Key，不会发送聊天请求。结果与截图写入 `test-results/`，该目录不进入源码发布包。

## 目录结构

```text
dsh-reasoning-slider/
├── src/                    # 组件、样式、粒子与参数映射
├── lib/                    # 构建后的 Harness 加载入口
├── scripts/                # 构建、安装和发行 ZIP 脚本
├── tests/                  # 单元、浏览器及宿主联调测试
├── docs/
│   ├── images/             # README 展示截图
│   ├── DEVELOPMENT.md      # 快速开发、联调和发布指南
│   └── PROJECT-TECHNICAL-GUIDE.md # 完整技术说明
├── dist/                   # 当前 tgz（发行 ZIP 内附）
├── cordis.patch.yml        # 插件注册补丁
├── package.json
├── package-lock.json
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE
```

## 接入方式

| 文件 | 职责 |
| :--- | :--- |
| `src/index.js` | Cordis 主机插件入口 |
| `src/client.jsx` | React 交互、模型选择、额度提示与 Ultra 溅射 |
| `src/core.js` | 四档映射、能力判断与粒子基础参数 |
| `src/particles.js` | Canvas 粒子深度、生成位置与速度曲线 |
| `src/style.css` | 隔离样式、极光、流光边框与渐显动画 |
| `scripts/build.mjs` | 生成官方 `__ModuleLoader__.load` 工厂格式 |

插件以 `priority: -100` 注册 `conversation.input.model` 单插槽，替换输入框的模型选择入口。React / ReactDOM 使用宿主实例，不打入产物。客户端注入 `slots`、`modelDirectories`、`sessions`、`remote` 和 `remote.session`。

设置通过 `modelDirectories.directoryFor(sessionId).select(...)` 提交；组件订阅宿主快照，不自行构造模型 API 请求。拖动期间只更新预览，松手提交一次。宿主拒绝设置时恢复实际值，并展示错误。

档位映射为 `关 → off`、`轻度 → low`、`高 → high`、`Ultra → max`。不支持的档位不可选，子代理会话服从宿主限制。

## 调整动画

连续位置以 `0–3` 表示四档。粒子速度倍率为 `clamp((position - 1) / 2, 0, 1)`：轻度为零，高为半速，Ultra 为全速。粒子透明度与极光混合分别取决于“轻度→高”和“高→Ultra”区间的位置。

初始化时建立 40 颗完整滑轨粒子池，并用低差异分布保证前 12 颗与前 25 颗都较均匀。高档约显示 12 颗，向 Ultra 拖动时逐步增加至约 25 颗；新增或减少的粒子使用连续透明度权重渐显渐隐，拖动只改变 Canvas 遮罩与可见权重，不改变粒子坐标。粒子离开左端后固定从滑轨末端重新进入。闪电关闭时采用有均值回归的二维随机漂移，范围约为水平 ±2.5px、垂直 ±2px；开启或关闭闪电时，四层按远到近以 35ms 间隔依次开始 0.8 秒正弦 ease-in-out 缓动，使过渡两端的速度变化归零。远到近四层的速度区间为 204–220、188–204、172–188、156–172 px/s，相邻区间仅在边界相接，保证近层不会反超远层。高档流速为 Ultra 的一半，Ultra 为全速。整个粒子层透明度为 64%。Ultra 外发光与边框使用相同的渐变角度，卡片实色背景遮住内侧光晕。溅射只在到达端点时触发，约 0.9 秒后清理节点。

CSS 使用 `drs-` 前缀，圆形元素显式使用 `corner-shape: round`，避免受宿主全局样式影响。修改布局后应检查拖动、吸附、窄窗口、提示切换以及减少动态效果设置。

## 独立 Harness 联调

先构建并打包，再创建隔离测试 profile。下面的安装路径需要替换为本机路径；项目路径从当前目录自动取得。

```powershell
npm run build
New-Item -ItemType Directory -Path dist -Force | Out-Null
npm pack --pack-destination dist

$installDirectory = 'C:\Apps\DeepSeek Harness'
$cli = Join-Path $installDirectory 'resources\runtime\cli\bin\dsh.cmd'
$env:DSH_HOME = Join-Path (Get-Location) '.test-home'
$version = (Get-Content package.json -Raw | ConvertFrom-Json).version
$bundle = (Resolve-Path "dist/dsh-reasoning-slider-$version.tgz").Path
& $cli plugin --profile web add $bundle
& $cli web --no-open --host 127.0.0.1 --port 0
```

另开一个终端进入项目目录，运行下方命令，并粘贴宿主输出的完整本地访问 URL：

```powershell
$env:DSH_TEST_URL = Read-Host 'Harness 输出的完整本地访问 URL'
node tests/host-browser.mjs
```

测试会修改隔离会话中的模型与强度，并验证刷新后保留；不会发起模型推理。完成后在运行宿主的终端按 Ctrl+C。仅在隔离测试实例上运行该脚本。`tests/host.patch.yml` 提供按包名注册的补丁，使用上述安装方式时无需额外加载它。

## 生成发行包

```powershell
.\scripts\package-release.ps1
```

脚本先执行 `npm pack`（自动构建），再输出：

- `dist/dsh-reasoning-slider-版本.tgz`：Harness 可安装插件。
- `releases/dsh-reasoning-slider-版本.zip`：源码、文档、截图、构建产物及当前 tgz。
- `releases/dsh-reasoning-slider-版本.zip.sha256`：ZIP 校验文件。

ZIP 使用明确的文件列表，排除依赖目录、宿主测试 profile、参考资料、测试结果、旧版 tgz 和本地配置。解压后用 `npm ci` 恢复开发依赖。

将源码提交到 GitHub 后，创建匹配版本的 tag / Release，将 ZIP、tgz 与校验文件作为附件上传。`dist/`、`lib/`、`releases/` 不进入 Git。GitHub 自动源码 ZIP 不含安装包，需自行构建。

## 验证覆盖

| 证据 | 验证内容 | 测试入口 |
| :--- | :--- | :--- |
| 参数与运动断言 | 模型能力、四档映射、从零到全速、滑块右侧无粒子 | `npm test` |
| 浏览器断言与截图 | 圆形几何、一次提交、不闪烁、不移位、提示、渐变、溅射及清理 | `npm run test:browser` |
| 隔离宿主报告 | 官方加载器、设置提交、模型切换、刷新保留 | `tests/host-browser.mjs` |

浏览器 fixture 验证不能替代所有 Harness 版本的集成验证；服务商计费与推理结果不属于插件测试范围。

## 官方参考

- [插件开发入门](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/)
- [插件发布](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish)
- [插槽系统](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/slots)
- [客户端模块](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/client-modules)

