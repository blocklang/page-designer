import Page from "@blocklang/std-widget-web/page";
import { InstWidgetProperties } from "../../interfaces";
import { ComponentRepo, AttachedWidget, PageFunction } from "@blocklang/designer-core/interfaces";
import { find } from "@dojo/framework/shim/array";
import { w } from "@dojo/framework/core/vdom";
import { WNode } from "@dojo/framework/core/interfaces";
import { config } from "../../config";
import * as blocklang from "@blocklang/designer-core/blocklang";
import UndefinedWidget from "../UndefinedWidget";
import { getChildrenIndex } from "@blocklang/designer-core/utils/treeUtil";
import { execute } from "./executor";

// 有两种方式共享 widgets 和 ideRepos 的值，以避免在每个函数中多次传递
// 1. 在此处缓存 widgets 和 ideRepos 的值
// 2. 将其他函数作为 renderPage 的内嵌函数
// 这里使用缓存数据的方式，且必须是只读的
let roWidgets: ReadonlyArray<AttachedWidget>;
let roIdeWidgetRepos: ReadonlyArray<ComponentRepo>;
let roIdeWebApiRepos: ReadonlyArray<ComponentRepo>;
let roFunctions: ReadonlyArray<PageFunction>;
let cachedStore: any;

// 标准库。标准库是在引用处显式指定的。而扩展库是由用户配置的。
// TODO: 移到单独的文件中
// 因为此处只加载了一个版本，所以不需要在路径中包含版本号。

// 之前的设计，为什么要强耦合一个 Page 部件呢？
// 1. 每个页面必须有一个 Page 部件，在 Page 部件中有很多与设计器相关的功能
// 现在遇到的问题
// 1. 现在为每一类项目都定义了一套基础库，而基础库中会包含 Page 等部件，所以现在可能不需要内嵌标准库了；
// 2. 并且这个标准库也是不够通用的，比如小程序的 Page 与鸿蒙轻量级智能穿戴应用的 Page 就不同。

/**
 * @deprecated 不再内嵌标准实现，而是通过让项目默认依赖标准库，与第三方库相同的方式来延迟加载
 *
 * 相关代码在 v0.7.0 版本中删除
 */
const stdMap: { [propName: string]: any } = {
	"github.com/blocklang/std-ide-widget": {
		Page: { widget: Page, propertiesLayout: [] },
	},
};

function findStdWidgetType(repoUrl: string, widgetName: string): any {
	return stdMap[repoUrl] && stdMap[repoUrl][widgetName] && stdMap[repoUrl][widgetName].widget;
}

/**
 * 根据部件的基本信息，获取对应的部件类型。
 *
 * 按照以下顺序查找部件类型：
 *
 * 1. 从标准库中查找组件，如果查不到
 * 1. 再从 window._block_lang_widgets_ 中查找，如果查不到
 * 1. 则返回 undefined
 *
 * @param ideRepo IDE 版组件库基本信息
 * @param widgetName 部件名称，此名称要在组件库中全局唯一
 */
function getWidgetType(ideRepo: ComponentRepo, widgetName: string): any {
	// key 中不需要版本号，因为页面中只加载了一个版本。
	const repoKey = blocklang.getRepoUrl({
		website: ideRepo.gitRepoWebsite,
		owner: ideRepo.gitRepoOwner,
		repoName: ideRepo.gitRepoName,
	});
	// 优先从标准库中查找
	const widgetType = findStdWidgetType(repoKey, widgetName);
	if (widgetType) {
		return widgetType;
	}

	// 从扩展库中查找
	return blocklang.findWidgetType(repoKey, widgetName);
}

/**
 * @function renderWidget
 *
 * 渲染一个指定的部件
 *
 * @param widget         部件信息
 * @param index          当前部件在兄弟列表中的索引，如果是根节点，索引值为 0
 *
 * @returns              返回指定的部件
 */
function renderWidget(widget: AttachedWidget, index: number): WNode {
	// 1. 将 widget 的 apiRepoId 与 ide 组件库的 apiRepoId 对比，找到第一个匹配的 ide 组件库
	// 2. 根据 componentRepoId 获取到 componentRepo 信息
	// 注意，页面模型中只存 api 组件库信息，不存任何实现相关的信息

	const ideRepo = find(roIdeWidgetRepos, (item) => item.apiRepoId === widget.apiRepoId);
	if (!ideRepo) {
		return w(UndefinedWidget, { widget, editMode: "Preview" });
	}

	// 3. 根据 ide 获取到组件库
	// 4. 根据部件名查找部件类
	const widgetType = getWidgetType(ideRepo, widget.widgetName);
	if (!widgetType) {
		return w(UndefinedWidget, { widget, componentRepo: ideRepo, editMode: "Preview" });
	}

	// 设置 Widget 的 key 值
	// key 的值必须要包含位置索引，不然当子部件的位置发生变换时，通过 id 无法对比出差别
	// 注意，index 的值是直属子部件的索引，不是全局列表的索引
	const key = `${index}_${widget.id}`;

	const originalProperties: InstWidgetProperties = {};
	widget.properties &&
		widget.properties.forEach((item) => {
			// 如果 item 的 type 为 function，且值为 undefined，则设置为 ()=>{}
			// 注意，从服务器端返回的是字符串类型，这里需要转换。
			let value;
			if (item.valueType === "function") {
				// 如果 value 存在值，则说明该事件已绑定函数
				// 如果 value 的值为 undefined，则说明该事件未绑定函数
				if (item.value != undefined) {
					// 绑定一个函数
					value = (eventValue: string): void => {
						// 根据 item.value 定位到函数，然后开始执行函数节点
						const func = find(roFunctions, (funcItem) => funcItem.id === item.value);
						if (func) {
							execute(cachedStore, func, eventValue, roIdeWebApiRepos);
						}
					};
				}
			} else {
				value = item.value || "";
			}

			originalProperties[item.name] = value;
		});

	const properties = {
		key,
		...originalProperties,
	};

	// 渲染子节点
	// index 指向的是选中的部件，这里要获取选中部件的第一个子节点，所以要 + 1
	const firstChildIndex = index + 1;

	const children = getChildrenIndex(roWidgets, widget.id, firstChildIndex);
	const childWNodes: WNode[] = [];
	for (let i = 0; i < children.length; i++) {
		const eachWidget = roWidgets[children[i]];
		childWNodes.push(renderWidget(eachWidget, i));
	}

	return w(widgetType, properties, childWNodes);
}

/**
 * @function renderPage
 *
 * 返回渲染页面的节点，只能有一个根节点。
 *
 * @param widgets                页面部件列表
 * @param ideRepos               项目引用的 ide 版组件库
 * @param functions              页面函数列表
 */
export function renderPage(widgets: AttachedWidget[], ideRepos: ComponentRepo[], store: any): WNode {
	if (widgets.length === 0) {
		throw new Error("页面中的部件个数不能为0，至少要包含一个根部件！");
	}

	const rootWidget = widgets[0];
	if (rootWidget.parentId !== config.rootWidgetParentId) {
		throw new Error("第一个部件应该是根部件，但此模块的第一个部件却不是根部件。");
	}

	// 缓存数据
	roWidgets = widgets;
	roIdeWidgetRepos = ideRepos.filter((repo) => repo.category === "Widget");
	roIdeWebApiRepos = ideRepos.filter((repo) => repo.category === "WebAPI");
	cachedStore = store;
	roFunctions = store.get(store.path("pageModel", "functions")) || [];

	return renderWidget(rootWidget, 0);
}
