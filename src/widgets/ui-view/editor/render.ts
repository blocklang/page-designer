import Page from "std-ide-widget/page";
import { ComponentRepo, AttachedWidget } from "../../../interfaces";
import global from "@dojo/framework/shim/global";
import { find } from "@dojo/framework/shim/array";
import { w } from "@dojo/framework/core/vdom";
import { WNode } from "@dojo/framework/core/interfaces";
import { EditableWidgetProperties, InstWidgetProperties } from "designer-core/interfaces";

/**
 * 返回渲染页面的节点，只能有一个根节点。
 *
 * @param widgets
 * @param ideRepos
 */
export function renderPage(widgets: AttachedWidget[], ideRepos: ComponentRepo[]): WNode {
	const widgetInfo = widgets[0];
	if (!widgetInfo) {
		throw new Error("部件个数不能为0，至少存在一个根部件！");
	}

	// 1. 根据 componentRepoId 获取到 componentRepo 信息
	const ideRepo = find(ideRepos, (item) => item.id === widgetInfo.componentRepoId);
	if (!ideRepo) {
		throw new Error("没有找到包含部件的组件库信息！");
	}
	// 2. 根据 componentRepo 获取到组件
	const widget = getWidget(ideRepo, widgetInfo.widgetName);
	// FIXME: 这里需要进行数据转换，要逐个盘查数据项，删掉不需要的数据项！

	// 最直接的方式，就是直接在这里将所有的属性展开并覆盖，但是是否可以这样做呢？
	// 是在可编辑的部件外展开，还是在可编辑的部件内展开呢？哪种方式更妥？
	// 先选择在部件外展开，然后随着开发的深入，再做调整。

	let originalProperties: InstWidgetProperties = {};
	widgetInfo.properties.forEach((item) => {
		// 如果 item 的 type 为 function，且值为 undefined，则设置为 ()=>{}
		// 注意，从服务器端返回的是字符串类型，这里需要转换。
		const value = item.value ? item.value : () => {};
		originalProperties[item.name] = value;
	});

	const properties: EditableWidgetProperties = {
		widget: {
			id: widgetInfo.id,
			parentId: widgetInfo.parentId,
			widgetCode: widgetInfo.widgetCode,
			widgetName: widgetInfo.widgetName,
			canHasChildren: widgetInfo.canHasChildren
		},
		originalProperties,
		extendProperties: {
			onFocus: () => {},
			activeWidgetId: ""
		},
		...originalProperties
	};
	// 不要一下子放开接口，要逐步增加和组合
	return w(widget, properties);
}

// 标准库。标准库是在引用处显式指定的。而扩展库是由用户配置的。
// TODO: 移到单独的文件中
// 因为此处只加载了一个版本，所以不需要在路径中包含版本号。
const stdMap: { [propName: string]: any } = {
	"github.com/blocklang/std-ide-widget": {
		Page: Page
	}
};

// 创建一个函数，先从标准库中查找组件，如果查不到，再从 window._block_lang_widgets_ 中查找组件
function getWidget(ideRepo: ComponentRepo, widgetName: string) {
	// key 中不需要版本号，因为页面中只加载了一个版本。
	const repoKey = `${ideRepo.gitRepoWebsite}/${ideRepo.gitRepoOwner}/${ideRepo.gitRepoName}`;
	console.log("repoKey: ", repoKey);
	// 优先从标准库中查找
	let widget = stdMap[repoKey][widgetName];
	if (widget) {
		return widget;
	}
	widget = global._block_lang_widgets_[repoKey][widgetName];
	if (widget) {
		return widget;
	}
	// 如果依然没有找到，则返回一个 UndefinedWidget 部件，其中通过高亮样式和文字提示用户。
}
