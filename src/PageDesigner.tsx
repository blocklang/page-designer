import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";

import * as css from "./styles/PageDesigner.m.css";
import * as c from "bootstrap-classes";
import Header from "./widgets/Header";
import { User, Project, Page, Path, Permission, EditMode, ViewType, RequestUrl } from "./interfaces";
import Preview from "./widgets/preview";
import UIView from "./widgets/ui-view";
import BehaviorView from "./widgets/behavior-view";
import { config } from "./config";

export interface PageDesignerProperties {
	user?: User; // 如果是匿名用户，则值为 null
	project: Project;
	permission: Permission;
	page: Page;
	pathes: Path[];
	urls: RequestUrl;
}

const factory = create({ icache }).properties<PageDesignerProperties>();

export default factory(function PageDesigner({ properties, middleware: { icache } }) {
	const { user, project, permission, pathes, urls } = properties();

	config.fetchApiRepoWidgetsUrl = urls.fetchApiRepoWidgets;

	let editMode = icache.getOrSet<EditMode>("editMode", "Preview");
	let activeView = icache.getOrSet<ViewType>("activeView", "ui");
	return (
		<div classes={[c.container_fluid, css.root]}>
			<Header
				key="header"
				user={user}
				permission={permission}
				project={project}
				pathes={pathes}
				editMode={editMode}
				activeView={activeView}
				onChangeEditMode={() => {
					if (editMode === "Preview") {
						editMode = "Edit";
					} else {
						editMode = "Preview";
					}
					icache.set("editMode", editMode);
				}}
				onChangeView={() => {
					if (activeView === "ui") {
						activeView = "behavior";
					} else {
						activeView = "ui";
					}
					icache.set("activeView", activeView);
				}}
			/>
			{editMode === "Preview" ? <Preview /> : activeView === "ui" ? <UIView /> : <BehaviorView />}
		</div>
	);
});
