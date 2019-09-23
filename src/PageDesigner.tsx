import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";

import * as css from "./styles/PageDesigner.m.css";
import * as c from "bootstrap-classes";
import Header from "./widgets/Header";
import { User, Project, Page, Path, Permission, EditMode, ViewType, RequestUrl } from "./interfaces";
import Preview from "./widgets/preview";
import UIView from "./widgets/ui-view";
import BehaviorView from "./widgets/behavior-view";
import store from "./store";
import { config } from "./config";
import { initProjectProcess, getProjectIdeDependencesProcess } from "./processes/projectProcesses";
import * as scriptjs from "scriptjs";

export interface PageDesignerProperties {
	user?: User; // 如果是匿名用户，则值为 null
	project: Project;
	permission: Permission;
	page: Page;
	pathes: Path[];
	urls: RequestUrl;
}

const factory = create({ icache, store }).properties<PageDesignerProperties>();

export default factory(function PageDesigner({ properties, middleware: { icache, store } }) {
	const { user, project, permission, pathes, urls } = properties();
	const { executor, get, path } = store;

	// 初始化数据
	// 1. 本地数据
	config.fetchApiRepoWidgetsUrl = urls.fetchApiRepoWidgets;
	config.fetchPageModelUrl = urls.fetchPageModel;
	config.fetchIdeDependenceInfosUrl = urls.fetchIdeDependenceInfos;

	const savedProject = get(path("project"));
	console.log("saved project is:", savedProject);
	// 避免重复设置或重复请求远程数据
	if (!savedProject || savedProject.id !== project.id) {
		// 在 store 中存储项目基本信息
		executor(initProjectProcess)({ project });
		// 获取项目的 dev 依赖

		executor(getProjectIdeDependencesProcess)({ get, path }).then((a: any) => {
			// 获取完依赖之后要加载相应的 js 脚本
			const ideRepos = get(path("ideRepos"));
			// TODO: 后续版本再考虑 css
			// TODO: 避免重复加载 script，删除项目用不到的 script
			const jsUrls = ideRepos.map(
				(item) =>
					`/packages/${item.gitRepoWebsite}/${item.gitRepoOwner}/${item.gitRepoName}/${item.version}/main.bundle.js`
			);

			scriptjs.path("http://localhost:3001/");
			// scriptjs("test.js", "test");
			// scriptjs.ready("test", () => {
			// 	console.log("load success");
			// });
			scriptjs(jsUrls, "extension_js");
			// dojo 支持 single-bundle 命令
			scriptjs.ready("extension_js", () => {
				console.log("extension js ready");
			});
		});
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
