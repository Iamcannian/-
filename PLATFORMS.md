# 手机和电脑：两个独立维护入口

| 平台 | 固定覆写链接 | 说明 |
|---|---|---|
| 手机 Bettbox | https://raw.githubusercontent.com/Iamcannian/-/main/mobile/bettbox.js | mobile/README.md；原有手机版行为不变 |
| 电脑 Clash Party / Windows 系统代理 | https://raw.githubusercontent.com/Iamcannian/-/main/desktop/clash-party.js | desktop/README.md；独立设置包与默认策略 |

电脑设置包：https://raw.githubusercontent.com/Iamcannian/-/main/desktop/ClashParty-Windows-Settings.zip

旧根目录链接保留兼容；不能在同一个订阅同时绑定新旧两个脚本。手机不导入电脑设置包。

维护规则：两份是独立源码，不从对方运行时下载代码；平台变更只提交到对应目录，兼容副本跟随各自平台同步。通用修复需要在两平台分别审查、测试，不能为了电脑优化直接重写手机版。

本次电脑1.1.0；手机保持3.0.0-test.1。测试：

```
node tests/override.test.cjs
node tests/clashparty.test.cjs
python tests/platform-settings.test.py
```

每次提交前校验默认策略、倍率隔离、DNS/规则路由、应用设置优先级；不能将Linux内核测试冒充Windows实机测试。
