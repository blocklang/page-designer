import { create, tsx } from "@dojo/framework/core/vdom";

import store from "../../../../store";
import * as c from "bootstrap-classes";
import { WidgetRepo } from "../../../../interfaces";
import { getWidgetsProcess } from "../../../../processes/widgetProcesses";

export interface WidgetsTabProperties {}

const factory = create({ store }).properties<WidgetsTabProperties>();

export default factory(function WidgetsTab({ properties, middleware: { store } }) {
	const {} = properties();
	const { path, get, executor } = store;

	const widgetRepos = get(path("widgetRepos"));

	if (!widgetRepos) {
		executor(getWidgetsProcess)({});
	}

	return (
		<div>
			<div classes={[c.m_1]}>
				<input classes={[c.form_control]} placeholder="搜索部件" />
			</div>
			<div>
				{widgetRepos ? (
					widgetRepos.length === 0 ? (
						<p classes={[c.text_muted, c.text_center]}>
							请在 <strong>DEPENDENCE.json</strong> 中添加部件仓库
						</p>
					) : (
						"显示部件"
					)
				) : (
					"加载中"
				)}
			</div>
		</div>
	);
});
