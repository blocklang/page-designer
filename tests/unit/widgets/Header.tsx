const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import Header from "../../../src/widgets/Header";
import { Project, Path, Permission, User, EditMode, ViewType } from "../../../src/interfaces";
import * as c from "bootstrap-classes";

import { stub } from "sinon";
import { assert } from "chai";

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
				<div>
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
				<div>
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
					<span classes={[c.ml_1]}>tom/project/page1</span>
				</div>
				<div>
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
				<div>
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
					<span classes={[c.ml_1]}>tom/project/page1</span>
				</div>
				<div>
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
				<div>
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
					<span classes={[c.ml_1]}>page1</span>
				</div>
				<div classes={[c.d_inline_flex]}>
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
						<button key="saveButton" type="button" disabled={true}>
							<FontAwesomeIcon icon={["far", "save"]} />
							<span>保存</span>
						</button>
						<button key="undoButton" type="button" disabled={true}>
							<FontAwesomeIcon icon="undo" />
							<span>撤销</span>
						</button>
						<button key="redoButton" type="button" disabled={true}>
							<FontAwesomeIcon icon="redo" />
							<span>恢复</span>
						</button>
					</div>
				</div>
				<div>
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
				<div>
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
					<span classes={[c.ml_1]}>page1</span>
				</div>
				<div classes={[c.d_inline_flex]}>
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
						<button key="saveButton" type="button" disabled={true}>
							<FontAwesomeIcon icon={["far", "save"]} />
							<span>保存</span>
						</button>
						<button key="undoButton" type="button" disabled={true}>
							<FontAwesomeIcon icon="undo" />
							<span>撤销</span>
						</button>
						<button key="redoButton" type="button" disabled={true}>
							<FontAwesomeIcon icon="redo" />
							<span>恢复</span>
						</button>
					</div>
				</div>
				<div>
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
});