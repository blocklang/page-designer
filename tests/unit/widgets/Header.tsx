const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import Header from "../../../src/widgets/Header";
import { Project, Path, Permission, User, EditMode } from "../../../src/interfaces";
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
			<Header project={project} permission={permission} pathes={pathes} onChangeEditMode={stub()} />
		));

		h.expect(() => (
			<div classes={[c.row, c.bg_light, c.d_flex, c.justify_content_between]}>
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
			<Header user={user} project={project} permission={permission} pathes={pathes} onChangeEditMode={stub()} />
		));

		h.expect(() => (
			<div classes={[c.row, c.bg_light, c.d_flex, c.justify_content_between]}>
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
			/>
		));

		h.expect(() => (
			<div classes={[c.row, c.bg_light, c.d_flex, c.justify_content_between]}>
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

	it("header when login user access, has write permission, in edit mode", () => {
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
		const h = harness(() => (
			<Header
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				editMode={editMode}
				onChangeEditMode={changeEditMode}
			/>
		));

		h.expect(() => (
			<div classes={[c.row, c.bg_light, c.d_flex, c.justify_content_between]}>
				<div>
					<a title="返回">
						<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
					</a>
					<span classes={[c.ml_1]}>tom/project/page1</span>
				</div>
				<div></div>
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
	});
});
