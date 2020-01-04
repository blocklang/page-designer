# page-designer

[![npm version](https://badge.fury.io/js/page-designer.svg)](https://badge.fury.io/js/page-designer)
[![Build Status](https://travis-ci.org/blocklang/page-designer.svg?branch=master)](https://travis-ci.org/blocklang/page-designer)
[![codecov](https://codecov.io/gh/blocklang/page-designer/branch/master/graph/badge.svg)](https://codecov.io/gh/blocklang/page-designer)

可视化页面设计器

详见[开发文档](./docs/README.md)

## 开发

在项目根目录下运行以下三个命令。

### 启动 [Json Server](./docs/json-server.md)

```shell
npm run json-server
```

### 启动 [Serve](./docs/serve.md)

从 git 仓库下载完源码后，`serve` 文件夹中没有 ide 版的部件。需先执行以下操作：

1. 从 github 上下载 [ide-widgets-bootstrap](https://github.com/blocklang/ide-widgets-bootstrap) 源码；
2. 进入 ide-widgets-bootstrap 根目录后执行 `npm run build` 命令构建项目；
3. 构建后的代码存放在 ide-widgets-bootstrap 项目的 `output/dist/` 文件夹中；
4. 复制 ide-widgets-bootstrap 项目的 `output/dist/` 文件夹中的所有文件，粘贴到本项目的 `serve/designer/assets/github.com/blocklang/ide-widgets-bootstrap/0.1.0/` 文件夹中。

然后运行以下命令：

```shell
npm run serve
```

### 启动 Page Designer

```shell
npm run dev
```

在浏览器中访问 `http://localhost:9999`。
