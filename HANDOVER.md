# KOL Finance App — 项目交接文档

> **Live**: https://kol.when2buy.ai
> **GitHub**: https://github.com/oyzh888/kol-finance
> **Tech Stack**: Next.js 16 + Turbopack, TypeScript, Tailwind CSS

---

## 项目概述

KOL（关键意见领袖）股票情绪追踪器。以"战斗竞技场"风格展示多方/空方/中立三方 KOL 对特定股票的实时观点。

### 核心功能
- 🟢 多方 vs 🔴 空方 vs 🟡 中立 三列布局
- 足球记分板风格的顶部 Header
- 暗色终端 UI + 霓虹灯效果 + 浮动动画
- 每条观点都有真实来源 URL，可验证
- 用户投票功能（localStorage）

---

## 项目结构

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主页面（所有 UI 组件）
│   │   ├── globals.css       # 全局样式（动画、霓虹效果）
│   │   └── api/
│   │       ├── opinions/route.ts  # 观点 API（runtime JSON 加载）
│   │       ├── stocks/route.ts    # 股票信息 API
│   │       └── kols/route.ts      # KOL 列表 API
│   └── data/
│       ├── opinions.json     # 📊 核心数据：9条 KOL 观点
│       └── stocks.json       # 股票基础信息
├── package.json
└── next.config.ts
```

---

## 数据结构

### opinions.json（核心）

每条观点包含：
```json
{
  "id": "op_w1_001",
  "stockTicker": "NVDA",
  "kol": {
    "handle": "DanIves",
    "name": "Dan Ives",
    "title": "Wedbush Securities 科技分析师",
    "platform": "twitter",
    "followers": 290000,
    "avatarUrl": "https://..."
  },
  "stance": "bull",         // "bull" | "bear" | "neutral"
  "confidence": "high",     // "high" | "medium" | "low"
  "quote": "中文观点摘要...",
  "sourceUrl": "https://...",   // 真实来源链接
  "sourceName": "来源名称",
  "publishedAt": "2026-02-20T00:00:00Z",
  "tags": ["标签1", "标签2"],
  "keyPoints": ["要点1", "要点2", "要点3"]
}
```

### 当前 NVDA 观点分布（截至 2026-02-23）

| 立场 | 数量 | KOL |
|------|------|-----|
| 🟢 Bull | 4 | Dan Ives/Wedbush ($275), Srini Pajjuri/RBC ($240), Aletheia Capital (升级至Buy), DA Davidson+JPMorgan |
| 🔴 Bear | 3 | 美股研究社 (圆弧顶风险), 247 Wall St (内部人抛售115次), Trefis Research (25x PE警告) |
| 🟡 Neutral | 2 | 视野环球财经 (大盘风向标), 精英财经 LABanker (160关口观望) |

---

## 数据调研来源

### 看多（Bull）来源
1. **Dan Ives / Wedbush** — 目标价 $275 (+44%)
   - 来源: https://fxopen.com/blog/en/analytical-nvidia-stock-price-targets/
   - 核心逻辑: 2026年AI拐点，Blackwell超预期

2. **Srini Pajjuri / RBC Capital** — Buy, 目标价 $240
   - 来源: https://www.tipranks.com/news/top-rbc-capital-analyst-is-bullish-on-nvidia-stock-nvda-expects-solid-q4-earnings
   - 核心逻辑: 云厂资本支出健康，Q4预期稳健

3. **Aletheia Capital** — Hold → Buy 升级
   - 来源: https://www.kiplinger.com/investing/live/nvidia-earnings-live-updates-and-commentary-february-2026
   - 核心逻辑: 跑输大盘创造买点，估值便宜

4. **DA Davidson + JPMorgan** — 联合背书，$250 目标价
   - 来源: https://stocktwits.com/news-articles/markets/equity/nvidia-gets-backing-from-da-davidson-jp-morgan-ahead-of-q4-earnings-and-ai-growth-surge/cZRtxzwR4yY
   - 核心逻辑: 双机构财报前一致看多

### 看空（Bear）来源
5. **美股研究社** (YouTube 48.4K粉丝) — 圆弧顶风险
   - 来源: https://youtu.be/Uh0cEmpemCs?si=z5vBTFs8FVBNpg-Z
   - 核心逻辑: 横盘8个月到变盘点，软件股崩盘预警

6. **247 Wall St** — 内部人90天115次抛售
   - 来源: https://247wallst.com/investing/2026/02/17/nvidia-nvda-trading-41-below-analyst-targets-after-recent-drop/
   - 核心逻辑: 内部人零买入，期权市场仅52%概率守$180

7. **Trefis Research** — 25x PE 是警告
   - 来源: https://www.trefis.com/stock/nvda/articles/591115/nvidia-stocks-cheap-25x-multiple-the-loudest-warning-yet/2026-02-20
   - 核心逻辑: Blackwell→Rubin强制升级周期，收入断层风险

### 中立（Neutral）来源
8. **视野环球财经** (YouTube 295K粉丝) — 方向未明
   - 来源: https://youtu.be/GT7sfcn6tzk?si=hbPSWYYvEB40ydwy
   - 核心逻辑: NVDA财报是大盘止跌信号，科技股「打摆子」

9. **精英财经 LABanker** (YouTube 60K粉丝) — 160关口观望
   - 来源: https://youtu.be/HwIptPTDR8U?si=SIu-r2E3E26e_i3D
   - 核心逻辑: 财报引发大波动，机构已提前离场

---

## 部署信息

- **运行端口**: 3100 (NAS)
- **域名**: `kol.when2buy.ai` → Cloudflare Tunnel → NAS:3100
- **启动命令**: `cd web && npm run start -- -p 3100`
- **构建**: `cd web && npm run build`
- **Cron 看门狗**: 每3分钟检查 port 3100，崩溃自动重启

### ⚠️ 重要技术笔记
- `route.ts` 使用 `fs.readFileSync()` 在运行时加载 JSON（**不是** static import）
- 原因: Turbopack bundler 的 static import 会缓存旧数据，即使重新 build 也不一定更新
- 修改 `opinions.json` 后**不需要重新 build**，重启服务即可生效

---

## UI 设计规范

### 颜色系统
- 看多: `#00ff88` (绿色霓虹)
- 看空: `#ff3355` (红色霓虹)  
- 中立: `#ffc000` (金色)
- 背景: `#060608` (深黑)

### 动画
- `.card-float-odd` / `.card-float-even` — 卡片上下浮动
- `.card-float-sway` — 中立卡片左右摇摆
- `.laser-clash` — 激光碰撞效果
- `.vs-flash` — VS 闪烁
- `.score-bull` / `.score-bear` / `.score-neutral` — 分数脉冲

### 布局
- 三列: `md:grid-cols-[5fr_3fr_5fr]`
- 左列(38%): 看多
- 中列(24%): 中立 "裁判席"
- 右列(38%): 看空

---

## 下一步建议

1. **NVDA Q4 财报 (Feb 25, 2026)** — 财报后更新所有观点 + 添加反应
2. **扩展更多股票** — 在 `stocks.json` 中添加 TSLA、AAPL 等
3. **数据自动化** — 目前手动收集，可考虑接入 API 自动抓取 KOL 观点
4. **用户系统** — 登录、收藏、自定义关注 KOL
5. **移动端优化** — 当前三列在手机上会堆叠为单列
