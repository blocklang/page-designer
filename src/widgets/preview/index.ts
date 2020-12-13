import { create, v, w } from "@dojo/framework/core/vdom";
import store from "@blocklang/designer-core/store";
import { Permission, Page } from "../../interfaces";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";
import { renderPage } from "./render";

import * as c from "@blocklang/bootstrap-classes";
import * as css from "./index.m.css";

import MobileSimulatorContainer from "../edit/ui/mobile/SimulatorContainer";
import WearableSimulatorContainer from "../edit/ui/wearable/SimulatorContainer";
import { AppType, DeviceType } from "../../constants";

export interface PreviewProperties {
	page: Page;
	permission: Permission;
	onSwitchEditMode: () => void;
}

const factory = create({ store }).properties<PreviewProperties>();

export default factory(function Preview({ properties, middleware: { store } }) {
	const { page, permission, onSwitchEditMode } = properties();
	const { appType, deviceType } = page;

	const { get, path } = store;
	const pageWidgets = get(path("pageModel", "widgets"));

	if (!pageWidgets) {
		// 正在加载
		return v("div", [
			v("div", { classes: [c.d_flex, c.justify_content_center, css.loadingPage] }, [
				v("div", { classes: [c.spinner_border, c.text_muted], role: "status", title: "加载中……" }, [
					v("span", { classes: [c.visually_hidden] }, ["Loading..."]),
				]),
			]),
		]);
	}

	if (appType === AppType.Web) {
		return tryRenderWebPage();
	}

	if (appType === AppType.Mobile || appType === AppType.MiniProgram) {
		return w(MobileSimulatorContainer, {}, [tryRenderMobilePage()]);
	}

	if (appType === AppType.HarmonyOS) {
		if (deviceType === DeviceType.LiteWearable) {
			return w(WearableSimulatorContainer, {}, [tryRenderMobilePage()]);
		}
	}

	function tryRenderWebPage() {
		if (pageWidgets.length === 0) {
			// 一个页面中至少会有一个 Page 部件。
			// 代码不应执行到此处。
			return v("div", [
				v(
					"div",
					{
						classes: [c.alert, c.alert_danger, c.mx_auto, c.text_center, c.py_5, css.emptyPage],
						role: "alert",
					},
					["页面中缺少根节点！"]
				),
			]);
		}

		if (pageWidgets.length === 1) {
			// 即只有一个根节点
			return v("div", [
				v(
					"div",
					{
						classes: [c.alert, c.alert_info, c.mx_auto, c.text_center, c.py_5, css.emptyPage],
						role: "alert",
					},
					[
						v("p", { classes: [c.mb_0] }, ["我是一张空页面，您看看需加点什么。"]),
						permission.canWrite &&
							v(
								"button",
								{ classes: [c.btn, c.btn_outline_primary, c.mt_3], onclick: () => onSwitchEditMode() },
								[w(FontAwesomeIcon, { icon: ["far", "edit"], classes: [c.me_1] }), "开始编辑"]
							),
					]
				),
			]);
		}

		const ideRepos = get(path("projectDependencies")) || [];
		return v("div", [renderPage(pageWidgets, ideRepos, store)]);
	}

	function tryRenderMobilePage() {
		if (pageWidgets.length === 0) {
			// 一个页面中至少会有一个 Page 部件。
			// 代码不应执行到此处。
			return v("div", [
				v(
					"div",
					{
						classes: [c.alert, c.alert_danger, c.mx_auto, c.text_center, c.py_5, css.emptyPage],
						role: "alert",
					},
					["页面中缺少根节点！"]
				),
			]);
		}

		const ideRepos = get(path("projectDependencies")) || [];
		return v("div", { classes: ["h-100"] }, [renderPage(pageWidgets, ideRepos, store)]);
	}
});
