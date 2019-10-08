import { create, tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { User, Project, Path, Permission, EditMode, ViewType, State } from "../interfaces";
import * as c from "bootstrap-classes";
import { DNode } from "@dojo/framework/core/interfaces";
import store from "../store";
import { savePageModelProcess, undoProcess, redoProcess } from "../processes/uiProcesses";
import { uiHistoryManager } from "../processes/utils";
import Store from "@dojo/framework/stores/Store";

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

const factory = create({ store }).properties<HeaderProperties>();

export default factory(function Header({ properties, middleware: { store } }) {
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

		centerBlock = (
			<div key="center" classes={[c.d_inline_flex, c.align_items_center]}>
				<div classes={[c.btn_group, c.btn_group_sm]} role="group" aria-label="视图">
					{switchViewActionButtons}
				</div>
				<div>
					<button
						key="saveButton"
						type="button"
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
						<span>保存</span>
					</button>
					<button
						key="undoButton"
						type="button"
						disabled={!canUndo}
						onclick={
							canUndo
								? () => {
										store.executor(undoProcess)({});
								  }
								: undefined
						}
					>
						<FontAwesomeIcon icon="undo" />
						<span>撤销</span>
					</button>
					<button
						key="redoButton"
						type="button"
						disabled={!canRedo}
						onclick={
							canRedo
								? () => {
										store.executor(redoProcess)({});
								  }
								: undefined
						}
					>
						<FontAwesomeIcon icon="redo" />
						<span>恢复</span>
					</button>
				</div>
			</div>
		);
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
			<div key="right">
				{switchEditModeBlock}
				{userBlock}
			</div>
		);
	}

	return (
		<div classes={[c.bg_light, c.d_flex, c.justify_content_between]}>
			{leftBlock}
			{centerBlock}
			{rightBlock}
		</div>
	);
});
