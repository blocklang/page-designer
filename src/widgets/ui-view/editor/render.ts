import Page from "std-ide-widget/page";
import { ComponentRepo, AttachedWidget } from "../../../interfaces";
import global from "@dojo/framework/shim/global";
import { find } from "@dojo/framework/shim/array";
import { w } from "@dojo/framework/core/vdom";
import { WNode } from "@dojo/framework/core/interfaces";
import { EditableWidgetProperties, InstWidgetProperties, EditableProperties } from "designer-core/interfaces";
import { config } from "../../../config";
import UndefinedWidget from "../UndefinedWidget";

// 有两种方式共享 widgets 和 ideRepos 的值，以避免在每个函数中多次传递
// 1. 在此处缓存 widgets 和 ideRepos 的值
// 2. 将其他函数作为 renderPage 的内嵌函数
// 这里使用缓存数据的方式，且必须是只读的
let roWidgets: ReadonlyArray<AttachedWidget>;
let roIdeRepos: ReadonlyArray<ComponentRepo>;
let roEditableProperties: Readonly<EditableProperties>;

/**
 * @function renderPage
 *
 * 返回渲染页面的节点，只能有一个根节点。
 *
 * @param widgets                页面部件列表
 * @param ideRepos               项目引用的 ide 版组件库
 * @param editableProperties     为部件扩展的属性，支持在设计器中交互
 */
export function renderPage(
	widgets: AttachedWidget[],
	ideRepos: ComponentRepo[],
	editableProperties: EditableProperties
): WNode {
	if (widgets.length === 0) {
		throw new Error("页面中的部件个数不能为0，至少要包含一个根部件！");
	}

	const rootWidget = widgets[0];
	if (rootWidget.parentId !== config.rootWidgetParentId) {
		throw new Error("第一个部件应该是根部件，但此模块的第一个部件却不是根部件。");
	}

	// 缓存数据
	roWidgets = widgets;
	roIdeRepos = ideRepos;
	roEditableProperties = editableProperties;

	return renderWidget(rootWidget, 0);
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
	// 1. 根据 componentRepoId 获取到 componentRepo 信息
	const ideRepo = find(roIdeRepos, (item) => item.id === widget.componentRepoId);
	if (!ideRepo) {
		return w(UndefinedWidget, { widget });
	}

	// 2. 根据 componentRepo 获取到组件
	const widgetType = getWidgetType(ideRepo, widget.widgetName);
	if (!widgetType) {
		return w(UndefinedWidget, { widget, componentRepo: ideRepo });
	}

	// 设置 Widget 的 key 值
	// key 的值必须要包含位置索引，不然当子部件的位置发生变换时，通过 id 无法对比出差别
	// 注意，index 的值是直属子部件的索引，不是全局列表的索引
	const key = `${index}_${widget.id}`;

	// FIXME: 这里需要进行数据转换，要逐个盘查数据项，删掉不需要的数据项！
	// 最直接的方式，就是直接在这里将所有的属性展开并覆盖，但是是否可以这样做呢？
	// 是在可编辑的部件外展开，还是在可编辑的部件内展开呢？哪种方式更妥？
	// 先选择在部件外展开，然后随着开发的深入，再做调整。
	// 不要一下子放开接口，要逐步增加和组合

	let originalProperties: InstWidgetProperties = {};
	widget.properties &&
		widget.properties.forEach((item) => {
			// 如果 item 的 type 为 function，且值为 undefined，则设置为 ()=>{}
			// 注意，从服务器端返回的是字符串类型，这里需要转换。
			const value = item.value ? item.value : () => {};
			originalProperties[item.name] = value;
		});

	const properties: EditableWidgetProperties = {
		key,
		widget: {
			id: widget.id,
			parentId: widget.parentId,
			widgetCode: widget.widgetCode,
			widgetName: widget.widgetName,
			canHasChildren: widget.canHasChildren
		},
		originalProperties,
		extendProperties: roEditableProperties,
		...originalProperties
	};

	// index 指向的是选中的部件，这里要获取选中部件的第一个子节点，所以要 + 1
	const firstChildIndex = index + 1;
	let childWNodes: WNode[] = renderChildWidgets(firstChildIndex, getChildrenIndex(widget.id, firstChildIndex));

	return w(widgetType, properties, childWNodes);
}

/**
 * @function getChildrenIndex
 *
 * 获取 widgetId 对应部件的所有直属子部件的索引集合。
 *
 * @param widgetId          部件 id
 * @param firstChildIndex   是第一个子部件的索引，从 firstChildIndex 位置开始查找
 *
 * @returns                 因为直属子部件的索引在列表中是不连续的，所以返回的是索引集合，而不是最后一个子部件的索引。
 */
function getChildrenIndex(widgetId: string, firstChildIndex: number): number[] {
	const result: number[] = [];
	const len = roWidgets.length;
	for (let i = firstChildIndex; i < len; i++) {
		if (roWidgets[i].parentId === widgetId) {
			result.push(i);
		}
	}
	return result;
}

/**
 * @function renderChildWidgets
 *
 * 渲染子部件
 *
 * @param firstChildIndex   父部件第一个子部件的索引
 * @param children          父部件直属子部件的索引集合
 */
function renderChildWidgets(firstChildIndex: number, children: number[]): WNode[] {
	const childWNodes: WNode[] = [];
	for (let i = 0; i < children.length; i++) {
		const eachWidget = roWidgets[children[i]];
		childWNodes.push(renderWidget(eachWidget, i));
	}
	return childWNodes;
}

// 标准库。标准库是在引用处显式指定的。而扩展库是由用户配置的。
// TODO: 移到单独的文件中
// 因为此处只加载了一个版本，所以不需要在路径中包含版本号。
const stdMap: { [propName: string]: any } = {
	"github.com/blocklang/std-ide-widget": {
		Page: Page
	}
};

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
function getWidgetType(ideRepo: ComponentRepo, widgetName: string) {
	// key 中不需要版本号，因为页面中只加载了一个版本。
	const repoKey = `${ideRepo.gitRepoWebsite}/${ideRepo.gitRepoOwner}/${ideRepo.gitRepoName}`;
	console.log("repoKey: ", repoKey);
	// 优先从标准库中查找
	let widgetType = stdMap[repoKey] && stdMap[repoKey][widgetName];
	if (widgetType) {
		return widgetType;
	}

	// 从扩展库中查找
	widgetType =
		global._block_lang_widgets_ &&
		global._block_lang_widgets_[repoKey] &&
		global._block_lang_widgets_[repoKey][widgetName];
	if (widgetType) {
		return widgetType;
	}
}
