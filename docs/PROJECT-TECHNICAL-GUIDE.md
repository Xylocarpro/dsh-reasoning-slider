# dsh-reasoning-slider 项目技术说明

> 面向 DeepSeek Harness 的社区 UI 插件。本文以仓库当前 `0.1.22` 实现为准，说明插件如何被 Harness 加载、如何从模型目录读取能力、如何提交设置，以及视觉效果和开发工具链的实现方式。

## 1. 项目定位与兼容性

`dsh-reasoning-slider` 将 Harness 输入框原有的模型入口替换成一个 React 组件，提供四个原生推理参数：

| 界面名称 | Harness 参数 | 数值位置 | 说明 |
| --- | --- | ---: | --- |
| 关 | `off` | 0 | 不使用推理增强 |
| 轻度 | `low` | 1 | 低强度推理 |
| 高 | `high` | 2 | 中高强度推理和粒子效果 |
| Ultra | `max` | 3 | 最高强度、极光渐变、流光边框和额度提示 |

插件只通过 Harness 的插件、客户端模块和模型目录接口工作，不修改 Harness 安装文件，也不实现模型 API 或聊天请求。当前 `package.json` 声明的边界是 Node.js `>=20`、DeepSeek Harness `>=0.2.0-rc.2`；实际界面在 Windows Harness `0.2.0-rc.2` 上验证。Harness 或宿主 UI 接口变化时，需要重新做宿主联调。

闪电图标控制粒子的本地视觉模式。关闭时粒子缓慢随机漂移；开启或关闭后，四层粒子按远到近、间隔 35ms 依次开始 0.8 秒正弦 ease-in-out 加速或减速，同时在输入框模型名称左侧同步闪电状态。它不会改变模型、推理档位、请求参数或计费行为。

## 2. 运行数据流

```mermaid
flowchart LR
  A[Harness 启动] --> B[cordis.patch.yml 注册包名]
  B --> C[lib/index.js 主机入口]
  C --> D[lib/client.js ModuleLoader 工厂]
  D --> E[apply(ctx) 注入 slots/modelDirectories]
  E --> F[conversation.input.model 插槽]
  F --> G[ReasoningSlider]
  G --> H[directory.store 快照]
  G --> I[directory.load()]
  G --> J[directory.select(selection)]
  G --> K[Canvas 粒子与 CSS 动画]
```

打开模型入口后，组件从 `directory.store` 取得当前 provider、model、reasoning effort、加载状态和模型分组；`findChoice()` 找到当前模型，`supportedTiers()` 把模型声明的 effort 映射为可选索引。用户拖动时只更新本地预览，松手后调用一次 `directory.select()`。组件继续订阅宿主快照，因此宿主确认、拒绝或外部修改都会回到同一条状态流。

## 3. 仓库目录与文件职责

```text
dsh-reasoning-slider/
├── src/
│   ├── index.js                 # Cordis 主机模块入口
│   ├── client.jsx               # 客户端模块、React 组件和交互逻辑
│   ├── core.js                  # 档位模型、能力判断和粒子基础参数
│   ├── particles.js             # Canvas 粒子引擎
│   └── style.css                # 带 drs- 前缀的隔离样式与动画
├── scripts/
│   ├── build.mjs                # esbuild 构建 Harness 加载格式
│   ├── install.ps1              # 调用 Harness CLI 安装 tgz
│   └── package-release.ps1      # npm pack、源码 ZIP 和 SHA256
├── tests/
│   ├── core.test.mjs            # 纯函数和档位映射测试
│   ├── particles.test.mjs       # 粒子速度、密度和裁剪测试
│   ├── browser.mjs              # Playwright fixture 全交互测试
│   ├── fixture.jsx              # 浏览器测试用的最小宿主模型目录
│   ├── host-browser.mjs         # 真实 Harness 隔离实例联调
│   └── host.patch.yml            # 联调实例使用的插件注册补丁
├── docs/
│   ├── DEVELOPMENT.md           # 快速开发、联调和发布指南
│   ├── PROJECT-TECHNICAL-GUIDE.md # 本文件
│   └── images/                   # README 与发布说明截图
├── cordis.patch.yml             # 发布包的 Cordis 注册补丁
├── package.json                 # npm 元数据、Harness 声明和脚本
├── package-lock.json            # 锁定开发依赖
├── README.md                    # 面向用户的安装与功能说明
├── CONTRIBUTING.md              # 贡献约定
├── CHANGELOG.md                 # 版本变更记录
└── LICENSE                      # MIT 许可证
```

`lib/`、`dist/`、`releases/` 是构建或发布输出；`.reference/`、`.test-home*`、`test-results/` 和 `node_modules/` 是本机参考、测试或依赖数据，不应手工编辑，也不应作为源码提交。发行 ZIP 的脚本会使用显式文件清单，自动排除这些目录。

## 4. 包元数据与 Harness 注册

### 4.1 `package.json`

关键字段如下：

```json
{
  "name": "dsh-reasoning-slider",
  "version": "0.1.22",
  "main": "./lib/index.js",
  "exports": { ".": "./lib/index.js", "./client": "./lib/client.js" },
  "engines": { "node": ">=20", "dsh": ">=0.2.0-rc.2" }
}
```

`dsh.bundle.patch` 指向 `cordis.patch.yml`；`dsh.client.inject` 请求宿主提供官方的 `@deepseek-ai/dsh-client-ui-model-selection` 和 `@deepseek-ai/dsh-client-ui-conversation` 客户端模块。React、ReactDOM 和 JSX runtime 标记为外部依赖，不会重复打进浏览器 bundle。`files` 列表包含 `lib`、补丁、README、`docs`、贡献指南、更新日志和许可证，因此技术说明会进入 npm tgz。

### 4.2 `cordis.patch.yml`

```yaml
- insert:
    - id: reasoning-slider
      name: dsh-reasoning-slider
```

这个补丁按包名向 Cordis 注册插件。它不包含模型业务逻辑；业务入口由 `src/index.js` 和客户端模块导出。

### 4.3 `src/index.js`

```js
export const name = 'reasoning-slider';
export function apply() {}
```

这是宿主侧可发现的最小入口。UI 逻辑在客户端模块中运行，主机入口保持无副作用，方便 Harness 在启动阶段加载。

## 5. 客户端模块接口

### 5.1 模块导出与依赖注入

`src/client.jsx` 导出：

```js
export const name = 'reasoning-slider-client';
export const inject = ['slots', 'modelDirectories', 'sessions', 'remote', 'remote.session'];
export function apply(ctx) { /* 注册样式和插槽 */ }
```

`apply(ctx)` 做两件事：

1. 通过 `ctx.effect()` 创建一个 `<style data-plugin="dsh-reasoning-slider">`，卸载模块时移除它。
2. 注入 `slots` 和 `modelDirectories`，为 `conversation.input.model` 注册优先级 `-100` 的渲染器。

### 5.2 插槽注入对象

每个 `sessionId` 会创建一组传给 `ReasoningSlider` 的宿主适配函数：

```js
{
  available: scope.sessions.subagentAddress(sessionId) === undefined,
  directory: directory.store,
  load: () => directory.load(),
  select: selection => directory.select(selection)
}
```

子代理会话的 `available` 为 `false`，因此不会允许模型或推理档位切换。`directory.store` 需要符合 React `useSyncExternalStore` 形状：提供 `subscribe(listener)` 和 `getSnapshot()`。插件不复制目录数据，也不建立第二套缓存。

### 5.3 选择提交接口

档位提交的选择对象是在宿主当前选择上增加原生 effort：

```js
{ provider: 'provider-id', model: 'model-id', reasoningEffort: 'low' }
```

模型切换使用 `selectionForModel(group, model, effort)`：如果新模型声明了当前 effort，就保留它；否则采用新模型 `reasoning.defaultEffort`；没有推理字段的模型只提交 provider 和 model。`select()` 返回 `{ ok: true }` 时清除预览，失败时显示错误并让下一次宿主快照恢复真实档位。

## 6. `src/core.js` API

该文件不依赖 DOM，适合单元测试和未来复用。

### `LEVELS`

冻结的四项数组，每项为 `{ id, name }`：`off/关`、`low/轻度`、`high/高`、`max/Ultra`。数组索引就是滑轨位置 `0..3`。

### `clamp(n, lo, hi)`

将数值限制在闭区间 `[lo, hi]`。粒子位置、透明度、速度倍率和 UI 预览均使用它避免越界。

### `findChoice(state)`

在 `state.groups` 中按 `state.current.provider` 和 `state.current.model` 查找当前模型，返回 `{ group, model }`；找不到返回 `undefined`。它不会为消失的模型伪造能力。

### `supportedTiers(model)`

读取 `model.reasoning.efforts` 中的原生 id，并返回对应索引，例如 `['off','high']` 返回 `[0,2]`。滑块只允许这些索引，第三方模型缺失的档位会被禁用。

### `currentTier(state, model)`

优先使用 `state.current.reasoningEffort`，否则使用模型默认 effort，返回 `LEVELS` 索引；未知值返回 `-1`。组件会用 `retainedEffort` 或“默认”作为没有索引时的文本回退。

### `nearestTier(value, supported)`

把连续拖动位置吸附到距离最近的受支持索引。支持列表为空时返回 `-1`。拖动预览在距离吸附点 `0.13` 的范围内使用缓动过渡，松手仍提交离散档位。

### `selectionForModel(group, model, effort)`

返回新的目录选择对象。只有新模型声明了传入 effort 才保留该值；否则使用模型默认值。没有 `reasoning` 或默认值时不添加 `reasoningEffort` 字段。

### `makeParticle(width, height, depth, random)`

生成一颗带深度的粒子：

```js
{
  x, y, depth,
  speed, radius, opacity,
  phase, driftAmplitude, driftRate
}
```

`depth=0` 是远层：更小、更透明、更快；`depth=1` 是近层：更大、更亮、更慢。四层速度区间分别为 204–220、188–204、172–188、156–172 px/s，粒子在所属区间内随机取值。`random` 参数可注入确定性随机函数，测试因此无需依赖真实随机序列。

## 7. React 组件和交互生命周期

### `ReasoningSlider`

组件使用 `useSyncExternalStore` 订阅目录快照，用 `useId` 创建模型菜单关联 id，并通过 `createPortal` 将面板放到 `document.body`，避免输入框父级的 `overflow` 或层叠上下文裁剪面板。

主要状态：

| 状态 | 用途 |
| --- | --- |
| `open` / `modelsOpen` | 面板和模型菜单是否展开 |
| `preview` / `visual` | 吸附档位与连续视觉位置；拖动期间不重复提交 |
| `notice` / `leaving` / `shimmer` | Ultra 额度提示、淡出和一次流光 |
| `edgeVisible` | 额度提示开始 200ms 后显示 Ultra 外发光边框 |
| `burst` | 到达 Ultra 端点时的单次圆粒子溅射 |
| `powered` | 控制粒子漂移/向左流动的本地视觉开关 |
| `saving` / `error` | 保存锁定和错误反馈 |

打开面板时，`useLayoutEffect` 根据触发按钮、面板尺寸和 `visualViewport` 计算位置：优先放在触发按钮上方，空间不足时放到下方，并限制在视口 12px 内。面板或窗口尺寸变化、滚动和视口变化都会重新计算；点击面板外部关闭。`Escape` 关闭模型菜单或整个面板，`Tab` 在面板内循环焦点。

### 拖动、点击和键盘

`pointerdown` 记录指针和滑块偏移，`pointermove` 只调用 `dragTo()` 更新连续位置；`pointerup` 先吸附再调用 `chooseTier()`，从而一次拖动最多产生一次 `directory.select()`。滑轨使用 `touch-action:none`，滑块本身 `pointer-events:none`，因此不会覆盖轨道的鼠标命中区域。

键盘滑块使用 `ArrowLeft/Right/Up/Down` 增减一个受支持档位，`Home` 和 `End` 跳到最小或最大受支持档位。模型菜单支持搜索、上下方向键、Home/End 和 `menuitemradio` 语义。

### Ultra 提示顺序

从非 Ultra 进入 `max` 时，组件先隐藏 `.drs-title` 与 `.drs-model`，显示“更快消耗使用额度”；提示开始 200ms 后才淡入边框，提示持续约两秒并播放一次完整的白色流光覆盖层，随后淡出并恢复标题和模型名称。到达端点时创建一次 `UltraBurst`，约 900ms 后移除；停留在端点不会重复触发。系统启用减少动态效果时，溅射和 CSS 动画被禁用。

## 8. `src/particles.js` 粒子引擎

`startParticles(canvas, getPosition)` 返回清理函数。它取得 2D context 后注册 `ResizeObserver`、`IntersectionObserver`、`visibilitychange` 和 `prefers-reduced-motion` 监听；清理函数会取消 RAF、断开观察器并移除监听。

### 位置与速度

连续位置 `0..3` 来自滑块预览。粒子速度倍率为：

```js
speedScale = clamp((position - 1) / 2, 0, 1)
```

因此轻度为 0，高为 0.5，Ultra 为 1。初始化时会在完整滑轨坐标中预置 40 颗粒子，高档约显示 12 颗，向 Ultra 拖动时逐步增加到约 25 颗。粒子数量使用连续透明度权重过渡，跨过数量阈值时会渐显或渐隐。闪电关闭时粒子只在几像素范围内做无固定方向的随机漂移；开启或关闭时，各层分别保存当前流速，并按远到近以 35ms 间隔启动 0.8 秒正弦 ease-in-out 缓动。该曲线在起点与终点斜率均为 0，避免达到目标速度时突然收尾。粒子离开左端后从滑轨末端重新进入，进度条只通过 `ctx.rect(0, 0, boundary, height)` 裁切可见范围，不缩放或搬动粒子。

### 数量与深度

常量为 `HIGH_TARGET_COUNT = 12`、`ULTRA_TARGET_COUNT = 25`、`MAX_COUNT = 40`。目标数量在高到 Ultra 区间线性增加，并叠加小幅正弦扰动；数量反馈只影响下一次生成速率，不瞬间删除可见粒子，所以视觉上更接近连续流水。四个深度层按当前层人口的反比分配，避免某一层长期过密。

每颗粒子使用径向渐变绘制，无拖尾；四层保持近大远小、近层较慢且不透明度较高、远层较快且更淡。`phase`、`driftRate` 和 `driftAmplitude` 提供不规则横向速度和微量垂直漂移，缓解机械队列感。整层 CSS 透明度最多为 `.64`，叠加粒子也不会超过约 65% 的视觉上限。

### 性能与可访问性

Canvas 按设备像素比重设尺寸，像素比最高取 2；页面隐藏、元素离开视口或减少动态效果时停止或只绘制静态帧。粒子 canvas 标记 `aria-hidden=true`，不会进入键盘和读屏语义；实际档位由滑块的 `role="slider"`、`aria-valuenow` 和 `aria-valuetext` 提供。

## 9. `src/style.css` 样式状态

所有选择器使用 `drs-` 前缀，降低与 Harness 页面冲突的概率。宿主可能对全局圆角应用 `corner-shape: superellipse(...)`，因此轨道、填充、刻度、滑块和溅射粒子显式设置 `corner-shape: round`，并将滑块固定为 `32px × 32px` 正圆。

关键状态：

| 选择器/变量 | 作用 |
| --- | --- |
| `.drs-panel[data-tier="0"]` | 关闭档位隐藏填充（拖动时保留预览） |
| `.drs-panel[data-tier="3"]` | Ultra 紫色标题光晕及刻度渐隐 |
| `--drs-ultra-progress` | 高到 Ultra 的极光透明度 |
| `--drs-particle-opacity` | 轻度到 Ultra 的粒子层透明度 |
| `[data-edge=true]` | 额度提示开始 200ms 后显示渐变边框和外发光 |
| `[data-notice=true]` | 隐藏档位标题、模型名称并显示额度提示 |
| `[data-dragging=true]` | 禁止过渡造成拖动闪烁，滑块轻微放大 |

Ultra 边框使用 `conic-gradient(#9932CC → #DA70D6)`，通过 `@property --drs-border-angle` 和 `drs-border-flow` 循环旋转。`.drs-edge-glow` 位于卡片外侧并使用 blur；卡片的实色 `::after` 伪元素遮住内侧光晕。边框和外发光共享同一个角度变量，因此流光同步。

## 10. 构建、测试与联调

### 本地构建

```powershell
npm ci
npm run build
```

`scripts/build.mjs` 复制 `src/index.js` 到 `lib/index.js`，再用 esbuild 将 `src/client.jsx` 打成浏览器 CJS。输出被包在：

```js
window.__ModuleLoader__.load({ id: 'dsh-reasoning-slider', factory: requireFactory });
```

这是 Harness 客户端模块加载器需要的形状。CSS 作为文本由 esbuild 读取，在 `apply()` 时注入 `<style>`。

### 自动化测试

```powershell
npm test
npm run test:browser
```

`npm test` 运行 Node 原生测试，覆盖四档映射、模型能力、选择回退、粒子深度、速度、数量上限和滑块右侧裁剪。`npm run test:browser` 启动 Edge 和本地 fixture，检查圆形几何、闪电无 RPC、拖动单次提交、加载期间无布局闪烁、额度提示顺序、流光、边框、溅射、失败回滚、模型搜索、窄窗口和 reduced-motion。结果和截图写入 `test-results/`。

### Harness 隔离联调

先构建并打包 tgz，然后设置隔离 profile：

```powershell
npm run build
npm pack --pack-destination dist
$installDirectory = 'C:\Apps\DeepSeek Harness'
$cli = Join-Path $installDirectory 'resources\runtime\cli\bin\dsh.cmd'
$env:DSH_HOME = Join-Path (Get-Location) '.test-home'
$version = (Get-Content package.json -Raw | ConvertFrom-Json).version
$bundle = (Resolve-Path "dist/dsh-reasoning-slider-$version.tgz").Path
& $cli plugin --profile web add $bundle
& $cli web --no-open --host 127.0.0.1 --port 0
```

另开 PowerShell，将宿主输出的完整 URL 传给：

```powershell
$env:DSH_TEST_URL = Read-Host 'Harness 输出的完整本地访问 URL'
node tests/host-browser.mjs
```

该测试验证官方加载器发现插件、真实模型目录选择、四档设置和刷新后保留。测试应只使用隔离 profile，不要把生产桌面 profile 指向自动化脚本。

## 11. 安装、卸载与发布

发行包安装脚本要求明确的 Harness 安装目录：

```powershell
.\scripts\install.ps1 -InstallDirectory 'C:\Apps\DeepSeek Harness'
```

脚本从 `dist/dsh-reasoning-slider-<version>.tgz` 读取版本并执行 `dsh.cmd plugin --profile desktop add`。安装完成后重启 Harness。卸载使用相同 CLI：

```powershell
& $cli plugin --profile desktop remove dsh-reasoning-slider
```

生成开源发行物：

```powershell
.\scripts\package-release.ps1
```

脚本先执行 `npm pack`，再从显式文件清单创建：

- `dist/dsh-reasoning-slider-0.1.22.tgz`：Harness 可安装包；
- `releases/dsh-reasoning-slider-0.1.22.zip`：源码、`lib`、脚本、测试、文档、截图和 tgz；
- 同名 `.zip.sha256`：小写 SHA-256 校验值。

版本发布前应运行 `npm test` 和浏览器测试，确认 `package.json` 版本、tgz、ZIP 文件名一致，再将 ZIP、tgz 和校验文件上传到 GitHub Release。GitHub 自动生成的源码 ZIP 不含构建后的安装包，使用者需要按照开发指南自行构建。

## 12. 错误处理、边界与隐私

- 目录加载失败会保留面板并显示错误和“重试加载”；模型切换失败会清除本地预览并回到宿主实际状态。
- `state.routable === false` 或当前模型不支持任何四档时，滑块显示禁用状态；插件不会强行提交未声明的 effort。
- 保存期间只读锁定交互，并使用屏幕阅读器隐藏的“正在保存设置”状态；不会额外插入可见的“正在加载模型”行推动窗口布局。
- 模型列表搜索只在内存中的宿主快照上过滤模型名、id 和 provider 名称。
- 运行时没有独立的网络请求、遥测、账号读取或聊天内容持久化；实际模型调用和计费完全由 Harness 与服务商处理。
- `localStorage` 只保存装饰闪电的 `on/off` 状态，键名为 `dsh-reasoning-slider.lightning`。
- `remote` 和 `remote.session` 被声明为宿主依赖以满足客户端模块环境，但本组件不直接调用远程 API。

## 13. 修改指南

修改档位或参数映射时，先同步 `src/core.js` 的 `LEVELS`、测试 fixture 和 README 表格；修改粒子密度或速度时同时更新 `src/particles.js` 的常量、`tests/particles.test.mjs` 断言和浏览器截图检查。修改布局时重点检查 portal 定位、拖动命中区域、轨道端帽是否完全被滑块覆盖，以及 `data-dragging` 下是否出现透明度或位置闪烁。

新增宿主接口时，应在 `apply(ctx)` 的注入列表和 `tests/host.patch.yml` 中保持一致，并使用隔离 Harness 做一次真实联调。提交前运行构建、单元测试和浏览器测试，发行前再检查 ZIP 内容和 SHA256。

## 14. 参考链接

- [DeepSeek Harness 插件开发入门](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/)
- [DeepSeek Harness 插件发布](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish)
- [Harness 插槽系统](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/slots)
- [Harness 客户端模块](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/client-modules)
- [开发指南](./DEVELOPMENT.md)
- [贡献指南](../CONTRIBUTING.md)
- [更新日志](../CHANGELOG.md)
