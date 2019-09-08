# Json Server

[Json Server](https://github.com/typicode/json-server) 是一个存储 json 数据的服务器。在开发过程中，我们使用 Json Server 作为 page designer 的服务器。所以，在启动 page designer 之前要先启动 json server。

全局安装 json-server

```shell
npm i -g json-server
```

运行 json server

```shell
json-server --watch json-server/db.json --routes json-server/routes.json
```

或

```shell
npm run json-server
```
