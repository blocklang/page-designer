import Page from "std-ide-widget/page";
import { ComponentRepo, AttachedWidget } from "../../../interfaces";
import global from "@dojo/framework/shim/global";
import { find } from "@dojo/framework/shim/array";
import { w } from "@dojo/framework/core/vdom";

export function renderWidgets(widgets: AttachedWidget[], ideRepos: ComponentRepo[]) {
	return widgets.map((widgetInfo) => {
		// 1. 根据 componentRepoId 获取到 componentRepo 信息
		const ideRepo = find(ideRepos, (item) => item.id === widgetInfo.componentRepoId);
		if (!ideRepo) {
			return;
		}
		// 2. 根据 componentRepo 获取到组件
		const widget = getWidget(ideRepo, widgetInfo.widgetName);
		return w(widget, {});
	});
}

// 标准库。标准库是在引用处显式指定的。而扩展库是由用户配置的。
// TODO: 移到单独的文件中
// 因为此处只加载了一个版本，所以不需要在路径中包含版本号。
const stdMap: { [propName: string]: any } = {
	"github.com/jack/widgetRepo1": Page
};

// 创建一个函数，先从标准库中查找组件，如果查不到，再从 window._block_lang_widgets_ 中查找组件
function getWidget(ideRepo: ComponentRepo, widgetName: string) {
	const key = `${ideRepo.gitRepoWebsite}/${ideRepo.gitRepoOwner}/${ideRepo.gitRepoName}`;
	// 优先从标准库中查找
	let widget = stdMap[key];
	if (widget) {
		return widget;
	}
	widget = global._block_lang_widgets_[key];
	if (widget) {
		return widget;
	}
	// 如果依然没有找到，则返回一个 UndefinedWidget 部件，其中通过高亮样式和文字提示用户。
}
