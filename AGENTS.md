# 课程配套项目维护规则

- 本仓库管理《企业级Agent工程架构实战营》公开配套内容，导航登记在 `course-map.json`。
- 先读根 README、所在篇章和课次 README，再读项目 README 与 manifest。
- 目录按 `chapters/chapter_NN_slug/lesson_NN_slug/<project>/` 组织；课次全课连续编号。复用项目使用链接。
- 总课纲和教学范围由课程开发仓库维护；此处只维护导航与配套交付物。
- 当前内容唯一开发源在本仓库。课程开发仓库通过 submodule 和相对软链引用。
- 修改目录、交付物或状态时，同步更新对应 README、manifest 和 `course-map.json`。
- 中文观点直接陈述，避免先否定另一观点再转折。
- 保留原有第三方许可。不得提交密钥、学员真实数据、依赖目录及可复建产物。
- 执行 `npm test`、`npm run build`、`npm run smoke` 和 `git diff --check`；无需安装 npm 依赖。
