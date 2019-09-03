import { create, tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { User, Project, Path, Permission, EditMode } from "../interfaces";
import * as c from "bootstrap-classes";

export interface HeaderProperties {
	user?: User;
	permission: Permission;
	project: Project;
	pathes: Path[];
	editMode?: EditMode;
	onChangeEditMode: () => void;
}

const factory = create().properties<HeaderProperties>();

export default factory(function Header({ properties }) {
	const { user, project, pathes, permission, editMode = "Preview", onChangeEditMode } = properties();

	const path = `${project.createUserName}/${project.name}/${pathes.map((item) => item.name).join("/")}`;

	const leftBlock = (
		<div>
			<a title="返回">
				<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
			</a>
			<span classes={[c.ml_1]}>{path}</span>
		</div>
	);

	let centerBlock = undefined;
	if (editMode === "Edit") {
		centerBlock = <div></div>;
	}

	const userBlock =
		user !== undefined ? (
			<span>
				<img src={user.avatar} />
				<span>{user.name}</span>
			</span>
		) : (
			undefined
		);

	let switchEditModeBlock;
	if (permission.canWrite) {
		if (editMode === "Preview") {
			switchEditModeBlock = (
				<button key="toEditButton" onclick={() => onChangeEditMode()}>
					<FontAwesomeIcon icon={["far", "edit"]} />
					编辑
				</button>
			);
		} else {
			switchEditModeBlock = (
				<button key="toPreviewButton" onclick={() => onChangeEditMode()}>
					<FontAwesomeIcon icon={["far", "caret-square-right"]} />
					浏览
				</button>
			);
		}
	} else {
		// show nothing
	}

	let rightBlock;
	if (userBlock || switchEditModeBlock) {
		rightBlock = (
			<div>
				{switchEditModeBlock}
				{userBlock}
			</div>
		);
	}

	return (
		<div classes={[c.row, c.bg_light, c.d_flex, c.justify_content_between]}>
			{leftBlock}
			{centerBlock}
			{rightBlock}
		</div>
	);
});
