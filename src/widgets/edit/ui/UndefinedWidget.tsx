import { create, tsx } from "@dojo/framework/core/vdom";
import { ComponentRepo, AttachedWidget } from "../../../interfaces";
import * as c from "bootstrap-classes";
import store from "../../../store";
import { removeUndefinedWidgetProcess } from "../../../processes/uiProcesses";

export interface UndefinedWidgetProperties {
	componentRepo?: ComponentRepo;
	widget: AttachedWidget;
}

const factory = create({ store }).properties<UndefinedWidgetProperties>();

export default factory(function UndefinedWidget({ properties, middleware: { store } }) {
	const { componentRepo, widget } = properties();
	const { executor } = store;

	return (
		<div>
			<div classes={[c.alert, c.alert_danger, c.text_center]} role="alert">
				<strong>BlockLang: </strong>
				{componentRepo === undefined
					? `没有找到 ${widget.widgetName} 部件所属的组件库信息!`
					: `${componentRepo.gitRepoWebsite}/${componentRepo.gitRepoOwner}/${componentRepo.gitRepoName} 的 ${componentRepo.version} 中不存在 ${widget.widgetName} 部件!`}
				<button
					type="button"
					classes={[c.close]}
					data-dismiss="alert"
					aria-label="删除"
					title="删除"
					onclick={() => {
						executor(removeUndefinedWidgetProcess)({ widgetId: widget.id });
					}}
				>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
		</div>
	);
});
