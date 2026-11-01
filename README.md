# ⚡ shadowrocket-scripts

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Shadowrocket-blue?style=for-the-badge&logo=shadowrocket" alt="Platform">
  <img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Language">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <b>精细化·自动化·极简美学的视频切片广告去除</b>
  <br>
  <sub>自用小火箭去广告模块与脚本</sub>
</p>
/**
 * 影视 M3U8 通用去广告脚本（切片颗粒度级清洗版）
 * 兼容: Surge / Loon / Quantumult X / Shadowrocket
 * Telegram群组：https://t.me/tvshare23
 *
 * 方案：
 * 1. 显式返回 status + headers + body
 * 2. 移除 Content-Encoding / Content-Range / Accept-Ranges / Transfer-Encoding
 * 3. 重新计算 Content-Length
 * 4. Master Playlist 直接透传，不做清洗
 * 5. 只对 Media Playlist 做切片级去广告
 */
