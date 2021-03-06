import { create, tsx } from "@dojo/framework/core/vdom";

// 注意： 此样式要放在 import PageDesigner 语句之上，这样 PageDesigner 及其子部件中的样式优先级就会提高
import "bootstrap/dist/css/bootstrap.min.css";
import * as css from "./App.m.css";
import PageDesigner from ".";
import { Project } from "@blocklang/designer-core/interfaces";
import { User, Permission, Page, Path, RequestUrl, RouteName } from "./interfaces";

const factory = create();

export default factory(function App() {
	// TODO: 支持调整参数，随着参数的变化，设计器也跟着改变
	const user: User = {
		name: "jack",
		avatar: "url",
	};

	const project: Project = {
		id: 1,
		name: "project_1",
		createUserName: "jack",
	};

	const permission: Permission = {
		canRead: true,
		canWrite: true,
	};

	const page: Page = {
		id: 1,
		key: "page1",
		name: "页面1",
		appType: "04", // web, WeChat，04(harmonyOS)
		deviceType: "05", // Lite Wearable
	};

	const pathes: Path[] = [{ name: "page1", path: "page1" }];

	const urls: RequestUrl = {
		fetchApiRepoWidgets: `http://localhost:3000/designer/projects/${project.id}/dependencies/widgets`,
		fetchApiRepoServices: `http://localhost:3000/designer/projects/${project.id}/dependencies/services`,
		fetchApiRepoFunctions: `http://localhost:3000/designer/projects/${project.id}/dependencies/functions`,
		fetchPageModel: `http://localhost:3000/designer/pages/${page.id}/model`,
		fetchIdeDependencyInfos: `http://localhost:3000/designer/projects/${project.id}/dependencies?repo=ide`,
		externalScriptAndCssWebsite: "http://localhost:3001",
		savePageModel: "",
	};

	const routes: RouteName = {
		profile: "",
		parentGroup: "",
	};

	return (
		<div classes={[css.root]}>
			<PageDesigner
				user={user}
				project={project}
				permission={permission}
				page={page}
				pathes={pathes}
				urls={urls}
				routes={routes}
			/>
		</div>
	);
});
