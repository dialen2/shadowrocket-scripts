/**
 * 影视 M3U8 通用去广告脚本（切片颗粒度级清洗版）
 * 兼容: Surge / Loon / Quantumult X / Shadowrocket
 * Telegram群组：https://t.me/tvshare23
 *
 * 方案A：
 * 1. 显式返回 status + headers + body
 * 2. 移除 Content-Encoding / Content-Range / Accept-Ranges / Transfer-Encoding
 * 3. 重新计算 Content-Length
 * 4. Master Playlist 直接透传，不做清洗
 * 5. 只对 Media Playlist 做切片级去广告
 */

let body = $response.body;
const status = $response.status || 200;
const headers = $response.headers || {};

function cleanHeaders(len) {
    const h = {};
    for (let k in headers) {
        const kl = k.toLowerCase();
        if (kl === "content-encoding" ||
            kl === "content-length" ||
            kl === "content-range" ||
            kl === "accept-ranges" ||
            kl === "transfer-encoding") {
            continue;
        }
        h[k] = headers[k];
    }
    h["Content-Length"] = String(len);
    return h;
}

// body 不是字符串：完全原样返回，不碰 headers
if (typeof body !== "string") {
    $done({});
} else if (body.indexOf("#EXTM3U") === -1) {
    // 非 M3U8 响应：原样透传
    console.log("非M3U8，透传, status=" + status + ", len=" + body.length);
    $done({ status: status, headers: cleanHeaders(body.length), body: body });
} else if (body.indexOf("#EXT-X-STREAM-INF") !== -1) {
    // Master Playlist：直接透传，绝不动子列表 URL
    console.log("Master 透传, status=" + status + ", len=" + body.length);
    $done({ status: status, headers: cleanHeaders(body.length), body: body });
} else {
    // Media Playlist：清洗广告切片
    const rawLines = body.replace(/\r/g, "").split("\n");
    const outputLines = [];

    try {
        // 精准广告特征词库（新增 RCP0FQBQ，含 7Lzh4PuW、didibo、lsbbf、aim3u8、CK百花等全量既有特征）
        const adKeywords = /(RCP0FQBQ|nlfRR6gH|7Lzh4PuW|V2C7MJhC|ymO7zGr9|Bjf6z0RU|jHKrrx6s|2078kb|a3a6eda11cbfa352|2f1563ca37e75212|2db1cf28fb771e0d|de820e92881bd4d1|6aa3d5aa8e8c1ac11479d82a|GB1mnQDZ|adjump|\/video\/adjump|1787319|178732000|84_9109598f|751808405d7|10152kb|9622kb|9641kb|10141kb|1000kb|30EjJFTT|W7fqTmbJ|JKyp1S2D|5568049a638c79f9|ec5db3bbf268dd34|7e14ee319bf8017d|ac080df0b161b6fb|ea6bb8a311db9dd0|1f1d60431202f328|39803bb0fa0ec24b|787de3b9178c4058|0916de7dab851cd8|65e7a9371db1b651|Zse0Tpg8|seg_iif|9c08cdc|a6b9d4136946ad41|a0fd38|\/stream\/|\/mov\/AD\/|8jlf67z19|C7bAbClC|erlgnf\.com|adjump|^\/\d{8}\/[a-f0-9]{16}\/seg_)/i;

        let pendingExtinf = null;
        let pendingDiscontinuity = false;
        let hasAdRemoved = false;

        for (let i = 0; i < rawLines.length; i++) {
            let line = rawLines[i].trim();
            if (!line) continue;

            let upperLine = line.toUpperCase();

            // 1. 过滤混淆与注入标签
            if (upperLine.startsWith("#DISC-NOISE") || upperLine.includes("PPVOD-AD-INJECTED")) {
                continue;
            }

            // 2. 剔除明文加密切换标签
            if (upperLine.startsWith("#EXT-X-KEY") && upperLine.includes("METHOD=NONE")) {
                continue;
            }

            // 3. 广告专属 Key 剔除
            if (upperLine.startsWith("#EXT-X-KEY") && adKeywords.test(line)) {
                continue;
            }

            // 4. 捕获断点标签
            if (upperLine.startsWith("#EXT-X-DISCONTINUITY")) {
                pendingDiscontinuity = true;
                continue;
            }

            // 5. 正片真实解密 Key：保证断点在 Key 之前输出
            if (upperLine.startsWith("#EXT-X-KEY")) {
                if (pendingDiscontinuity || hasAdRemoved) {
                    if (outputLines.length > 0 && !outputLines[outputLines.length - 1].toUpperCase().startsWith("#EXT-X-DISCONTINUITY")) {
                        outputLines.push("#EXT-X-DISCONTINUITY");
                    }
                    pendingDiscontinuity = false;
                    hasAdRemoved = false;
                }
                outputLines.push(line);
                continue;
            }

            // 6. 暂存切片时长标签
            if (upperLine.startsWith("#EXTINF")) {
                pendingExtinf = line;
                continue;
            }

            // 7. 处理切片实体行
            if (!line.startsWith("#")) {
                if (adKeywords.test(line)) {
                    // 命中广告切片
                    pendingExtinf = null;
                    hasAdRemoved = true;
                } else {
                    // 正片切片：确保开始前有且仅有一个断点
                    if (pendingDiscontinuity || hasAdRemoved) {
                        if (outputLines.length > 0 && !outputLines[outputLines.length - 1].toUpperCase().startsWith("#EXT-X-DISCONTINUITY")) {
                            outputLines.push("#EXT-X-DISCONTINUITY");
                        }
                        pendingDiscontinuity = false;
                        hasAdRemoved = false;
                    }
                    if (pendingExtinf) {
                        outputLines.push(pendingExtinf);
                        pendingExtinf = null;
                    }
                    outputLines.push(line);
                }
                continue;
            }

            // 8. 其它标准元数据原样保留
            outputLines.push(line);
        }

        const newBody = outputLines.join("\n");
        console.log("Media 清洗后长度: " + newBody.length + ", 原长度: " + body.length);

        // 如果没删任何东西，也原样透传，避免无谓的 headers 变更
        if (newBody === body) {
            console.log("清洗后无变化，透传");
            $done({ status: status, headers: cleanHeaders(body.length), body: body });
        } else {
            $done({ status: status, headers: cleanHeaders(newBody.length), body: newBody });
        }
    } catch (e) {
        console.log("clean_m3u8 error: " + e);
        // 异常时回退原始响应
        $done({ status: status, headers: cleanHeaders(body.length), body: body });
    }
}
