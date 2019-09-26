import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";

import * as css from "./styles/PageDesigner.m.css";
import * as c from "bootstrap-classes";
import Header from "./widgets/Header";
import { User, Project, Page, Path, Permission, EditMode, ViewType, RequestUrl, ComponentRepo } from "./interfaces";
import Preview from "./widgets/preview";
import UIView from "./widgets/ui-view";
import BehaviorView from "./widgets/behavior-view";
import store from "./store";
import { config } from "./config";
import { initProjectProcess, getProjectIdeDependencesProcess } from "./processes/projectProcesses";
import * as scriptjs from "scriptjs";
import { getPageModelProcess } from "./processes/uiProcesses";

export interface PageDesignerProperties {
	user?: User; // 如果是匿名用户，则值为 null
	project: Project;
	permission: Permission;
	page: Page;
	pathes: Path[];
	urls: RequestUrl;
}

const factory = create({ icache, store }).properties<PageDesignerProperties>();

// 注意，根据职责单一原则，以及参数宜集中不宜分散的原则，在调用 PageDesigner 只有一个设置参数入口，
// 就是通过 PageDesignerProperties，不允许直接设置 config 对象。
export default factory(function PageDesigner({ properties, middleware: { icache, store } }) {
	const { user, project, permission, pathes, urls } = properties();
	const { executor, get, path } = store;

	// 初始化数据
	// 1. 本地数据
	config.fetchApiRepoWidgetsUrl = urls.fetchApiRepoWidgets;
	config.fetchPageModelUrl = urls.fetchPageModel;
	config.fetchIdeDependenceInfosUrl = urls.fetchIdeDependenceInfos;
	if (urls.externalScriptAndCssWebsite) {
		config.externalScriptAndCssWebsite = urls.externalScriptAndCssWebsite;
	}

	const savedProject = get(path("project"));
	console.log("saved project is:", savedProject);
	// 避免重复设置或重复请求远程数据
	if (!savedProject || savedProject.id !== project.id) {
		// 在 store 中存储项目基本信息
		executor(initProjectProcess)({ project });
		// 获取项目的 ide 依赖
		executor(getProjectIdeDependencesProcess)({ get, path }).then(() => {
			// 获取完依赖之后要加载相应的 js 脚本
			const ideRepos = get(path("ideRepos"));

			loadExternalResources(ideRepos);
		});
		executor(getPageModelProcess)({});
	}

	let editMode = icache.getOrSet<EditMode>("editMode", "Preview");
	let activeView = icache.getOrSet<ViewType>("activeView", "ui");
	return (
		<div classes={[c.container_fluid, css.root]}>
			<Header
				key="header"
				user={user}
				permission={permission}
				project={project}
				pathes={pathes}
				editMode={editMode}
				activeView={activeView}
				onChangeEditMode={() => {
					if (editMode === "Preview") {
						editMode = "Edit";
					} else {
						editMode = "Preview";
					}
					icache.set("editMode", editMode);
				}}
				onChangeView={() => {
					if (activeView === "ui") {
						activeView = "behavior";
					} else {
						activeView = "ui";
					}
					icache.set("activeView", activeView);
				}}
			/>
			{editMode === "Preview" ? <Preview /> : activeView === "ui" ? <UIView /> : <BehaviorView />}
		</div>
	);
});

/**
 * 加载外部的 javascript 文件和 css 文件
 *
 * TODO: 后续版本再考虑 css
 * TODO: 避免重复加载 script，删除项目用不到的 script
 *
 * @param ideRepos
 */
function loadExternalResources(ideRepos: ComponentRepo[]) {
	console.log("config.externalScriptAndCssWebsite:", config.externalScriptAndCssWebsite);
	if (!ideRepos) {
		console.log("ideRepos 为 undefined");
		return;
	}
	const jsUrls = ideRepos.map(
		(item) =>
			`/packages/${item.gitRepoWebsite}/${item.gitRepoOwner}/${item.gitRepoName}/${item.version}/main.bundle.js`
	);

	scriptjs.path(config.externalScriptAndCssWebsite);
	scriptjs(jsUrls, "extension_js");
	// dojo 支持 single-bundle 命令
	scriptjs.ready("extension_js", () => {
		console.log("extension js ready");
	});
}
