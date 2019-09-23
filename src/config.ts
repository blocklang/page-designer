/**
 * 存放全局变量，有时不希望在部件中层层传递某些参数，就可以存在此处。
 *
 * config 中只能存储系统参数
 */
export let config = {
	fetchApiRepoWidgetsUrl: "", // 获取项目依赖的所有 Widget 组件库中的部件
	fetchPageModelUrl: "", // 获取页面模型
	// 获取一个项目的 IDE 依赖，其中仅包含依赖的描述信息，不包含依赖文件
	// 当仅需要 widget 依赖的信息时，从返回的结果中筛选，而不是重新向服务器端请求
	fetchIdeDependenceInfosUrl: "",
	// 第三方静态资源，即组件市场中的 js 文件和 css 文件的根网址
	// 值为空字符串时，表示第三方资源与设计器部署在同一个服务器
	externalScriptAndCssWebsite: ""
};
