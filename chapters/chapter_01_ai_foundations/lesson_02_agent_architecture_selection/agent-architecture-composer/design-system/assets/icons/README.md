# 本地功能图标

Material Symbols Rounded，来源：bxy-core-design-system 0.2.4 自托管资产，授权见 APACHE-2.0.txt。项目仅保留 icon-map.json 登记的功能图标；使用 fontTools 固定为 FILL=0、wght=400、GRAD=0、opsz=24 并按码点裁剪。原始和子集 SHA-256 及使用清单见设计 manifest。

项目需要离线分发，因此构建时将字体作为 data URL 内嵌 HTML，无远程字体请求。后续扩展图标应从同一版本完整字体重新生成子集，更新 icon-map.json 与哈希；不要从当前子集推导缺失图标。
