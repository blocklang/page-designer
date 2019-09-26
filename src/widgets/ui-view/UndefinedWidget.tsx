import { create, tsx } from "@dojo/framework/core/vdom";
import { ComponentRepo, Widget } from "../../interfaces";
import * as c from "bootstrap-classes";

export interface UndefinedWidgetProperties {
	componentRepo?: ComponentRepo;
	widget: Widget;
}

const factory = create().properties<UndefinedWidgetProperties>();

export default factory(function UndefinedWidget({ properties }) {
	const { componentRepo, widget } = properties();

	return (
		<div>
			<div classes={[c.alert, c.alert_danger]} role="alert">
				{componentRepo === undefined
					? `没有找到 ${widget.widgetName} 部件所属的组件库信息!`
					: `${componentRepo.gitRepoWebsite}/${componentRepo.gitRepoOwner}/${componentRepo.gitRepoName} 的 ${componentRepo.version} 中不存在 ${widget.widgetName} 部件!`}
			</div>
		</div>
	);
});
