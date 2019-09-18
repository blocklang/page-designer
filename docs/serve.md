# Serve

[Serve](https://github.com/zeit/serve) 是一个服务器。在开发过程中，我们使用 Serve 请求第三方的 js 和 css 等文件。所以，在启动 page designer 之前要先启动 serve。

Serve 相关的文件存放在 `serve` 文件夹中。

全局安装 serve

```shell
npm i -g serve
```

运行 serve

```shell
cd serve
serve -l 3001
```

或

```shell
npm run serve
```
