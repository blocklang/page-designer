const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import Header from "../../../src/widgets/Header";
import { Project, Path, Permission, User, EditMode, ViewType, State } from "../../../src/interfaces";
import * as c from "bootstrap-classes";

import { stub } from "sinon";
import { assert } from "chai";
import store from "../../../src/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { replace } from "@dojo/framework/stores/state/operations";
import { savePageModelProcess } from "../../../src/processes/uiProcesses";

describe("Header", () => {
	it("header when anonymous user access, has read permission", () => {
		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom"
		};

		const permission: Permission = {
			canRead: true,
			canWrite: false
		};

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const h = harness(() => (
			<Header
				project={project}
				permission={permission}
				pathes={pathes}
				onChangeEditMode={() => {}}
				onChangeView={() => {}}
			/>
		));

		h.expect(() => (
			<div classes={[c.bg_light, c.d_flex, c.justify_content_between]}>
				<div key="left">
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
					<span classes={[c.ml_1]}>tom/project/page1</span>
				</div>
			</div>
		));
	});

	it("header when login user access, has read permission", () => {
		const user: User = {
			name: "jack",
			avatar: "url"
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom"
		};

		const permission: Permission = {
			canRead: true,
			canWrite: false
		};

		const pathes: Path[] = [{ name: "page1", path: "page1" }];

		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				onChangeEditMode={() => {}}
				onChangeView={() => {}}
			/>
		));

		h.expect(() => (
			<div classes={[c.bg_light, c.d_flex, c.justify_content_between]}>
				<div key="left">
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
					<span classes={[c.ml_1]}>tom/project/page1</span>
				</div>
				<div key="right">
					<span>
						<img src="url" />
						<span>jack</span>
					</span>
				</div>
			</div>
		));
	});

	it("header when login user access, has write permission, in preview mode", () => {
		const user: User = {
			name: "jack",
			avatar: "url"
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom"
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true
		};

		const pathes: Path[] = [{ name: "page1", path: "page1" }];
		const changeEditMode = stub();
		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				onChangeEditMode={changeEditMode}
				onChangeView={() => {}}
			/>
		));

		h.expect(() => (
			<div classes={[c.bg_light, c.d_flex, c.justify_content_between]}>
				<div key="left">
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
					<span classes={[c.ml_1]}>tom/project/page1</span>
				</div>
				<div key="right">
					<button key="toEditButton" onclick={() => {}}>
						<FontAwesomeIcon icon={["far", "edit"]} />
						编辑
					</button>
					<span>
						<img src="url" />
						<span>jack</span>
					</span>
				</div>
			</div>
		));

		h.trigger("@toEditButton", "onclick");
		assert.isTrue(changeEditMode.calledOnce);
	});

	it("header when login user access, has write permission, in edit mode and show ui view", () => {
		const user: User = {
			name: "jack",
			avatar: "url"
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom"
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true
		};

		const editMode: EditMode = "Edit";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];
		const changeEditMode = stub();
		const changeView = stub();
		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				editMode={editMode}
				onChangeEditMode={changeEditMode}
				onChangeView={changeView}
			/>
		));

		h.expect(() => (
			<div classes={[c.bg_light, c.d_flex, c.justify_content_between]}>
				<div key="left">
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
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
					<div>
						<button key="saveButton" type="button" disabled={true} onclick={undefined}>
							<FontAwesomeIcon icon={["far", "save"]} />
							<span>保存</span>
						</button>
						<button key="undoButton" type="button" disabled={true} onclick={undefined}>
							<FontAwesomeIcon icon="undo" />
							<span>撤销</span>
						</button>
						<button key="redoButton" type="button" disabled={true} onclick={undefined}>
							<FontAwesomeIcon icon="redo" />
							<span>恢复</span>
						</button>
					</div>
				</div>
				<div key="right">
					<button key="toPreviewButton" onclick={() => {}}>
						<FontAwesomeIcon icon={["far", "caret-square-right"]} />
						浏览
					</button>
					<span>
						<img src="url" />
						<span>jack</span>
					</span>
				</div>
			</div>
		));

		h.trigger("@toPreviewButton", "onclick");
		assert.isTrue(changeEditMode.calledOnce);

		h.trigger("@toBehaviorViewButton", "onclick");
		assert.isTrue(changeView.calledOnce);
	});

	it("header when login user access, has write permission, in edit mode and show behavior view", () => {
		const user: User = {
			name: "jack",
			avatar: "url"
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom"
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true
		};

		const editMode: EditMode = "Edit";
		const viewType: ViewType = "behavior";

		const pathes: Path[] = [{ name: "page1", path: "page1" }];
		const changeEditMode = stub();
		const changeView = stub();

		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				editMode={editMode}
				activeView={viewType}
				onChangeEditMode={changeEditMode}
				onChangeView={changeView}
			/>
		));

		h.expect(() => (
			<div classes={[c.bg_light, c.d_flex, c.justify_content_between]}>
				<div key="left">
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
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
					<div>
						<button key="saveButton" type="button" disabled={true} onclick={undefined}>
							<FontAwesomeIcon icon={["far", "save"]} />
							<span>保存</span>
						</button>
						<button key="undoButton" type="button" disabled={true} onclick={undefined}>
							<FontAwesomeIcon icon="undo" />
							<span>撤销</span>
						</button>
						<button key="redoButton" type="button" disabled={true} onclick={undefined}>
							<FontAwesomeIcon icon="redo" />
							<span>恢复</span>
						</button>
					</div>
				</div>
				<div key="right">
					<button key="toPreviewButton" onclick={() => {}}>
						<FontAwesomeIcon icon={["far", "caret-square-right"]} />
						浏览
					</button>
					<span>
						<img src="url" />
						<span>jack</span>
					</span>
				</div>
			</div>
		));

		h.trigger("@toPreviewButton", "onclick");
		assert.isTrue(changeEditMode.calledOnce);

		h.trigger("@toUIViewButton", "onclick");
		assert.isTrue(changeView.calledOnce);
	});

	// 1. 根据 dirty 状态修改按钮的状态
	it("save button, active save button if dirty is true", () => {
		const user: User = {
			name: "jack",
			avatar: "url"
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom"
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true
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
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		mockStore((path) => [replace(path("dirty"), true)]);

		h.expectPartial("@saveButton", () => (
			<button key="saveButton" type="button" disabled={false} onclick={() => {}}>
				<FontAwesomeIcon icon={["far", "save"]} />
				<span>保存</span>
			</button>
		));
	});

	it("save button, disable save button if dirty is false", () => {
		const user: User = {
			name: "jack",
			avatar: "url"
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom"
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true
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
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		mockStore((path) => [replace(path("dirty"), false)]);

		h.expectPartial("@saveButton", () => (
			<button key="saveButton" type="button" disabled={true} onclick={undefined}>
				<FontAwesomeIcon icon={["far", "save"]} />
				<span>保存</span>
			</button>
		));
	});

	// 2. 触发保存按钮
	it("save button, trigger save button", () => {
		const user: User = {
			name: "jack",
			avatar: "url"
		};

		const project: Project = {
			id: 1,
			name: "project",
			createUserName: "tom"
		};

		const permission: Permission = {
			canRead: true,
			canWrite: true
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
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		mockStore((path) => [replace(path("dirty"), true)]);

		h.trigger("@saveButton", "onclick");
		assert.isTrue(savePageModelProcessStub.calledOnce);
	});

	// TODO:
	// undo button, active undo button if history manager can undo
	// 因为在测试用例中无法为 store 设置值，所以无法判断 HistoryManager 的 canUndo
});
