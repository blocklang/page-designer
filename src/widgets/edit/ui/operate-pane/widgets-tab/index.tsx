import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";
import cache from "@dojo/framework/core/middleware/cache";
import { find } from "@dojo/framework/shim/array";
import store from "designer-core/store";
import { RepoWidgetList } from "designer-core/interfaces";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { getWidgetsProcess } from "../../../../../processes/widgetProcesses";
import { deepMixin } from "@dojo/framework/core/util";
import { insertWidgetsProcess } from "../../../../../processes/uiProcesses";
import * as c from "bootstrap-classes";
import * as css from "./index.m.css";

export interface WidgetsTabProperties {}

const factory = create({ store, icache, cache }).properties<WidgetsTabProperties>();

export default factory(function WidgetsTab({ properties, middleware: { store, icache, cache } }) {
	const {} = properties();
	const { path, get, executor } = store;

	// 1. 每次进入新页面，都要刷新(所以要在 PageDesigner 清空部件列表)
	// 2. 在属性和部件之间切换时，不要刷新
	const allRepoWidgets = get(path("repoWidgets"));
	if (!allRepoWidgets) {
		const widgetRepoIsLoading = cache.get<boolean>("widgetRepoIsLoading") || false;
		if (!widgetRepoIsLoading) {
			executor(getWidgetsProcess)({});
			cache.set<boolean>("widgetRepoIsLoading", true);
		}
	}

	let filterWidgetRepos: RepoWidgetList[] | undefined;
	if (allRepoWidgets) {
		// FIXME:
		// 如果不克隆一份，则一个页面中多处使用同一个部件时，就会指向同一个部件
		// 此处是全体克隆，尝试改为在此时不可能，而是往页面中添加部件时，一次只克隆一个部件
		filterWidgetRepos = deepMixin([], allRepoWidgets);
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

	const widgetIdeRepos = (get(path("projectDependencies")) || []).filter((repo) => repo.category === "Widget");

	// 为什么使用 _ 表示未分类
	// 1. 在 rust 语言中，使用 _ 模式来匹配任何值
	// 2. 如果直接写为“未分类”，在国际化时，使用 _ 更直观
	return (
		<div>
			<div classes={[c.mt_1]}>
				<input
					key="search"
					value={searchText}
					classes={[c.form_control, c.form_control_sm, css.searchInput]}
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
						filterWidgetRepos.map((repo) => {
							// 默认是展开的
							const apiRepoFold = icache.getOrSet<boolean>(`fold-repo-${repo.apiRepoId}`, false);

							const ideRepo = find(widgetIdeRepos, (item) => item.apiRepoId === repo.apiRepoId);

							let symboIdPrefix = "";
							if (ideRepo) {
								symboIdPrefix = `${ideRepo.gitRepoWebsite}-${ideRepo.gitRepoOwner}-${ideRepo.gitRepoName}-`;
							} else {
								console.warn(repo, "没有找到对应的 ide 组件仓库");
							}
							return (
								<div key={`${repo.apiRepoId}`}>
									<div
										classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]}
										onclick={() => {
											icache.set<boolean>(`fold-repo-${repo.apiRepoId}`, !apiRepoFold);
										}}
									>
										{apiRepoFold ? (
											<FontAwesomeIcon icon="angle-right" />
										) : (
											<FontAwesomeIcon icon="angle-down" />
										)}
										<span classes={[c.ml_1]}>{repo.apiRepoName}</span>
									</div>
									{!apiRepoFold && (
										<div>
											{repo.widgetCategories.length === 0 ? (
												<p classes={[c.text_muted, c.text_center]}>无部件</p>
											) : (
												repo.widgetCategories.map((category) => {
													const categoryFold = icache.getOrSet<boolean>(
														`fold-category-${repo.apiRepoId}-${category.name}`,
														false
													);
													return (
														<div key={category.name}>
															<div
																classes={[c.pl_1, c.text_muted, css.categoryNameBar]}
																onclick={() => {
																	icache.set<boolean>(
																		`fold-category-${repo.apiRepoId}-${category.name}`,
																		!categoryFold
																	);
																}}
															>
																{categoryFold ? (
																	<FontAwesomeIcon icon="angle-right" />
																) : (
																	<FontAwesomeIcon icon="angle-down" />
																)}
																<span classes={[c.ml_1]}>
																	{category.name === "_" ? "未分类" : category.name}
																</span>
															</div>
															{!categoryFold && (
																<div>
																	<ul classes={[css.widgetGroup]}>
																		{category.widgets.map((widget) => (
																			<li
																				key={`${widget.widgetId}`}
																				classes={[css.widgetItem]}
																				onclick={(event: MouseEvent) => {
																					widget.apiRepoId = repo.apiRepoId;
																					executor(insertWidgetsProcess)({
																						// FIXME: 在此处克隆？
																						widgets: [widget],
																					});
																				}}
																			>
																				<svg classes={[css.widgetItemIcon]}>
																					<use
																						href={`#${symboIdPrefix}${widget.widgetName}`}
																					></use>
																				</svg>
																				<span classes={[css.widgetItemlabel]}>
																					{widget.widgetName}
																				</span>
																			</li>
																		))}
																	</ul>
																</div>
															)}
														</div>
													);
												})
											)}
										</div>
									)}
								</div>
							);
						})
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
