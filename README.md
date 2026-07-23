# TodoThings

本地桌面待办：系统托盘常驻、计划与子任务、颜色优先级排序、可选日期提醒。

## 开发

```bash
npm install
npm run dev
```

## 打包 Windows 安装包

```bash
npm run pack
```

输出到 `release/`：
- `TodoThings Setup 1.0.0.exe` — NSIS 安装包
- `TodoThings 1.0.0.exe` — 便携版（免安装）
- `win-unpacked/` — 解压后的可直接运行目录

数据保存在本机用户目录（SQLite，经 sql.js）。

## 使用说明

- 关闭窗口会最小化到托盘，不会退出
- 托盘菜单可打开窗口、新建待办或退出
- 左侧管理「计划」，右侧编辑任务树
- 优先级：紧急(红) / 重要(橙) / 普通(蓝) / 较低(灰)，默认按优先级排序
- 日期可清空；仅填写日期并勾选「提醒」后才会系统通知
