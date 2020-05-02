import { create, tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { Project, State, EditMode, PageViewType } from "designer-core/interfaces";
import { User, Path, Permission } from "../interfaces";
import { DNode } from "@dojo/framework/core/interfaces";
import store from "designer-core/store";
import { invalidator } from "@dojo/framework/core/vdom";
import { savePageModelProcess, undoProcess, redoProcess } from "../processes/uiProcesses";
import { uiHistoryManager } from "../processes/utils";
import Store from "@dojo/framework/stores/Store";
import Link from "@dojo/framework/routing/Link";
import { config } from "../config";

import * as css from "./Header.m.css";
import * as c from "bootstrap-classes";

export interface HeaderProperties {
	user?: User;
	permission: Permission;
	project: Project;
	pathes: Path[];
	editMode?: EditMode;
	activePageView?: PageViewType;
	onSwitchEditMode: () => void;
	onSwitchPageView: () => void;
	// FIXME: 当 dojo route 支持通配符后，去除此函数
	onGotoGroup?: (owner: string, project: string, parentPath: string) => void;
}

const factory = create({ store, invalidator }).properties<HeaderProperties>();

export default factory(function Header({ properties, middleware: { store, invalidator } }) {
	const {
		user,
		project,
		pathes,
		permission,
		editMode = "Preview",
		activePageView = "ui",
		onSwitchEditMode,
		onSwitchPageView,
		onGotoGroup,
	} = properties();

	let path;
	if (editMode === "Preview") {
		path = `${project.createUserName}/${project.name}/${pathes.map((item) => item.name).join("/")}`;
	} else {
		// 编辑模式下，只显示叶节点，为操作区腾出空间
		path = pathes[pathes.length - 1].name;
	}

	let gotoGroupNodes: DNode;
	if (pathes.length === 1) {
		gotoGroupNodes = (
			<Link
				title="到上级目录"
				to={config.routeParentGroup}
				params={{ owner: project.createUserName, project: project.name }}
			>
				<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
			</Link>
		);
	} else {
		const parentPath = pathes[pathes.length - 2].path.substring(1);
		gotoGroupNodes = (
			<a
				title="到上级目录"
				onclick={(event: MouseEvent) => {
					event.stopPropagation();
					event.preventDefault();
					onGotoGroup && onGotoGroup(project.createUserName, project.name, parentPath);
					return false;
				}}
				href={`/${project.createUserName}/${project.name}/groups/${parentPath}`}
			>
				<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
			</a>
		);
	}

	// 返回到分组，当前只支持存放在根目录下的
	const leftBlock = (
		<div key="left">
			{gotoGroupNodes}
			<span classes={[c.ml_1]}>{path}</span>
		</div>
	);

	let centerBlock = undefined;

	let switchViewActionButtons: DNode[] = [];
	if (activePageView === "ui") {
		switchViewActionButtons = [
			<button key="toUIViewButton" type="button" classes={[c.btn, c.btn_outline_secondary, c.active]}>
				界面
			</button>,
			<button
				key="toBehaviorViewButton"
				type="button"
				classes={[c.btn, c.btn_outline_secondary]}
				onclick={() => onSwitchPageView()}
			>
				交互
			</button>,
		];
	} else {
		switchViewActionButtons = [
			<button
				key="toUIViewButton"
				type="button"
				classes={[c.btn, c.btn_outline_secondary]}
				onclick={() => onSwitchPageView()}
			>
				界面
			</button>,
			<button key="toBehaviorViewButton" type="button" classes={[c.btn, c.btn_outline_secondary, c.active]}>
				交互
			</button>,
		];
	}

	if (editMode === "Edit") {
		// 因为没有为 dirty 设置默认值，所以这里多了一个判断
		const canSave = store.get(store.path("dirty")) || false;
		const canUndo = store.executor(((storeObject: Store<State>) => uiHistoryManager.canUndo(storeObject)) as any);
		const canRedo = store.executor(((storeObject: Store<State>) => uiHistoryManager.canRedo(storeObject)) as any);
		console.log("canRedo", canRedo);
		centerBlock = (
			<div key="center" classes={[c.d_inline_flex, c.align_items_center]}>
				<div classes={[c.btn_group, c.btn_group_sm]} role="group" aria-label="视图">
					{switchViewActionButtons}
				</div>
				<div classes={[c.ml_2]}>
					<button
						key="saveButton"
						type="button"
						classes={[css.btn, !canSave ? css.disabled : undefined]}
						disabled={!canSave}
						onclick={
							canSave
								? () => {
										store.executor(savePageModelProcess)({});
								  }
								: undefined
						}
					>
						<FontAwesomeIcon icon={["far", "save"]} />
						<span classes={[c.ml_1]}>保存</span>
					</button>
					<button
						key="undoButton"
						type="button"
						classes={[css.btn, !canUndo ? css.disabled : undefined]}
						disabled={!canUndo}
						onclick={
							canUndo
								? () => {
										store.executor(undoProcess)({});
										// 注意，必须要在部件中失效，才会每次都刷新 Header
										// 只使用 store 的 middleware 中使用 store.invalidate()，在一些情况下不刷页面
										invalidator();
								  }
								: undefined
						}
					>
						<FontAwesomeIcon icon="undo" />
						<span classes={[c.ml_1]}>撤销</span>
					</button>
					<button
						key="redoButton"
						type="button"
						classes={[css.btn, !canRedo ? css.disabled : undefined]}
						disabled={!canRedo}
						onclick={
							canRedo
								? () => {
										store.executor(redoProcess)({});
										// 注意，必须要在部件中失效，才会每次都刷新 Header
										// 只使用 store 的 middleware 中使用 store.invalidate()，在一些情况下不刷页面
										invalidator();
								  }
								: undefined
						}
					>
						<FontAwesomeIcon icon="redo" />
						<span classes={[c.ml_1]}>恢复</span>
					</button>
				</div>
			</div>
		);
	}

	const userBlock = user && (
		<span classes={[c.ml_2]}>
			<Link to={config.routeProfile} params={{ user: user.name }}>
				<img src={user.avatar} classes={[c.mr_1, css.avatar]} />
				<span>{user.name}</span>
			</Link>
		</span>
	);

	let switchEditModeBlock;
	if (permission.canWrite) {
		if (editMode === "Preview") {
			switchEditModeBlock = (
				<button type="button" classes={[css.btn]} key="toEditButton" onclick={() => onSwitchEditMode()}>
					<FontAwesomeIcon icon={["far", "edit"]} />
					<span classes={[c.ml_1]}>编辑</span>
				</button>
			);
		} else {
			switchEditModeBlock = (
				<button type="button" classes={[css.btn]} key="toPreviewButton" onclick={() => onSwitchEditMode()}>
					<FontAwesomeIcon icon={["far", "caret-square-right"]} />
					<span classes={[c.ml_1]}>预览</span>
				</button>
			);
		}
	} else {
		// show nothing
	}

	let rightBlock;
	if (userBlock || switchEditModeBlock) {
		rightBlock = (
			<div key="right">
				{switchEditModeBlock}
				{userBlock}
			</div>
		);
	}

	return (
		<div
			classes={[
				c.bg_light,
				c.d_flex,
				c.justify_content_between,
				c.align_items_center,
				c.p_2,
				c.position_fixed,
				css.root,
			]}
		>
			{leftBlock}
			{centerBlock}
			{rightBlock}
		</div>
	);
});
