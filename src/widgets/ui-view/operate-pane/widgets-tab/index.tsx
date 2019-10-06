import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";
import store from "../../../../store";
import * as c from "bootstrap-classes";
import { getWidgetsProcess } from "../../../../processes/widgetProcesses";
import { WidgetRepo } from "../../../../interfaces";
import { deepMixin } from "@dojo/framework/core/util";
import { insertWidgetsProcess } from "../../../../processes/uiProcesses";
export interface WidgetsTabProperties {}

const factory = create({ store, icache }).properties<WidgetsTabProperties>();

export default factory(function WidgetsTab({ properties, middleware: { store, icache } }) {
	const {} = properties();
	const { path, get, executor } = store;

	const widgetRepos = get(path("widgetRepos"));
	if (!widgetRepos) {
		executor(getWidgetsProcess)({});
	}

	let filterWidgetRepos: WidgetRepo[] | undefined;
	if (widgetRepos) {
		filterWidgetRepos = deepMixin([], widgetRepos);
	}

	const searchText = icache.getOrSet<string>("searchText", "");
	if (filterWidgetRepos) {
		// 搜索
		if (searchText.trim().length > 0) {
			filterWidgetRepos.forEach((repo) =>
				repo.widgetCategories.forEach(
					(category) =>
						(category.widgets = category.widgets.filter(
							(widget) => widget.widgetName.toLowerCase().indexOf(searchText.toLowerCase()) > -1
						))
				)
			);
		}
		filterWidgetRepos.forEach(
			(repo) => (repo.widgetCategories = repo.widgetCategories.filter((category) => category.widgets.length > 0))
		);
	}

	// 为什么使用 _ 表示未分类
	// 1. 在 rust 语言中，使用 _ 模式来匹配任何值
	// 2. 如果直接写为“未分类”，在国际化时，使用 _ 更直观
	return (
		<div>
			<div classes={[c.m_1]}>
				<input
					key="search"
					value={searchText}
					classes={[c.form_control]}
					placeholder="搜索部件"
					oninput={(event: KeyboardEvent) => {
						const target = event.target as HTMLInputElement;
						icache.set("searchText", target.value);
					}}
				/>
			</div>
			<div>
				{filterWidgetRepos ? (
					filterWidgetRepos.length === 0 ? (
						<p classes={[c.text_muted, c.text_center]}>
							请在 <strong>DEPENDENCE.json</strong> 中添加部件仓库
						</p>
					) : (
						filterWidgetRepos.map((repo) => (
							<div key={`${repo.apiRepoId}`}>
								<div>{repo.apiRepoName}</div>
								<div>
									{repo.widgetCategories.length === 0 ? (
										<p classes={[c.text_muted, c.text_center]}>无部件</p>
									) : (
										repo.widgetCategories.map((category) => (
											<div key={category.name}>
												<div>{category.name === "_" ? "未分类" : category.name}</div>
												<div>
													<ul>
														{category.widgets.map((widget) => (
															<li
																key={`${widget.widgetId}`}
																onclick={(event: MouseEvent) => {
																	// 注意，这里必须是复制的 widget，不然添加的新的同类部件都指向同一个对象。
																	// const copyedWidget = { ...widget }; // 待测试
																	executor(insertWidgetsProcess)({
																		widgets: [widget]
																	});
																}}
															>
																<span>{widget.widgetName}</span>
															</li>
														))}
													</ul>
												</div>
											</div>
										))
									)}
								</div>
							</div>
						))
					)
				) : (
					<div classes={[c.text_muted, c.text_center]}>
						<div classes={[c.spinner_border]} role="status">
							<span classes={[c.sr_only]}>Loading...</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
});
