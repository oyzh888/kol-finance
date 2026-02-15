# 项目1: 金融KOL观点产品

## 项目概述

**目标**: 构建金融KOL观点聚合展示平台 + 2个OpenClaw交易观点bot
参考UI和数据流： /root/clawd/projects/01-kol-finance/reference

**核心功能**:
1. 网页展示金融KOL的市场观点（看涨/看跌）
2. 看涨bot：聚合看涨观点，提供交易建议
3. 看跌bot：聚合看跌观点，提供交易建议

## 技术架构

### 前端
- **框架**: Next.js 15 (App Router)
- **UI库**: Tailwind CSS + shadcn/ui
- **图表**: Recharts / TradingView widget
- **部署**: Vercel / NAS Nginx

### 后端
- **API**: Next.js API Routes
- **数据库**: PostgreSQL (NAS)
- **缓存**: Redis (NAS)
- **数据源**: Twitter API, RSS feeds, 手动录入

### OpenClaw Bots
- **Bot 1**: @kol_bullish_bot (看涨)
- **Bot 2**: @kol_bearish_bot (看跌)
- **部署**: NAS (OpenClaw multi-agent)
- **能力**: 
  - 观点聚合分析
  - 市场情绪判断
  - 交易信号生成
  - Telegram推送

## 数据模型

```sql
-- KOL表
CREATE TABLE kols (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  twitter_handle VARCHAR(100),
  avatar_url TEXT,
  bias VARCHAR(20), -- bullish, bearish, neutral
  credibility_score INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 观点表
CREATE TABLE opinions (
  id SERIAL PRIMARY KEY,
  kol_id INT REFERENCES kols(id),
  content TEXT NOT NULL,
  sentiment VARCHAR(20), -- bullish, bearish, neutral
  asset VARCHAR(50), -- BTC, ETH, SPY, etc.
  confidence INT, -- 1-10
  source_url TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 信号表
CREATE TABLE signals (
  id SERIAL PRIMARY KEY,
  bot_type VARCHAR(20), -- bullish, bearish
  asset VARCHAR(50),
  action VARCHAR(20), -- buy, sell, hold
  strength INT, -- 1-10
  reasoning TEXT,
  kol_opinions_count INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 开发步骤

### Phase 1: 数据层 (2天)
- [ ] 设置PostgreSQL数据库
- [ ] 创建数据模型和migrations
- [ ] 实现KOL管理API
- [ ] 实现观点录入API

### Phase 2: 网页前端 (3天)
- [ ] Next.js项目初始化
- [ ] 设计UI/UX (Figma可选)
- [ ] 实现KOL列表页
- [ ] 实现观点聚合展示页
- [ ] 实现实时情绪仪表盘
- [ ] 实现搜索和筛选功能

### Phase 3: OpenClaw Bots (3天)
- [ ] 创建bot配置 (openclaw.json)
- [ ] 实现观点分析逻辑
- [ ] 实现信号生成算法
- [ ] 接入Telegram API推送
- [ ] 实现定时任务 (cron)

### Phase 4: 数据采集 (2天)
- [ ] Twitter API集成 (可选)
- [ ] RSS feed解析器
- [ ] 手动录入界面（管理后台）
- [ ] 自动化数据清洗

### Phase 5: 测试部署 (1天)
- [ ] 单元测试
- [ ] E2E测试
- [ ] NAS部署配置
- [ ] Nginx反向代理
- [ ] SSL证书配置

## 目录结构

```
01-kol-finance/
├── README.md (本文件)
├── web/                    # Next.js前端
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── bots/                   # OpenClaw bots
│   ├── bullish/
│   │   ├── openclaw.json
│   │   ├── SOUL.md
│   │   └── skills/
│   └── bearish/
│       ├── openclaw.json
│       ├── SOUL.md
│       └── skills/
├── database/
│   ├── migrations/
│   └── seeds/
└── docs/
    ├── API.md
    └── DEPLOYMENT.md
```

## 部署方案

### 数据库 (NAS)
```bash
# PostgreSQL
docker run -d \
  --name kol-finance-db \
  -e POSTGRES_PASSWORD=xxx \
  -e POSTGRES_DB=kol_finance \
  -v /data/kol-finance-db:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16
```

### 网页 (NAS Nginx)
```nginx
server {
    listen 80;
    server_name kol.aitist.ai;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

### OpenClaw Bots (NAS)
- 使用现有的 `/root/openclaw-fleet` 管理
- 添加到 `deploy.yaml`

## 环境变量

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/kol_finance

# Telegram
TELEGRAM_BOT_TOKEN_BULLISH=xxx
TELEGRAM_BOT_TOKEN_BEARISH=xxx

# Twitter (可选)
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx

# OpenAI/Anthropic
ANTHROPIC_API_KEY=xxx
```

## 成功指标

- [ ] 网页可访问，加载时间 < 2s
- [ ] 至少录入20个KOL
- [ ] 每日至少10条观点更新
- [ ] Bot可正常推送信号到Telegram
- [ ] 信号准确率 > 60%（需跟踪验证）

## 预估工时

- **开发**: 11天
- **测试**: 2天
- **上线**: 1天
- **总计**: 14天（约2周）

## 下一步

1. Review这个计划
2. 创建GitHub repo
3. 分配给AI agent开始开发
