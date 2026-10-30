# QUSEIT Agent 官网 · Enterprise Agent Solution

工作流免费搭建，「企业智能体」先试后买。

QUSEIT Agent 是企业智能体解决方案：把员工散落在个人手里的经验，沉淀成**企业私有技能库**，再通过**智空间**把服务能力对外输出。支持私有化部署，数据资产不出内网。

本仓库为 QUSEIT Agent 官网的源代码（纯静态站点，支持中英双语切换）。

## 三个核心价值

从员工经验，到企业资产，再到对外服务。

1. **企业私有技能库** — 员工把经验做成技能，沉淀进企业私有技能库，归企业所有、全员复用。一次定好，新人按专家标准产出；人走能力留。
2. **智空间 · 对外输出** — 把内部已跑通的技能发布成对外服务，让客户和伙伴直接使用。Skill / Agent / Channel 三层结构，独立链接、二维码与访问密码，多渠道分发。
3. **自主掌控** — 数据、权限与模型都在企业自己手里。私有化部署数据不出内网，租户隔离、权限分级、审计留痕，模型自主选型与采购，不绑定供应商。

## 产品架构

- **QUSEIT Desktop（员工端）**：装在员工电脑上的桌面应用，开机即用。自然语言对话、长期记忆、工作区文件浏览、多模型切换、技能工作室、多会话管理、技能商店。
- **QUSEIT SaaS（企业管理端）**：一个 Web 控制台统一管理全公司的 AI 使用。企业与成员管理、订阅与席位、技能审核、使用概况、数据安全隔离、审计日志。
- **QUSEIT Agent Space（智空间）**：对外分发通道。把内部跑通的技能变成客户和伙伴能直接用的服务。

## 部署方式

| 方式 | 适合 | 特点 |
| --- | --- | --- |
| 公开 SaaS 版 | 中小企业、初创团队、想快速试点的部门 | 平台已部署好，开通账号即可使用；按席位按年付费，无需自建基础设施 |
| 私有定制版 | 国企、政府、金融、对数据敏感的中大型企业 | 整套系统部署在企业内网或私有云，数据全程不出域，满足等保合规；含实施、培训、运维等专属服务 |

> QUSEIT 不提供模型服务 — 企业可自主选择公有云模型（阿里云百炼 / 火山引擎 / 智谱 / DeepSeek）或部署私有模型，避免供应商锁定。

## 价格参考

SaaS 年度订阅，按席位按年付费；以下为平台订阅费，不含模型使用费。

| 版本 | 适合 | 年度订阅 |
| --- | --- | --- |
| 初创版 | 12 人团队 | ¥4,220 |
| 成长版 | 30 – 50 人团队 | ¥9,980 – 15,940 |
| 专业版 | 80 – 150 人企业 | ¥25,200 – 48,650 |
| 私有定制版 | 中大型企业 / 政企 | 按需定制 |

附加服务（按需选购）：技能定制开发、使用培训、数据接入（对接企业内部 ERP / CRM / 知识库）。

## 典型应用场景

- **销售**：新人上手时间缩短 **50%**，沟通话术统一规范
- **客服**：首次解决率提升 **+30%**，新人也能给专业回答
- **财务**：初审工作量减少 **-60%**，审核标准全公司统一
- **研发**：知识沉淀为团队资产，**0 流失**
- **人力**：JD 撰写从 2 小时缩短到 **10 分钟**

更多行业场景见 `cases/`。

## 站点结构

| 文件 | 说明 |
| --- | --- |
| `index.html` | 首页（Hero / 核心价值 / 产品架构 / 部署方式 / 价格 / 应用场景 / 联系我们） |
| `about.html` | 关于页 —— 为什么使用 QUSEIT AGENT |
| `partner.html` | 合作伙伴网络 |
| `fde.html` | FDE 培训（Forward Deployed Engineer） |
| `1000-fdes.html` | U1000 · FDE 实践者赋能计划 |
| `cases/` | 行业应用场景（`index.html` 列表页 + `doc-assistant.html` / `work-permit.html` 两个方案页） |
| `styles.css` / `main.js` | 全站样式与交互（导航、滚动入场、演示弹窗） |
| `i18n.js` | 中英双语词条与语言切换；默认简体中文，切换时写 `localStorage.qagent-lang` |
| `about.css` / `partner.css` / `1000-fdes.css` / `cases/cases.css` | 各页面专属样式 |

`about.md` 与 `courses.md` 是文案底稿与课程体系文档，不参与站点构建。

## 网站本地预览

纯静态站点，无需构建，直接打开 `index.html` 即可；也可以启动一个本地服务器：

```bash
npx serve .
# 或
python -m http.server 8080
```

默认简体中文，点击导航栏「EN」可切换为英文。

## 联系我们

- 微信：**yhc-startup**（备注「QUSEIT」）
- 邮箱：**ceo@quseit.com**
- 产品咨询 / 15 天 SaaS 免费试用 / 1 个月私有定制 POC

---

## QUSEIT Agent · Enterprise Agent Solution

Build workflows free, try before you buy.

QUSEIT Agent is the enterprise agent solution: turn know-how scattered across individual desks into a **private enterprise skill library**, then deliver it externally through **Agent Space**. Privately deployable — your data assets never leave your network.

Three core values: **private enterprise skill library** (skills owned by the company, reused company-wide) · **Agent Space for external delivery** (publish skills that already work internally as services customers can use directly) · **full control** (privately deployable, your own model choices, audited).

Product architecture: **QUSEIT Desktop** for employees · **QUSEIT SaaS** for enterprise IT · **Agent Space** for external distribution. Available as public SaaS or private deployment. Models are customer-owned (Alibaba Cloud Bailian / Volcano Engine / Zhipu / DeepSeek / private LLMs), avoiding vendor lock-in.

Contact: WeChat **yhc-startup** · Email **ceo@quseit.com**
