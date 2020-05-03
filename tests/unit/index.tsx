const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import * as c from "bootstrap-classes";
import * as css from "../../src/index.m.css";
import PageDesigner from "../../src";
import Header from "../../src/widgets/Header";
import { User, Path, Page, Permission, RequestUrl, RouteName } from "../../src/interfaces";
import Preview from "../../src/widgets/preview";
import UIView from "../../src/widgets/edit/ui";
import BehaviorView from "../../src/widgets/edit/behavior";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import store from "@blocklang/designer-core/store";
import { Project, State } from "@blocklang/designer-core/interfaces";
import { replace } from "@dojo/framework/stores/state/operations";
import { switchEditModeProcess, switchPageViewTypeProcess } from "../../src/processes/designerProcesses";
import { stub } from "sinon";

// login user
const user: User = {
	name: "jack",
	avatar: "url",
};

const project: Project = {
	id: 1,
	name: "project",
	createUserName: "lucy",
};

const permission: Permission = {
	canRead: true,
	canWrite: false,
};

const page: Page = {
	id: 2,
	key: "page1",
	name: "页面1",
	appType: "01",
};

const pathes: Path[] = [{ name: "page1", path: "page1" }];

const urls: RequestUrl = {
	fetchApiRepoWidgets: "",
	fetchApiRepoServices: "",
	fetchApiRepoFunctions: "",
	fetchIdeDependenceInfos: "",
	fetchPageModel: "",
	savePageModel: "",
	externalScriptAndCssWebsite: "",
};

const routes: RouteName = {
	profile: "a",
	parentGroup: "b",
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

		mockStore((path) => [replace(path("projectDependencies"), [])]);

		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Preview"
					activePageView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onSwitchEditMode={() => {}} />
				</div>
			</div>
		));
	});

	it("onSwitchEditMode should be switch between edit and preview", () => {
		const switchEditModeProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[switchEditModeProcess, switchEditModeProcessStub]]);

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

		mockStore((path) => [replace(path("projectDependencies"), [])]);

		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Preview"
					activePageView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onSwitchEditMode={() => {}} />
				</div>
			</div>
		));

		// 切换到编辑模式
		h.trigger("@header", "onSwitchEditMode");
		assert.isTrue(switchEditModeProcessStub.calledOnce);

		// 实际修改 store 中的数据
		mockStore((path) => [replace(path("paneLayout", "editMode"), "Edit")]);
		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Edit"
					activePageView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<UIView />
				</div>
			</div>
		));

		// 切换回预览模式
		h.trigger("@header", "onSwitchEditMode");
		assert.isTrue(switchEditModeProcessStub.calledTwice);

		// 实际修改 store 中的数据
		mockStore((path) => [replace(path("paneLayout", "editMode"), "Preview")]);
		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Preview"
					activePageView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onSwitchEditMode={() => {}} />
				</div>
			</div>
		));
	});

	it("onSwitchPageViewType should be switch between ui and behavior", () => {
		const switchPageViewTypeProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[switchPageViewTypeProcess, switchPageViewTypeProcessStub],
		]);

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

		mockStore((path) => [replace(path("projectDependencies"), [])]);

		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Preview"
					activePageView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<Preview permission={permission} onSwitchEditMode={() => {}} />
				</div>
			</div>
		));

		// 切换到编辑模式
		h.trigger("@header", "onSwitchEditMode");
		// 切换到交互视图
		h.trigger("@header", "onSwitchPageView");

		assert.isTrue(switchPageViewTypeProcessStub.calledOnce);

		// 实际修改 store 中的数据
		mockStore((path) => [
			replace(path("paneLayout", "editMode"), "Edit"),
			replace(path("paneLayout", "pageViewType"), "behavior"),
		]);

		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Edit"
					activePageView="behavior"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<BehaviorView />
				</div>
			</div>
		));

		// 切换回 UI 视图
		h.trigger("@header", "onSwitchPageView");
		assert.isTrue(switchPageViewTypeProcessStub.calledTwice);

		// 实际修改 store 中的数据
		mockStore((path) => [replace(path("paneLayout", "pageViewType"), "ui")]);

		h.expect(() => (
			<div classes={[c.container_fluid, css.root]}>
				<Header
					key="header"
					editMode="Edit"
					activePageView="ui"
					user={user}
					project={project}
					permission={permission}
					pathes={pathes}
					onSwitchEditMode={() => {}}
					onSwitchPageView={() => {}}
					onGotoGroup={() => {}}
				/>
				<div classes={[css.container]}>
					<UIView />
				</div>
			</div>
		));
	});
});
