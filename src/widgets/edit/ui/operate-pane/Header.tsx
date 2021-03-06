import { create, tsx } from "@dojo/framework/core/vdom";
import store from "@blocklang/designer-core/store";
import { activeWidgetProcess } from "../../../../processes/uiProcesses";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";
import * as c from "@blocklang/bootstrap-classes";
import * as css from "./Header.m.css";
import { getNodePath } from "@blocklang/designer-core/utils/treeUtil";

const factory = create({ store }).properties();

export default factory(function Header({ middleware: { store } }) {
	const { get, path, executor } = store;
	const pageWidgets = get(path("pageModel", "widgets")) || [];
	if (pageWidgets.length === 0) {
		return <div classes={[css.root]}></div>;
	}

	const selectedWidgetIndex = get(path("selectedWidgetIndex"));
	const activeWidget = pageWidgets[selectedWidgetIndex];
	const nodePath = getNodePath(pageWidgets, selectedWidgetIndex);
	const length = nodePath.length;

	return (
		<div classes={[css.root]}>
			<FontAwesomeIcon icon="arrows-alt" classes={[c.text_muted, c.ms_1]} />
			<nav classes={[c.d_inline_block]}>
				<ol classes={[c.breadcrumb, css.focusWidgetPath]}>
					{nodePath.map((item, index) => {
						if (index === length - 1) {
							// 最后一个节点
							return (
								<li
									key={`fwp-${activeWidget.id}`}
									classes={[c.breadcrumb_item, css.breadcrumbItem, c.active]}
								>
									{item.index === -1
										? item.node.widgetName
										: `[${item.index}]${item.node.widgetName}`}
								</li>
							);
						}
						return (
							<li key={`fwp-${item.node.id}`} classes={[c.breadcrumb_item, css.breadcrumbItem]}>
								<a
									href="#"
									onclick={(): void => {
										const activeWidgetId = item.node.id;
										executor(activeWidgetProcess)({ activeWidgetId });
									}}
								>
									{item.index === -1
										? item.node.widgetName
										: `[${item.index}]${item.node.widgetName}`}
								</a>
							</li>
						);
					})}
				</ol>
			</nav>
		</div>
	);
});
