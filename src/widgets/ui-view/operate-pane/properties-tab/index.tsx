import { create, v } from "@dojo/framework/core/vdom";
import * as c from "bootstrap-classes";
import * as css from "./index.m.css";
import store from "../../../../store";
import * as blocklang from "designer-core/blocklang";
import { AttachedWidget } from "../../../../interfaces";
import { find } from "@dojo/framework/shim/array";
import * as layoutParser from "./layoutParser";
import { PropertyLayout } from "designer-core/interfaces";

export interface PropertiesTabProperties {}

const factory = create({ store }).properties<PropertiesTabProperties>();

export default factory(function PropertiesTab({ properties, middleware: { store } }) {
	const {} = properties();

	let activeWidget: AttachedWidget | undefined;
	// 获取当前聚焦的部件
	const { get, path } = store;
	const widgets = get(path("pageModel", "widgets"));
	if (widgets) {
		const selectedWidgetIndex = get(path("selectedWidgetIndex"));
		activeWidget = widgets[selectedWidgetIndex];
	}

	let _renderMessageNode = (errorMessage: string) =>
		v("div", { classes: [css.root] }, [v("div", { classes: [c.text_center, c.text_muted] }, [`${errorMessage}`])]);

	// 判断是否存在属性，是基于 layout 判断，而不是基于 widgets.properties
	// 因为 layout 不是严格对应每个属性的，而是会将多个属性组合在一起显示
	if (!activeWidget) {
		// 注意，设计要求必须在任何时间都要一个部件获取焦点
		// 所以，绝对不应该执行此处代码
		return _renderMessageNode("当前没有焦点获取部件");
	}

	const ideRepos = get(path("ideRepos")) || [];
	const ideRepo = find(ideRepos, (item) => item.id === activeWidget!.componentRepoId);
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

	const propertyWidgets = layoutParser.parse(layoutMeta);
	return v("div", { classes: [css.root] }, propertyWidgets);
});
