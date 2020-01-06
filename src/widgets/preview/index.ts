import { create, v, w } from "@dojo/framework/core/vdom";
import store from "designer-core/store";
import { Permission } from "../../interfaces";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { renderPage } from "./render";

import * as c from "bootstrap-classes";
import * as css from "./index.m.css";

export interface PreviewProperties {
	permission: Permission;
	onChangeEditMode: () => void;
}

const factory = create({ store }).properties<PreviewProperties>();

export default factory(function Preview({ properties, middleware: { store } }) {
	const { permission, onChangeEditMode } = properties();
	const { get, path } = store;
	const pageWidgets = get(path("pageModel", "widgets"));
	if (!pageWidgets) {
		// 正在加载
		return v("div", [
			v("div", { classes: [c.d_flex, c.justify_content_center, css.loadingPage] }, [
				v("div", { classes: [c.spinner_border, c.text_muted], role: "status", title: "加载中……" }, [
					v("span", { classes: [c.sr_only] }, ["Loading..."])
				])
			])
		]);
	}

	if (pageWidgets.length === 0) {
		// 一个页面中至少会有一个 Page 部件。
		// 代码不应执行到此处。
		return v("div", [
			v(
				"div",
				{ classes: [c.alert, c.alert_danger, c.mx_auto, c.text_center, c.py_5, css.emptyPage], role: "alert" },
				["页面中缺少根节点！"]
			)
		]);
	}

	if (pageWidgets.length === 1) {
		// 即只有一个根节点
		return v("div", [
			v(
				"div",
				{ classes: [c.alert, c.alert_info, c.mx_auto, c.text_center, c.py_5, css.emptyPage], role: "alert" },
				[
					v("p", { classes: [c.mb_0] }, ["我是一张空页面，您看看需加点什么。"]),
					permission.canWrite &&
						v(
							"button",
							{ classes: [c.btn, c.btn_outline_primary, c.mt_3], onclick: () => onChangeEditMode() },
							[w(FontAwesomeIcon, { icon: ["far", "edit"], classes: [c.mr_1] }), "开始编辑"]
						)
				]
			)
		]);
	}

	const ideRepos = get(path("ideRepos"));
	return v("div", [renderPage(pageWidgets, ideRepos)]);
});
