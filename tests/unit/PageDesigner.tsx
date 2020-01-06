const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import * as c from "bootstrap-classes";
import * as css from "../../src/PageDesigner.m.css";
import PageDesigner from "../../src/PageDesigner";
import Header from "../../src/widgets/Header";
import { User, Path, Page, Permission, RequestUrl, RouteName } from "../../src/interfaces";
import Preview from "../../src/widgets/preview";
import UIView from "../../src/widgets/edit/ui";
import BehaviorView from "../../src/widgets/edit/behavior";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import store from "designer-core/store";
import { Project, State } from "designer-core/interfaces";
import { replace } from "@dojo/framework/stores/state/operations";

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
	savePageModel: "",
	externalScriptAndCssWebsite: ""
};

const routes: RouteName = {
	profile: "a",
	parentGroup: "b"
};

describe("PageDesigner", () => {
	it("default properties", () => {
		const h = harness(() => (
			<PageDesigner
				user={user}
				project={project}
				permission={permission}
				page={page}
				pathes={pathes}
				urls={urls}
				routes={routes}
			/>
		));

		h.expect(() => (
			<div classes={[c.text_muted, c.text_center, c.mt_5]}>
				<div classes={[c.spinner_border]} role="status">
					<span classes={[c.sr_only]}>Loading...</span>
				</div>
			</div>
		));
	});

	it("ide repos has loaded but was empty", () => {
		const mockStore = createMockStoreMiddleware<State>();

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

		mockStore((path) => [replace(path("ideRepos"), [])]);

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
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onChangeEditMode={() => {}} />
				</div>
			</div>
		));
	});

	it("onChangeEditMode should be switch between edit and preview", () => {
		const mockStore = createMockStoreMiddleware<State>();

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

		mockStore((path) => [replace(path("ideRepos"), [])]);

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
					onGotoGroup={() => {}}
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
					onGotoGroup={() => {}}
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
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onChangeEditMode={() => {}} />
				</div>
			</div>
		));
	});

	it("onChangeViewMode should be switch between ui and behavior", () => {
		const mockStore = createMockStoreMiddleware<State>();

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

		mockStore((path) => [replace(path("ideRepos"), [])]);

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
					onGotoGroup={() => {}}
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
					onGotoGroup={() => {}}
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
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<UIView />
				</div>
			</div>
		));
	});
});
