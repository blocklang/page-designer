# 发布到 Npmjs

## 切换 NPM 镜像

查询当前镜像

```shell
npm config get registry
```

如果当前使用的是淘宝镜像，则切换回 Npmjs

```shell
npm config set registry https://registry.npmjs.org
```

使用完成后，可切换回淘宝镜像

```shell
npm config set registry https://registry.npm.taobao.org
```

## 构建

1. 在项目根目录下，运行 `dojo build widget --mode dist --target lib` 构建 `PageDesigner` 部件；
2. 将 `package.json` 文件复制到 `output/dist/` 文件夹下
3. 将 `README.md` 文件复制到 `output/dist/` 文件夹下

## 发布

1. 使用 `npm login` 命令登录;
2. 使用 `npm publish` 命令发布。
