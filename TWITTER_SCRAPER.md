# Twitter Scraper 开发文档

## 📋 项目概述

### 目标
追踪活跃的财经博主（X/Twitter），抓取他们的观点，分析并展示在 KOL Finance 平台。

### 技术栈
- **爬虫**: Apify Tweet Scraper V2
- **语言**: TypeScript + Node.js
- **数据存储**: JSON 文件（本地）
- **触发方式**: 手动命令（后期：定时任务）

---

## 🎯 数据流程

```
1. 输入 Twitter Handle
   ↓
2. Apify 抓取最新推文
   ↓
3. AI 分析观点（bullish/bearish/neutral）
   ↓
4. 保存原始数据 (data/twitter-raw/{handle}.json)
   ↓
5. 转换为标准格式 (data/opinions/{date}.json)
   ↓
6. 前端展示
```

---

## 📂 数据结构

### 原始推文数据（Apify 输出）
```json
{
  "id": "1728108619189874825",
  "url": "https://x.com/elonmusk/status/1728108619189874825",
  "text": "More than 10 per human on average",
  "retweetCount": 11311,
  "replyCount": 6526,
  "likeCount": 104121,
  "createdAt": "Fri Nov 24 17:49:36 +0000 2023",
  "author": {
    "userName": "elonmusk",
    "name": "Elon Musk",
    "followers": 172669889
  }
}
```

### KOL Opinion 数据（标准格式）
```json
{
  "kolId": "michael-saylor",
  "kolName": "Michael Saylor",
  "opinion": "bullish",
  "content": "Bitcoin is the future of money...",
  "sourceUrl": "https://x.com/saylor/status/123456789",
  "publishedAt": "2026-02-15T20:00:00Z",
  "marketResult": null,
  "confidence": 0.85,
  "reasoning": "Strong conviction about Bitcoin adoption"
}
```

---

## 🔧 脚本设计

### scripts/scrape-twitter.ts

**功能**:
1. 接收 Twitter handle 列表
2. 调用 Apify API 抓取推文
3. 过滤最近 24 小时的推文
4. AI 分析观点（使用 Claude）
5. 保存数据

**命令行接口**:
```bash
# 抓取单个 KOL
npm run scrape:twitter -- --handle saylor

# 抓取多个 KOL
npm run scrape:twitter -- --handles saylor,elonmusk,RaoulGMI

# 指定日期范围
npm run scrape:twitter -- --handle saylor --since 2026-02-14

# 仅保存原始数据（不分析）
npm run scrape:twitter -- --handle saylor --raw-only
```

---

## 👥 KOL 清单（初步）

### 🏆 Tier 1 - 超级影响力（>1M followers）

| Handle | Name | Followers | Focus |
|--------|------|-----------|-------|
| `saylor` | Michael Saylor | 4.1M | Bitcoin, Macro |
| `elonmusk` | Elon Musk | 172M | Tech, Crypto |
| `CathieDWood` | Cathie Wood | 1.9M | Innovation, ARK |
| `RaoulGMI` | Raoul Pal | 1.2M | Macro, Crypto |

### 🥈 Tier 2 - 高影响力（500K-1M followers）

| Handle | Name | Followers | Focus |
|--------|------|-----------|-------|
| `APompliano` | Anthony Pompliano | 1.7M | Bitcoin, Venture |
| `woonomic` | Willy Woo | 1.1M | Bitcoin Analytics |
| `KimDotcom` | Kim Dotcom | 906K | Macro, Crypto |

### 🥉 Tier 3 - 专业分析师（100K-500K followers）

| Handle | Name | Followers | Focus |
|--------|------|-----------|-------|
| `DocumentingBTC` | Documenting Bitcoin | 1M | Bitcoin News |
| `100trillionUSD` | PlanB | 1.9M | S2F Model |
| `nic__carter` | Nic Carter | 496K | Crypto Analysis |
| `LizAnnSonders` | Liz Ann Sonders | 452K | Stock Market |

---

## 🚀 开发步骤

### Phase 1: 基础爬虫（今天完成）
- [x] Apify API 集成
- [ ] 基础脚本框架
- [ ] 抓取单个 KOL 测试
- [ ] 原始数据保存

### Phase 2: AI 分析（明天）
- [ ] Claude API 集成
- [ ] 观点分类（bullish/bearish/neutral）
- [ ] 置信度评分
- [ ] 推理文本生成

### Phase 3: 批量处理（2天内）
- [ ] 批量抓取多个 KOL
- [ ] 错误处理和重试
- [ ] 日志记录
- [ ] 数据去重

### Phase 4: 定时任务（后期）
- [ ] Cron job 配置
- [ ] 每小时检查更新
- [ ] 增量抓取（只抓新推文）
- [ ] 通知机制（有新观点时发通知）

---

## 💰 成本估算

### Apify 定价
- **Twitter**: $0.40 per 1,000 tweets
- **每天抓取**: 20 KOLs × 5 tweets/day = 100 tweets
- **每月**: 100 × 30 = 3,000 tweets = **$1.2/月**

### Claude API 定价
- **分析推文**: ~100 tokens input + 50 tokens output per tweet
- **每月**: 3,000 tweets × 150 tokens × $0.003/1K = **$1.35/月**

**总计: ~$2.5/月**（非常便宜！）

---

## 🔑 环境变量

```bash
# .env.local
APIFY_API_KEY=your_apify_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
```

---

## 📊 使用示例

### 1. 手动抓取（开发阶段）
```bash
cd /root/clawd/projects/01-kol-finance
npm run scrape:twitter -- --handle saylor
```

### 2. 查看原始数据
```bash
cat data/twitter-raw/saylor.json | jq '.[:3]'
```

### 3. 查看分析后的观点
```bash
cat data/opinions/2026-02-15.json | jq '.[] | select(.kolId == "saylor")'
```

---

## 🐛 故障排查

### 问题1: Apify API 403 错误
**原因**: API key 错误或 quota 用完
**解决**: 检查 `.env.local` 中的 API key

### 问题2: 抓不到推文
**原因**: Twitter handle 不存在或账号被封
**解决**: 手动访问 `https://x.com/{handle}` 确认账号有效

### 问题3: AI 分析失败
**原因**: Claude API key 无效或 quota 用完
**解决**: 检查 Anthropic 账号余额

---

## 📱 后续集成

### 前端展示
```typescript
// web/src/app/api/opinions/route.ts
export async function GET(request: Request) {
  const today = new Date().toISOString().split('T')[0];
  const opinions = await readJSON(`data/opinions/${today}.json`);
  return Response.json(opinions);
}
```

### 实时更新
```typescript
// web/src/app/page.tsx
const { data } = useSWR('/api/opinions', fetcher, {
  refreshInterval: 60000 // 每分钟刷新
});
```

---

## 🤝 GitHub 工作流

### 提交代码
```bash
git add .
git commit -m "feat: add Twitter scraper with Apify integration"
git push origin main
```

### PR 审查要点
- [ ] 代码符合 TypeScript 规范
- [ ] 添加了错误处理
- [ ] 数据结构正确
- [ ] 测试通过（至少一个 KOL）
- [ ] 更新了文档

---

## 📞 联系方式

- **开发者**: Master Bot (CTO)
- **Telegram**: @aitist_master_bot
- **GitHub**: https://github.com/oyzh888/when2buy

---

**最后更新**: 2026-02-15 20:39 UTC
