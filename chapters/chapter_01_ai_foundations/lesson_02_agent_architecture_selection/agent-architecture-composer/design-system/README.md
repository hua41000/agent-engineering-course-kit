# 界面设计系统

本目录是架构选型工作台的本地主题、品牌图形与功能图标来源，采用百小医 `adaptive` 浅色规范。

- [设计契约](BXY_DESIGN_SYSTEM.md)：组件映射、项目例外与视口检查。
- [Tokens](bxy-design-tokens.json)：设计值的唯一来源，`project` / `projectMobile` 为项目扩展。
- [CSS 映射](bxy-design-tokens.css)：基础 Web 变量适配；项目覆盖由构建脚本从 JSON 生成。
- [安装与资源记录](bxy-design-manifest.json)：Skill 版本、profile、字体哈希和轴值。
- [品牌资源说明](assets/brand/README.md)：Logo 生成来源、提示词及离线使用方式。
- [图标资源说明](assets/icons/README.md)：固定字体子集、映射与 Apache-2.0 授权。

`../scripts/build.mjs` 将主题、组件样式和字体内嵌到离线 HTML。更新源码后运行 `npm run build`，不手工改构建文件。重跑上游安装器会覆盖项目契约与资源，应先比对基础规范变化，再保留本目录的项目扩展。
