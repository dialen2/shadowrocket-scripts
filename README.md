# ⚡ shadowrocket-scripts

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Shadowrocket-blue?style=for-the-badge&logo=shadowrocket" alt="Platform">
  <img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Language">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <b>精细化·自动化·极简美学的视频切片广告去除</b>
  <br>
  <sub>影视 M3U8 通用去广告脚本（切片颗粒度级清洗版）</sub>
  <sub>兼容: Surge / Loon / Quantumult X / Shadowrocket</sub>
  <sub>name=蝴蝶影视 M3U8 贴片去广告合集</sub>
  <sub>desc=自动清洗各采集站 M3U8 列表开头的 TS/图片切片广告及分流优化</sub>
  <sub>category=Scripting</sub>
  <sub>author=🦋 蝴蝶影视</sub>
  <sub>Telegram群组：https://t.me/tvshare23</sub>
</p>

### 模块链接

- url= 
```
https://raw.githubusercontent.com/dialen2/shadowrocket-scripts/refs/heads/main/Clean-M3U8.sgmodule
```

### 目前已收录站点：

```
大鸡吧、爆草留学生、塘心次元、采花大盗、蝴蝶影院、午夜影视、深夜影院、吉利猫、GDD视频、V155P视频、8K视界、桃花影视、Vostrely视频、麻豆短剧、番茄影视、美人姬、量子/暴风系、陌陌一夜情、CK百花资源、爱爱系列、麻花视频、滴滴播系列、暗夜蜜桃、久久网
```

### 方案：

- 1. 显式返回 status + headers + body
- 2. 移除 Content-Encoding / Content-Range / Accept-Ranges / Transfer-Encoding
- 3. 重新计算 Content-Length
- 4. Master Playlist 直接透传，不做清洗
- 5. 只对 Media Playlist 做切片级去广告
