const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import Editor from "../../../../../src/widgets/ui-view/editor";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State, ComponentRepo, PageModel } from "../../../../../src/interfaces";
import store from "../../../../../src/store";
import * as c from "bootstrap-classes";
import { replace } from "@dojo/framework/stores/state/operations";
import Page from "std-ide-widget/page";
import { InstWidget } from "designer-core/interfaces";

describe("ui-view/editor", () => {
	it("show page when no root node", () => {
		const h = harness(() => <Editor />);

		h.expect(() => (
			<div>
				<div classes={[c.alert, c.alert_danger]} role="alert">
					页面中缺少根节点！
				</div>
			</div>
		));
	});

	// 当只有一个根节点时，则默认选中根节点。
	it("show empty page that only contains a root node", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Editor />, { middleware: [[store, mockStore]] });

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageInfo: {
				id: 1,
				key: "page1",
				name: "页面1",
				appType: "01"
			},
			widgets: [
				{
					id: "1",
					parentId: "-1",
					componentRepoId: 1,
					widgetId: 1,
					widgetName: "Page",
					widgetCode: "0001",
					iconClass: "",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							parentId: "-1",
							name: "onLoad",
							value: undefined // TODO: 需进一步细化
						}
					]
				}
			]
		};
		// 默认包含标准库
		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "std-ide-widget",
				name: "std-ide-widget",
				category: "widget",
				version: "0.0.1",
				std: true
			}
		];

		mockStore((path) => [replace(path("pageModel"), pageModel), replace(path("ideRepos"), ideRepos)]);

		// FIXME: 有两处有 AttachedWidget 接口，考虑是否可以合并为同一个，或者将其中一个重命名？
		const widget: InstWidget = {
			id: "1",
			parentId: "-1",
			widgetCode: "0001",
			widgetName: "Page",
			canHasChildren: true
		};
		// activeWidgetId 的作用是什么？可否用 focused 属性代替
		// widget 属性是否可以替换或者精简？
		h.expect(() => (
			<div>
				<Page
					widget={widget}
					originalProperties={{ onLoad: () => {} }} // 原始属性值
					extendProperties={{
						onFocus: () => {},
						activeWidgetId: ""
					}}
					// 原始属性的值，是必须要展开的
					onLoad={() => {}}
				/>
			</div>
		));
	});
});
