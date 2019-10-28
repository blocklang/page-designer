import { create, tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { User, Project, Path, Permission, EditMode, ViewType, State } from "../interfaces";
import * as c from "bootstrap-classes";
import { DNode } from "@dojo/framework/core/interfaces";
import store from "../store";
import { invalidator } from "@dojo/framework/core/vdom";
import { savePageModelProcess, undoProcess, redoProcess } from "../processes/uiProcesses";
import { uiHistoryManager } from "../processes/utils";
import Store from "@dojo/framework/stores/Store";
import * as css from "./Header.m.css";

export interface HeaderProperties {
	user?: User;
	permission: Permission;
	project: Project;
	pathes: Path[];
	editMode?: EditMode;
	activeView?: ViewType;
	onChangeEditMode: () => void;
	onChangeView: () => void;
}

const factory = create({ store, invalidator }).properties<HeaderProperties>();

export default factory(function Header({ properties, middleware: { store, invalidator } }) {
	const {
		user,
		project,
		pathes,
		permission,
		editMode = "Preview",
		activeView = "ui",
		onChangeEditMode,
		onChangeView
	} = properties();

	let path;
	if (editMode === "Preview") {
		path = `${project.createUserName}/${project.name}/${pathes.map((item) => item.name).join("/")}`;
	} else {
		// 编辑模式下，只显示叶节点，为操作区腾出空间
		path = pathes[pathes.length - 1].name;
	}

	const leftBlock = (
		<div key="left">
			<a title="返回">
				<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
			</a>
			<span classes={[c.ml_1]}>{path}</span>
		</div>
	);

	let centerBlock = undefined;

	let switchViewActionButtons: DNode[] = [];
	if (activeView === "ui") {
		switchViewActionButtons = [
			<button key="toUIViewButton" type="button" classes={[c.btn, c.btn_outline_secondary, c.active]}>
				界面
			</button>,
			<button
				key="toBehaviorViewButton"
				type="button"
				classes={[c.btn, c.btn_outline_secondary]}
				onclick={() => onChangeView()}
			>
				交互
			</button>
		];
	} else {
		switchViewActionButtons = [
			<button
				key="toUIViewButton"
				type="button"
				classes={[c.btn, c.btn_outline_secondary]}
				onclick={() => onChangeView()}
			>
				界面
			</button>,
			<button key="toBehaviorViewButton" type="button" classes={[c.btn, c.btn_outline_secondary, c.active]}>
				交互
			</button>
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
			<img src={user.avatar} />
			<span>{user.name}</span>
		</span>
	);

	let switchEditModeBlock;
	if (permission.canWrite) {
		if (editMode === "Preview") {
			switchEditModeBlock = (
				<button type="button" classes={[css.btn]} key="toEditButton" onclick={() => onChangeEditMode()}>
					<FontAwesomeIcon icon={["far", "edit"]} />
					<span classes={[c.ml_1]}>编辑</span>
				</button>
			);
		} else {
			switchEditModeBlock = (
				<button type="button" classes={[css.btn]} key="toPreviewButton" onclick={() => onChangeEditMode()}>
					<FontAwesomeIcon icon={["far", "caret-square-right"]} />
					<span classes={[c.ml_1]}>浏览</span>
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
				css.root
			]}
		>
			{leftBlock}
			{centerBlock}
			{rightBlock}
		</div>
	);
});
