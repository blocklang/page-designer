import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";
import cache from "@dojo/framework/core/middleware/cache";

import * as css from "./PageDesigner.m.css";
import * as c from "bootstrap-classes";
import Header from "./widgets/Header";
import {
	User,
	Project,
	Page,
	Path,
	Permission,
	EditMode,
	ViewType,
	RequestUrl,
	ComponentRepo,
	RouteName
} from "./interfaces";
import Preview from "./widgets/preview";
import UIView from "./widgets/edit/ui";
import BehaviorView from "./widgets/edit/behavior";
import store from "./store";
import { config } from "./config";
import { initProjectProcess, getProjectIdeDependencesProcess } from "./processes/projectProcesses";
import * as scriptjs from "scriptjs";
import { widgetInstanceMap } from "@dojo/framework/core/vdom";
import * as blocklang from "designer-core/blocklang";

import { getPageModelProcess } from "./processes/uiProcesses";
import { loadCSS } from "./utils/fg-loadcss/loadCSS";
import onloadCSS from "./utils/fg-loadcss/onloadCSS";
import { SVGInjector } from "@tanem/svg-injector";

import { library } from "@fortawesome/fontawesome-svg-core";

import { faArrowAltCircleLeft } from "@fortawesome/free-regular-svg-icons/faArrowAltCircleLeft";
import { faEdit } from "@fortawesome/free-regular-svg-icons/faEdit";
import { faCaretSquareRight } from "@fortawesome/free-regular-svg-icons/faCaretSquareRight";
import { faSave } from "@fortawesome/free-regular-svg-icons/faSave";
import { faCube } from "@fortawesome/free-solid-svg-icons/faCube";
import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo";
import { faRedo } from "@fortawesome/free-solid-svg-icons/faRedo";
import { faLevelUpAlt } from "@fortawesome/free-solid-svg-icons/faLevelUpAlt";
import { faStepForward } from "@fortawesome/free-solid-svg-icons/faStepForward";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons/faStepBackward";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons/faTrashAlt";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import { faArrowsAlt } from "@fortawesome/free-solid-svg-icons/faArrowsAlt";

library.add(
	faArrowAltCircleLeft,
	faEdit,
	faCaretSquareRight,
	faSave,
	faCube,
	faUndo,
	faRedo,
	faLevelUpAlt,
	faStepForward,
	faStepBackward,
	faTrashAlt,
	faAngleDown,
	faAngleRight,
	faArrowsAlt
);

export interface PageDesignerProperties {
	user?: User; // 如果是匿名用户，则值为 null
	project: Project;
	permission: Permission;
	page: Page;
	pathes: Path[];
	urls: RequestUrl;
	routes: RouteName;
}

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
	if (urls.externalScriptAndCssWebsite) {
		config.externalScriptAndCssWebsite = urls.externalScriptAndCssWebsite;
	}
	config.routeProfile = routes.profile;
	config.routeParentGroup = routes.parentGroup;

	const savedProject = get(path("project"));

	// 避免重复设置或重复请求远程数据
	if (!savedProject || savedProject.id !== project.id) {
		// 在 store 中存储项目基本信息
		executor(initProjectProcess)({ project });
		executor(getPageModelProcess)({ pageId: page.id });
	}

	// 获取项目的 ide 依赖
	// TODO: 要考虑如何避免重复加载，以及漏加载
	const ideRepos = get(path("ideRepos"));
	if (!ideRepos) {
		executor(getProjectIdeDependencesProcess)({});
	} else {
		// 获取完依赖之后要加载相应的 js 脚本
		// 去除掉标准库，因为已默认引用标准库
		const externalResourcesLoaded = cache.get<boolean>("externalResourcesLoaded") || false;
		if (!externalResourcesLoaded) {
			let loadCount = 0;
			loadExternalResources(
				ideRepos.filter((item) => item.std === false),
				() => {
					loadCount++;
					if (loadCount === 2) {
						cache.set("externalResourcesLoaded", true);
					}
				}
			);
		}
	}

	let editMode = icache.getOrSet<EditMode>("editMode", "Preview");
	let activeView = icache.getOrSet<ViewType>("activeView", "ui");

	const onChangeEditMode = () => {
		if (editMode === "Preview") {
			editMode = "Edit";
		} else {
			editMode = "Preview";
		}
		icache.set("editMode", editMode);
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
				activeView={activeView}
				onChangeEditMode={onChangeEditMode}
				onChangeView={() => {
					if (activeView === "ui") {
						activeView = "behavior";
					} else {
						activeView = "ui";
					}
					icache.set("activeView", activeView);
				}}
			/>
			<div classes={[css.container]}>
				{editMode === "Preview" ? (
					<Preview permission={permission} onChangeEditMode={onChangeEditMode} />
				) : activeView === "ui" ? (
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
