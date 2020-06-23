const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness/harness";
import { tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";
import Header from "../../../src/widgets/Header";
import { Path, Permission, User } from "../../../src/interfaces";
import * as c from "@blocklang/bootstrap-classes";
import { stub } from "sinon";
import { assert } from "chai";
import { Project, State, EditMode, PageViewType } from "@blocklang/designer-core/interfaces";
import store from "@blocklang/designer-core/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { replace } from "@dojo/framework/stores/state/operations";
import { savePageModelProcess, undoProcess, redoProcess } from "../../../src/processes/uiProcesses";
import { uiHistoryManager } from "../../../src/processes/utils";
import { afterEach } from "intern/lib/interfaces/bdd";
import { deepMixin } from "@dojo/framework/core/util";
import * as css from "../../../src/widgets/Header.m.css";
import Link from "@dojo/framework/routing/Link";

describe("Header", () => {
	const cachedUiHistoryManager = deepMixin({}, uiHistoryManager);

	afterEach(() => {
		uiHistoryManager.canUndo = cachedUiHistoryManager.canUndo;
		uiHistoryManager.canRedo = cachedUiHistoryManager.canRedo;
	});

	it("header when anonymous user access, has read permission", () => {
		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: false,
		};

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const h = harness(() => (
			<Header
				project={project}
				permission={permission}
				pathes={pathes}
				onSwitchEditMode={() => {}}
				onSwitchPageView={() => {}}
			/>
		));

		h.expect(() => (
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
				<div key="left">
					<Link title={"到上级目录"} params={{ owner: "tom", project: "project" }} to={""}>
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</Link>
					<span classes={[c.ml_1]}>tom/project/page1</span>
				</div>
			</div>
		));
	});

	it("header when login user access, has read permission", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: false,
		};

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				onSwitchEditMode={() => {}}
				onSwitchPageView={() => {}}
			/>
		));

		h.expect(() => (
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
				<div key="left">
					<Link title={"到上级目录"} params={{ owner: "tom", project: "project" }} to={""}>
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</Link>
					<span classes={[c.ml_1]}>tom/project/page1</span>
				</div>
				<div key="right">
					<span classes={[c.ml_2]}>
						<Link to={""} params={{ user: "jack" }}>
							<img src="url" classes={[c.mr_1, css.avatar]} />
							<span>jack</span>
						</Link>
					</span>
				</div>
			</div>
		));
	});

	it("header when login user access, has write permission, in preview mode", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const pathes: Path[] = [{ name: "page1", path: "page1" }];
		const switchEditModeStub = stub();
		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				onSwitchEditMode={switchEditModeStub}
				onSwitchPageView={() => {}}
			/>
		));

		h.expect(() => (
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
				<div key="left">
					<Link title={"到上级目录"} params={{ owner: "tom", project: "project" }} to={""}>
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</Link>
					<span classes={[c.ml_1]}>tom/project/page1</span>
				</div>
				<div key="right">
					<button type="button" key="toEditButton" classes={[css.btn]} onclick={() => {}}>
						<FontAwesomeIcon icon={["far", "edit"]} />
						<span classes={[c.ml_1]}>编辑</span>
					</button>
					<span classes={[c.ml_2]}>
						<Link to={""} params={{ user: "jack" }}>
							<img src="url" classes={[c.mr_1, css.avatar]} />
							<span>jack</span>
						</Link>
					</span>
				</div>
			</div>
		));

		h.trigger("@toEditButton", "onclick");
		assert.isTrue(switchEditModeStub.calledOnce);
	});

	it("header when login user access, has write permission, in edit mode and show ui view", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];
		const switchEditModeStub = stub();
		const switchPageViewStub = stub();
		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				editMode={editMode}
				onSwitchEditMode={switchEditModeStub}
				onSwitchPageView={switchPageViewStub}
			/>
		));

		h.expect(() => (
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
				<div key="left">
					<Link title={"到上级目录"} params={{ owner: "tom", project: "project" }} to={""}>
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</Link>
					<span classes={[c.ml_1]}>page1</span>
				</div>
				<div key="center" classes={[c.d_inline_flex, c.align_items_center]}>
					<div classes={[c.btn_group, c.btn_group_sm]} role="group" aria-label="视图">
						<button key="toUIViewButton" type="button" classes={[c.btn, c.btn_outline_secondary, c.active]}>
							界面
						</button>
						<button
							key="toBehaviorViewButton"
							type="button"
							classes={[c.btn, c.btn_outline_secondary]}
							onclick={() => {}}
						>
							交互
						</button>
					</div>
					<div classes={[c.ml_2]}>
						<button
							key="saveButton"
							type="button"
							classes={[css.btn, css.disabled]}
							disabled={true}
							onclick={undefined}
						>
							<FontAwesomeIcon icon={["far", "save"]} />
							<span classes={[c.ml_1]}>保存</span>
						</button>
						<button
							key="undoButton"
							type="button"
							classes={[css.btn, css.disabled]}
							disabled={true}
							onclick={undefined}
						>
							<FontAwesomeIcon icon="undo" />
							<span classes={[c.ml_1]}>撤销</span>
						</button>
						<button
							key="redoButton"
							type="button"
							classes={[css.btn, css.disabled]}
							disabled={true}
							onclick={undefined}
						>
							<FontAwesomeIcon icon="redo" />
							<span classes={[c.ml_1]}>恢复</span>
						</button>
					</div>
				</div>
				<div key="right">
					<button type="button" key="toPreviewButton" classes={[css.btn]} onclick={() => {}}>
						<FontAwesomeIcon icon={["far", "caret-square-right"]} />
						<span classes={[c.ml_1]}>预览</span>
					</button>
					<span classes={[c.ml_2]}>
						<Link to={""} params={{ user: "jack" }}>
							<img src="url" classes={[c.mr_1, css.avatar]} />
							<span>jack</span>
						</Link>
					</span>
				</div>
			</div>
		));

		h.trigger("@toPreviewButton", "onclick");
		assert.isTrue(switchEditModeStub.calledOnce);

		h.trigger("@toBehaviorViewButton", "onclick");
		assert.isTrue(switchPageViewStub.calledOnce);
	});

	it("header when login user access, has write permission, in edit mode and show behavior view", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";
		const viewType: PageViewType = "behavior";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];
		const switchEditModeStub = stub();
		const switchPageViewStub = stub();

		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				editMode={editMode}
				activePageView={viewType}
				onSwitchEditMode={switchEditModeStub}
				onSwitchPageView={switchPageViewStub}
			/>
		));

		h.expect(() => (
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
				<div key="left">
					<Link title={"到上级目录"} params={{ owner: "tom", project: "project" }} to={""}>
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</Link>
					<span classes={[c.ml_1]}>page1</span>
				</div>
				<div key="center" classes={[c.d_inline_flex, c.align_items_center]}>
					<div classes={[c.btn_group, c.btn_group_sm]} role="group" aria-label="视图">
						<button
							key="toUIViewButton"
							type="button"
							classes={[c.btn, c.btn_outline_secondary]}
							onclick={() => {}}
						>
							界面
						</button>
						<button
							key="toBehaviorViewButton"
							type="button"
							classes={[c.btn, c.btn_outline_secondary, c.active]}
						>
							交互
						</button>
					</div>
					<div classes={[c.ml_2]}>
						<button
							key="saveButton"
							type="button"
							classes={[css.btn, css.disabled]}
							disabled={true}
							onclick={undefined}
						>
							<FontAwesomeIcon icon={["far", "save"]} />
							<span classes={[c.ml_1]}>保存</span>
						</button>
						<button
							key="undoButton"
							type="button"
							classes={[css.btn, css.disabled]}
							disabled={true}
							onclick={undefined}
						>
							<FontAwesomeIcon icon="undo" />
							<span classes={[c.ml_1]}>撤销</span>
						</button>
						<button
							key="redoButton"
							type="button"
							classes={[css.btn, css.disabled]}
							disabled={true}
							onclick={undefined}
						>
							<FontAwesomeIcon icon="redo" />
							<span classes={[c.ml_1]}>恢复</span>
						</button>
					</div>
				</div>
				<div key="right">
					<button key="toPreviewButton" type="button" classes={[css.btn]} onclick={() => {}}>
						<FontAwesomeIcon icon={["far", "caret-square-right"]} />
						<span classes={[c.ml_1]}>预览</span>
					</button>
					<span classes={[c.ml_2]}>
						<Link to={""} params={{ user: "jack" }}>
							<img src="url" classes={[c.mr_1, css.avatar]} />
							<span>jack</span>
						</Link>
					</span>
				</div>
			</div>
		));

		h.trigger("@toPreviewButton", "onclick");
		assert.isTrue(switchEditModeStub.calledOnce);

		h.trigger("@toUIViewButton", "onclick");
		assert.isTrue(switchPageViewStub.calledOnce);
	});

	// 1. 根据 dirty 状态修改按钮的状态
	it("save button, active save button if dirty is true", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(
			() => (
				<Header
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					editMode={editMode}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		mockStore((path) => [replace(path("dirty"), true)]);

		h.expectPartial("@saveButton", () => (
			<button key="saveButton" type="button" classes={[css.btn, undefined]} disabled={false} onclick={() => {}}>
				<FontAwesomeIcon icon={["far", "save"]} />
				<span classes={[c.ml_1]}>保存</span>
			</button>
		));
	});

	it("save button, disable save button if dirty is false", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(
			() => (
				<Header
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					editMode={editMode}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		mockStore((path) => [replace(path("dirty"), false)]);

		h.expectPartial("@saveButton", () => (
			<button
				key="saveButton"
				type="button"
				classes={[css.btn, css.disabled]}
				disabled={true}
				onclick={undefined}
			>
				<FontAwesomeIcon icon={["far", "save"]} />
				<span classes={[c.ml_1]}>保存</span>
			</button>
		));
	});

	// 2. 触发保存按钮
	it("save button, trigger save button", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const savePageModelProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[savePageModelProcess, savePageModelProcessStub]]);
		const h = harness(
			() => (
				<Header
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					editMode={editMode}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		mockStore((path) => [replace(path("dirty"), true)]);

		h.trigger("@saveButton", "onclick");
		assert.isTrue(savePageModelProcessStub.calledOnce);
	});

	it("undo button - disable undo button if historyManager canUndo return false", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				editMode={editMode}
				onSwitchEditMode={() => {}}
				onSwitchPageView={() => {}}
			/>
		));

		// 注意，此处不能使用 mockStore，因为需要调用 widget 中的 store.executor
		uiHistoryManager.canUndo = () => false;

		h.expectPartial("@undoButton", () => (
			<button
				key="undoButton"
				type="button"
				classes={[css.btn, css.disabled]}
				disabled={true}
				onclick={undefined}
			>
				<FontAwesomeIcon icon="undo" />
				<span classes={[c.ml_1]}>撤销</span>
			</button>
		));
	});

	it("undo button - active undo button if historyManager canUndo return true", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				editMode={editMode}
				onSwitchEditMode={() => {}}
				onSwitchPageView={() => {}}
			/>
		));

		// 注意，此处不能使用 mockStore，因为需要调用 widget 中的 store.executor
		uiHistoryManager.canUndo = () => true;

		h.expectPartial("@undoButton", () => (
			<button key="undoButton" type="button" classes={[css.btn, undefined]} disabled={false} onclick={() => {}}>
				<FontAwesomeIcon icon="undo" />
				<span classes={[c.ml_1]}>撤销</span>
			</button>
		));
	});

	it("undo button - trigger undo button", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const undoProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[undoProcess, undoProcessStub]]);
		const h = harness(
			() => (
				<Header
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					editMode={editMode}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		h.trigger("@undoButton", "onclick");
		assert.isTrue(undoProcessStub.calledOnce);
	});

	it("redo button - disable redo button if historyManager canRedo return false", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				editMode={editMode}
				onSwitchEditMode={() => {}}
				onSwitchPageView={() => {}}
			/>
		));

		// 注意，此处不能使用 mockStore，因为需要调用 widget 中的 store.executor
		uiHistoryManager.canRedo = () => false;

		h.expectPartial("@redoButton", () => (
			<button
				key="redoButton"
				type="button"
				classes={[css.btn, css.disabled]}
				disabled={true}
				onclick={undefined}
			>
				<FontAwesomeIcon icon="redo" />
				<span classes={[c.ml_1]}>恢复</span>
			</button>
		));
	});

	it("redo button - active redo button if historyManager canRedo return true", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				editMode={editMode}
				onSwitchEditMode={() => {}}
				onSwitchPageView={() => {}}
			/>
		));

		// 注意，此处不能使用 mockStore，因为需要调用 widget 中的 store.executor
		uiHistoryManager.canRedo = () => true;

		h.expectPartial("@redoButton", () => (
			<button key="redoButton" type="button" classes={[css.btn, undefined]} disabled={false} onclick={() => {}}>
				<FontAwesomeIcon icon="redo" />
				<span classes={[c.ml_1]}>恢复</span>
			</button>
		));
	});

	it("redo button - trigger redo button", () => {
		const user: User = {
			name: "jack",
			avatar: "url",
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom",
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const redoProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[redoProcess, redoProcessStub]]);
		const h = harness(
			() => (
				<Header
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					editMode={editMode}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		h.trigger("@redoButton", "onclick");
		assert.isTrue(redoProcessStub.calledOnce);
	});
});
