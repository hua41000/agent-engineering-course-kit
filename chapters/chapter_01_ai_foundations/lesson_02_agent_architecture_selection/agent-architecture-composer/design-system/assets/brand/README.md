# Architecture Composer 品牌图形

- 文件：[composer-mark.png](composer-mark.png)，1254 × 1254 透明 PNG。
- 生成：2026-09-22，内置 `imagegen`，一次生成；保留原始输出，未手工重画。
- 概念：橙色与深色路径交接，形成一个建筑式入口，表达不同控制方式的组合。
- 用途：顶栏品牌、首页 Skill 区、报告水印与 favicon。功能图标继续使用 Material Symbols Rounded。
- 构建：`scripts/build.mjs` 将图形转为 data URL，离线 HTML 不请求外部图片。
- 该图形是 AI 生成素材，尚未进行商标检索或注册；无需将它解释为既有品牌授权。

## 生成提示词

```text
Use case: logo-brand. Create ONE polished flat logo mark for Architecture Composer, a software tool that combines stable workflows and adaptive agent paths into coherent architectures. Transparent-background square PNG. Mark only, no text or letters. Visual idea: a single bold architectural interlock made of two precisely aligned ribbon-like modular routes, one charcoal #262626 and one vivid orange #FF7918, meeting to form an open angular arch and a clean central negative-space passage. Distinctive compact silhouette, crisp vector-like edges, balanced 2D geometry, slightly softened corners, approximately 76% canvas occupancy. Must remain legible at 24px. Exactly two flat colors, no white background, no gradients, no glow, no shadows, no 3D. No brain, robot, chip, sparkle, medical cross, shield, or chat bubble. A professional design software brand, quiet confidence and construction logic. Output one final icon, no presentation sheet or mockup.
```

提示词记录生成意图；最终 PNG 带少量明暗质感，实际显示以本文件为准。品牌整体颜色由产品主题控制。
