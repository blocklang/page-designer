import { create, v } from "@dojo/framework/core/vdom";
import * as c from "bootstrap-classes";
import * as css from "./index.m.css";
import store from "@blocklang/designer-core/store";
import * as blocklang from "@blocklang/designer-core/blocklang";
import { AttachedWidget, PaneLayout } from "@blocklang/designer-core/interfaces";
import { find } from "@dojo/framework/shim/array";
import * as layoutParser from "./layoutParser";
import { PropertyLayout, ChangedPropertyValue } from "@blocklang/designer-core/interfaces";
import {
	changeActiveWidgetPropertiesProcess,
	activeWidgetPropertyProcess,
} from "../../../../../../processes/uiProcesses";
import { switchPageViewTypeProcess } from "../../../../../../processes/designerProcesses";
import { VNode } from "@dojo/framework/core/interfaces";

const factory = create({ store }).properties();

export default factory(function PropertiesTab({ middleware: { store } }) {
	let activeWidget: AttachedWidget | undefined;
	// 获取当前聚焦的部件
	const { get, path, executor } = store;
	const widgets = get(path("pageModel", "widgets"));
	if (widgets) {
		const selectedWidgetIndex = get(path("selectedWidgetIndex"));
		activeWidget = widgets[selectedWidgetIndex];
	}

	const _renderMessageNode = (errorMessage: string): VNode =>
		v("div", { classes: [css.root] }, [
			v("div", { classes: [c.text_center, c.text_muted, c.py_2] }, [`${errorMessage}`]),
		]);

	// 判断是否存在属性，是基于 layout 判断，而不是基于 widgets.properties
	// 因为 layout 不是严格对应每个属性的，而是会将多个属性组合在一起显示
	if (!activeWidget) {
		// 注意，设计要求必须在任何时间都要一个部件获取焦点
		// 所以，绝对不应该执行此处代码
		return _renderMessageNode("当前没有焦点获取部件");
	}

	// 因为属性的布局信息是存在 ide 仓库中的，所以这里需要找到组件所在的 ide 仓库
	const ideRepos = (get(path("projectDependencies")) || []).filter((repo) => repo.category === "Widget");
	const ideRepo = find(ideRepos, (item) => activeWidget != undefined && item.apiRepoId === activeWidget.apiRepoId);
	if (!ideRepo) {
		return _renderMessageNode("没有找到聚焦部件所属的 ide 组件仓库信息");
	}

	const layoutMeta: Array<PropertyLayout> = blocklang.findWidgetPropertiesLayout(
		{ website: ideRepo.gitRepoWebsite, owner: ideRepo.gitRepoOwner, repoName: ideRepo.gitRepoName },
		activeWidget.widgetName
	);
	if (layoutMeta.length === 0) {
		return _renderMessageNode("没有属性");
	}

	if (!activeWidget.properties) {
		console.error("部件的属性列表必须是数组类型，但现在的值是 undefined");
	}

	const activeWidgetPropertyIndex = get(path("selectedWidgetPropertyIndex"));

	// 关于部件实例中属性值的格式要求
	//
	// 必须按顺序加载属性，确保每次加载，同一个部件属性顺序都是一致的（如果不遵循此约定，不会影响程序逻辑）
	// 必须确保部件的属性列表全部加载，不论该属性是否有设置值，不然计算 index 时找不到对应的属性
	// 如果有父子属性，则子属性的属性名中要包含父属性名，格式为 ${parent}.${child}

	// 关于往属性部件中传入属性名还是属性在属性列表中的索引
	//
	// 即，传 name 合适，还是传 index 更合适
	// 这个问题，其实是一个计算时机的选择问题
	// 如果传 name 的话，则需要在 process 中根据 name 计算出 index
	// 如果传 index 的话，则需要在实例化属性部件之前根据 name 计算出 index
	// 在实例化属性部件之前计算 index，属性面板与当前部件实例的属性列表（属性位置）会绑定
	// 但如果传入 index，则不需要每次修改值时，都在 process 中重新计算 index
	// 所以，决定依然是传入 index，而不传入 name。

	const propertyWidgets = layoutParser.parse(
		layoutMeta,
		activeWidget.properties,
		activeWidgetPropertyIndex,
		(changedProperty: ChangedPropertyValue) => {
			const changedProperties: ChangedPropertyValue[] = [changedProperty];
			executor(changeActiveWidgetPropertiesProcess)({ changedProperties });
		},
		(paneLayout: Partial<PaneLayout>, data: { propertyIndex: number; propertyValue: string }) => {
			// FIXME: paneLayout 属性并没有用到，是否可以删除？

			// 1. 记录下选中的属性
			// 暂时考虑不缓存当前的属性值，而是在目标面板中根据属性索引来获取属性值
			const { propertyIndex } = data;
			executor(activeWidgetPropertyProcess)({ propertyIndex });
			// TODO: 创建一个空函数？
			// 2. 根据传入的参数切换到不同的面板，如切换到“交互/函数编辑器”面板
			executor(switchPageViewTypeProcess)({});
		},
		(index: number) => {
			console.log("index", index);
			executor(activeWidgetPropertyProcess)({ propertyIndex: index });
		}
	);
	return v("div", { classes: [css.root, c.py_1, c.px_1] }, propertyWidgets);
});
