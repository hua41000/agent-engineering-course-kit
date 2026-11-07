# 第 13 课学习资料

《企业级Agent工程架构实战营》｜Compass 可靠模型执行

[下载学习资料包](lesson-13-learning-materials.zip)。解压后先阅读 `README.md`，再按 PRD → 技术方案的顺序学习。

包内包含最终 PRD、Markdown 技术方案与可直接双击打开的离线 HTML 技术方案。HTML 支持目录、搜索、图表缩放、SVG 导出和代码复制，无需安装依赖或启动服务；Markdown 中的 Mermaid 需要相应阅读器支持。

本课覆盖有界重试、共享并发容量、截止时间、取消与清理隔离、尝试摘要、流式最终提交，以及管理员后台的 11 个可靠性模拟场景。课堂演示入口位于 Compass 管理员的“Agent 与模型”页 `/platform/models`；场景与预期见包内 PRD，启动方法见课程节点中的 Compass README。

本目录保存工程交付的分发副本。维护源位于课程开发仓库的 `learner-kit/code/compass/mai-specs/991-lesson-13-reliable-model-execution/`，对应提交 `754aaf67804e8a81d9ebb3b4090374ae244fc7b2`、课程节点标签 `compass/L13-complete`。更新时从工程重新生成并校验复制哈希，包内文档随工程维护。

ZIP 大小为 166943 字节，使用普通 Git 文件存储。SHA-256 及来源登记在 [manifest.yml](manifest.yml)。

单元、PostgreSQL、浏览器与受控负载验收已通过；Docker 实际部署与真实厂商故障注入未执行。100 客户端 / 1,000 调用的观测来自本机受控测试，生产环境的延迟与吞吐需单独测量。
