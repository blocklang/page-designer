const { describe, it, beforeEach } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import * as c from "bootstrap-classes";
import * as css from "../../src/PageDesigner.m.css";
import PageDesigner from "../../src/PageDesigner";
import Header from "../../src/widgets/Header";
import { User, Project, Path, Page, Permission, RequestUrl, State, RouteName } from "../../src/interfaces";
import Preview from "../../src/widgets/preview";
import UIView from "../../src/widgets/edit/ui";
import BehaviorView from "../../src/widgets/edit/behavior";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import store from "../../src/store";

// login user
const user: User = {
	name: "jack",
	avatar: "url"
};

const project: Project = {
	id: 1,
	name: "project",
	createUserName: "lucy"
};

const permission: Permission = {
	canRead: true,
	canWrite: false
};

const page: Page = {
	id: 2,
	key: "page1",
	name: "页面1",
	appType: "01"
};

const pathes: Path[] = [{ name: "page1", path: "page1" }];

const urls: RequestUrl = {
	fetchApiRepoWidgets: "",
	fetchIdeDependenceInfos: "",
	fetchPageModel: "",
	externalScriptAndCssWebsite: ""
};

const routes: RouteName = {
	profile: "a",
	parentGroup: "b"
};

describe("PageDesigner", () => {
	let mockStore: any;
	beforeEach(() => {
		mockStore = createMockStoreMiddleware<State>();
	});

	it("default properties", () => {
		const h = harness(
			() => (
				<PageDesigner
					user={user}
					project={project}
					permission={permission}
					page={page}
					pathes={pathes}
					urls={urls}
					routes={routes}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Preview"
					activeView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onChangeEditMode={() => {}} />
				</div>
			</div>
		));
	});

	it("onChangeEditMode should be switch between edit and preview", () => {
		const h = harness(
			() => (
				<PageDesigner
					user={user}
					project={project}
					permission={permission}
					page={page}
					pathes={pathes}
					urls={urls}
					routes={routes}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Preview"
					activeView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onChangeEditMode={() => {}} />
				</div>
			</div>
		));

		// 切换到编辑模式
		h.trigger("@header", "onChangeEditMode");
		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Edit"
					activeView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
				<div classes={[css.container]}>
					<UIView />
				</div>
			</div>
		));

		// 切换回浏览模式
		h.trigger("@header", "onChangeEditMode");
		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Preview"
					activeView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onChangeEditMode={() => {}} />
				</div>
			</div>
		));
	});

	it("onChangeViewMode should be switch between ui and behavior", () => {
		const h = harness(
			() => (
				<PageDesigner
					user={user}
					project={project}
					permission={permission}
					page={page}
					pathes={pathes}
					urls={urls}
					routes={routes}
				/>
			),
			{ middleware: [[store, mockStore]] }
		);

		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Preview"
					activeView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onChangeEditMode={() => {}} />
				</div>
			</div>
		));

		// 切换到编辑模式
		h.trigger("@header", "onChangeEditMode");
		// 切换到交互视图
		h.trigger("@header", "onChangeView");
		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Edit"
					activeView="behavior"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
				<div classes={[css.container]}>
					<BehaviorView />
				</div>
			</div>
		));

		// 切换回 UI 视图
		h.trigger("@header", "onChangeView");
		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Edit"
					activeView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onChangeEditMode={() => {}}
					onChangeView={() => {}}
				/>
				<div classes={[css.container]}>
					<UIView />
				</div>
			</div>
		));
	});
});
