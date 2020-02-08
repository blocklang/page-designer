import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";
import cache from "@dojo/framework/core/middleware/cache";
import dimensions from "@dojo/framework/core/middleware/dimensions";
import { widgetInstanceMap } from "@dojo/framework/core/vdom";
import * as css from "./PageDesigner.m.css";
import * as c from "bootstrap-classes";
import Header from "./widgets/Header";
import { User, Page, Path, Permission, RequestUrl, RouteName } from "./interfaces";
import Preview from "./widgets/preview";
import UIView from "./widgets/edit/ui";
import BehaviorView from "./widgets/edit/behavior";

import { config } from "./config";
import { initProjectProcess, getProjectIdeDependencesProcess } from "./processes/projectProcesses";
import * as scriptjs from "scriptjs";

import { Project, ComponentRepo } from "designer-core/interfaces";
import store from "designer-core/store";
import * as blocklang from "designer-core/blocklang";

import { getPageModelProcess } from "./processes/uiProcesses";
import { loadCSS } from "./utils/fg-loadcss/loadCSS";
import onloadCSS from "./utils/fg-loadcss/onloadCSS";
import { SVGInjector } from "@tanem/svg-injector";
import * as icon from "./icon";
import { switchEditModeProcess, switchPageViewTypeProcess } from "./processes/designerProcesses";

icon.init();

export interface PageDesignerProperties {
	user?: User; // 如果是匿名用户，则值为 null
	project: Project;
	permission: Permission;
	page: Page;
	pathes: Path[];
	urls: RequestUrl;
	routes: RouteName;
}

blocklang.registerDimensionsMiddleware(dimensions);
blocklang.registerICacheMiddleware(icache);
blocklang.registerStoreMiddleware(store);

const factory = create({ icache, store, cache }).properties<PageDesignerProperties>();

// 注意，根据单一职责原则，以及参数宜集中不宜分散的原则，在调用 PageDesigner 只有一个设置参数入口，
// 就是通过 PageDesignerProperties，不允许直接设置 config 对象。
export default factory(function PageDesigner({ properties, middleware: { icache, store, cache } }) {
	const { user, project, page, permission, pathes, urls, routes } = properties();
	const { executor, get, path } = store;

	// 初始化数据
	// 1. 本地数据
	config.fetchApiRepoWidgetsUrl = urls.fetchApiRepoWidgets;
	config.fetchPageModelUrl = urls.fetchPageModel;
	config.fetchIdeDependenceInfosUrl = urls.fetchIdeDependenceInfos;
	config.savePageModelUrl = urls.savePageModel;
	if (urls.externalScriptAndCssWebsite) {
		config.externalScriptAndCssWebsite = urls.externalScriptAndCssWebsite;
	}
	if (urls.customFetchHeaders) {
		config.customFetchHeaders = urls.customFetchHeaders;
	}

	config.routeProfile = routes.profile;
	config.routeParentGroup = routes.parentGroup;

	// 如果应用程序的 store 中存在 project，则使用应用程序 store 中的值
	const savedProject = get(path("project"));

	// 避免重复设置或重复请求远程数据
	if (!savedProject || savedProject.id !== project.id) {
		// 在 store 中存储项目基本信息
		executor(initProjectProcess)({ project });
	}

	const pageModelIsLoading = cache.get<boolean>("pageModelIsLoading") || false;
	// 页面模型不能缓存，原因有二：
	// 1. 如果第二次加载的是另一个页面，则依然会使用第一次加载时的模型
	// 2. 如果页面模型在另一个浏览器中修改，则使用的依然是本地缓存的数据
	// 所以，每次进入页面都要初始化加载页面模型，
	// 但同时要避免进入页面后多次加载页面模型。
	if (!pageModelIsLoading) {
		cache.set<boolean>("pageModelIsLoading", true);
		executor(getPageModelProcess)({ pageId: page.id });
	}

	// 获取项目的 ide 依赖
	// TODO: 要考虑如何避免重复加载，以及漏加载
	const ideReposIsLoading = cache.get<boolean>("ideReposIsLoading") || false;
	if (!ideReposIsLoading) {
		executor(getProjectIdeDependencesProcess)({});
		cache.set<boolean>("ideReposIsLoading", true);
	}

	const ideRepos = get(path("ideRepos"));
	if (!ideRepos) {
		return (
			<div classes={[c.text_muted, c.text_center, c.mt_5]}>
				<div classes={[c.spinner_border]} role="status">
					<span classes={[c.sr_only]}>Loading...</span>
				</div>
			</div>
		);
	}

	// 此处不需要使用 executor()().then(); 直接判断 store 中是否存在值，存在时则执行即可
	// 获取完依赖之后要加载相应的 js 脚本
	// 去除掉标准库，因为已默认引用标准库
	const externalResources = ideRepos.filter((item) => item.std === false);
	if (externalResources.length > 0) {
		const externalResourcesLoaded = icache.getOrSet<boolean>("externalResourcesLoaded", false);
		if (!externalResourcesLoaded) {
			let loadCount = 0;
			loadExternalResources(externalResources, () => {
				loadCount++;
				if (loadCount === 2) {
					icache.set("externalResourcesLoaded", true);
				}
			});

			return (
				<div classes={[c.text_muted, c.text_center, c.mt_5]}>
					<div classes={[c.spinner_border]} role="status">
						<span classes={[c.sr_only]}>Loading...</span>
					</div>
				</div>
			);
		}
	}

	// 只有当加载完外部资源之后才渲染
	const editMode = get(path("paneLayout", "editMode")) || "Preview";
	const activePageView = get(path("paneLayout", "pageViewType")) || "ui";

	const onSwitchEditMode = () => {
		executor(switchEditModeProcess)({});
	};

	return (
		<div classes={[c.container_fluid, css.root]}>
			<Header
				key="header"
				user={user}
				permission={permission}
				project={project}
				pathes={pathes}
				editMode={editMode}
				activePageView={activePageView}
				onSwitchEditMode={onSwitchEditMode}
				onSwitchPageView={() => {
					executor(switchPageViewTypeProcess)({});
				}}
				// 当路由支持通配符后删除此段代码
				onGotoGroup={(owner: string, project: string, parentPath: string) => {
					routes.gotoGroup && routes.gotoGroup(owner, project, parentPath);
				}}
			/>
			<div classes={[css.container]}>
				{editMode === "Preview" ? (
					<Preview permission={permission} onSwitchEditMode={onSwitchEditMode} />
				) : activePageView === "ui" ? (
					<UIView />
				) : (
					<BehaviorView />
				)}
			</div>
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
function loadExternalResources(ideRepos: ComponentRepo[], loadSuccess: (resourceType: "js" | "css") => void) {
	console.log("config.externalScriptAndCssWebsite:", config.externalScriptAndCssWebsite);
	if (!ideRepos) {
		console.log("ideRepos 为 undefined");
		return;
	}

	const jsUrls = ideRepos.map(
		(item) =>
			`/designer/assets/${item.gitRepoWebsite}/${item.gitRepoOwner}/${item.gitRepoName}/${item.version}/main.bundle.js`
	);

	scriptjs.path(config.externalScriptAndCssWebsite);
	scriptjs(jsUrls, "extension_js");
	// dojo 支持 single-bundle 命令
	scriptjs.ready("extension_js", () => {
		console.log("第三方 js 库加载完毕。");
		blocklang.watchingWidgetInstanceMap(widgetInstanceMap);
		loadSuccess("js");
	});

	// 加载 css 文件
	const cssFileCount = ideRepos.length;
	console.log(`共需加载 ${cssFileCount} 个 css 文件。`);
	let loadedCount = 0;
	ideRepos.forEach((item) => {
		const cssHref = `${config.externalScriptAndCssWebsite}/designer/assets/${item.gitRepoWebsite}/${item.gitRepoOwner}/${item.gitRepoName}/${item.version}/main.bundle.css`;
		// 如果已经加载过，则不重复加载
		// FIXME: 添加此逻辑之后，firefox 中同一个 css 文件依然会加载两次, 查找原因。
		const stylesheet = loadCSS(cssHref);
		onloadCSS(stylesheet, () => {
			loadedCount++;
			console.log(`加载第 ${loadedCount} 个 css 文件。`);
			if (loadedCount === cssFileCount) {
				console.log(`全部加载完成，共加载 ${loadedCount} 个文件。`);
				loadSuccess("css");
			}
		});
	});

	ideRepos.forEach((item) => {
		const svgHref = `${config.externalScriptAndCssWebsite}/designer/assets/${item.gitRepoWebsite}/${item.gitRepoOwner}/${item.gitRepoName}/${item.version}/icons.svg`;
		// 约定的前缀，注意使用的是 ide 版仓库信息，而不是 api 版的仓库信息
		const idPrefix = `${item.gitRepoWebsite}-${item.gitRepoOwner}-${item.gitRepoName}-`;
		insertSvgDiv(svgHref, idPrefix);
	});
}

// <div class="inject-me" data-src="icon-two.svg"></div>
function insertSvgDiv(svgPath: string, symbolIdPrefix: string) {
	const svgInjectorDiv = document.createElement("div");
	svgInjectorDiv.setAttribute("data-src", svgPath);
	svgInjectorDiv.className = "inject-me";
	// 因为 img 有默认高度，因此这里要将将 display 设置为 'none;
	// 否则会造成初始聚焦框计算错位的问题。
	svgInjectorDiv.style.display = "none";
	document.body.appendChild(svgInjectorDiv);

	SVGInjector(svgInjectorDiv, {
		beforeEach(svg) {
			const symbols = svg.children;
			for (let i = 0; i < symbols.length; i++) {
				const symbol = symbols[i];
				const originId = symbol.getAttribute("id");
				// 为了确保 symbol 的 id 全局唯一，在原有的 id 前加上了组件仓库信息
				symbol.setAttribute("id", symbolIdPrefix + originId);
			}
		}
	});
}
