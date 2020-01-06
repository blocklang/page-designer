import { create, tsx } from "@dojo/framework/core/vdom";
import { find } from "@dojo/framework/shim/array";
import store from "designer-core/store";
import { config } from "../../../../config";
import { activeWidgetProcess } from "../../../../processes/uiProcesses";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as c from "bootstrap-classes";
import * as css from "./Header.m.css";

export interface HeaderProperties {}

const factory = create({ store }).properties<HeaderProperties>();

export default factory(function Header({ properties, middleware: { store } }) {
	const {} = properties();
	const { get, path, executor } = store;
	const pageWidgets = get(path("pageModel", "widgets")) || [];
	if (pageWidgets.length === 0) {
		return <div classes={[css.root]}></div>;
	}

	const selectedWidgetIndex = get(path("selectedWidgetIndex"));
	const activeWidget = pageWidgets[selectedWidgetIndex];

	const focusWidgetPath = [];

	let currentWidget = activeWidget;
	let parentId = currentWidget.parentId;
	do {
		focusWidgetPath.unshift(currentWidget);

		parentId = currentWidget.parentId;

		currentWidget = find(pageWidgets, (widget) => {
			return widget.id === parentId;
		})!;
	} while (parentId !== config.rootWidgetParentId);
	const length = focusWidgetPath.length;

	return (
		<div classes={[css.root]}>
			<FontAwesomeIcon icon="arrows-alt" classes={[c.text_muted, c.ml_1]} />
			<nav classes={[c.d_inline_block]}>
				<ol classes={[c.breadcrumb, css.focusWidgetPath]}>
					{focusWidgetPath.map((item, index) => {
						if (index < length - 1) {
							return (
								<li key={`fwp-${item.id}`} classes={[c.breadcrumb_item, css.breadcrumbItem]}>
									<a
										href="#"
										onclick={(event: MouseEvent) => {
											const activeWidgetId = item.id;
											executor(activeWidgetProcess)({ activeWidgetId });
										}}
									>
										{item.widgetName}
									</a>
								</li>
							);
						} else {
							// 叶节点
							return (
								<li key={`fwp-${item.id}`} classes={[c.breadcrumb_item, css.breadcrumbItem, c.active]}>
									{item.widgetName}
								</li>
							);
						}
					})}
				</ol>
			</nav>
		</div>
	);
});
