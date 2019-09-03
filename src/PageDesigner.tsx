import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";

import * as css from "./styles/PageDesigner.m.css";
import * as c from "bootstrap-classes";
import Header from "./widgets/Header";
import { User, Project, Page, Path, Permission, EditMode, ViewType } from "./interfaces";

export interface PageDesignerProperties {
	user?: User; // 如果是匿名用户，则值为 null
	project: Project;
	permission: Permission;
	page: Page;
	pathes: Path[];
}

const factory = create({ icache }).properties<PageDesignerProperties>();

export default factory(function PageDesigner({ properties, middleware: { icache } }) {
	const { user, project, permission, pathes } = properties();

	let editMode = icache.getOrSet<EditMode>("editMode", "Preview");
	let activeView = icache.getOrSet<ViewType>("activeView", "ui");
	return (
		<div classes={[c.container_fluid, css.root]}>
			<Header
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
		</div>
	);
});
