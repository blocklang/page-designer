import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";

import * as css from "./styles/PageDesigner.m.css";

import Header from "./widgets/Header";
import { User, Project, Page, Path, Permission, EditMode } from "./interfaces";

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
	return (
		<div classes={[css.root]}>
			<Header
				user={user}
				permission={permission}
				project={project}
				pathes={pathes}
				editMode={editMode}
				onChangeEditMode={() => {
					if (editMode === "Preview") {
						editMode = "Edit";
					} else {
						editMode = "Preview";
					}
					icache.set("editMode", editMode);
				}}
			/>
		</div>
	);
});
