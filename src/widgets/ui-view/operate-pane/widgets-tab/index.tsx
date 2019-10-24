import { create, tsx } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";
import store from "../../../../store";
import * as c from "bootstrap-classes";
import { getWidgetsProcess } from "../../../../processes/widgetProcesses";
import { WidgetRepo } from "../../../../interfaces";
import { deepMixin } from "@dojo/framework/core/util";
import { insertWidgetsProcess } from "../../../../processes/uiProcesses";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as css from "./index.m.css";
import { find } from "@dojo/framework/shim/array";

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

	const ideRepos = get(path("ideRepos"));

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

							const ideRepo = find(ideRepos, (item) => item.apiRepoId === repo.apiRepoId);

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
														`fold-category-${repo.apiRepoId}`,
														false
													);
													return (
														<div key={category.name}>
															<div
																classes={[c.pl_1, c.text_muted, css.categoryNameBar]}
																onclick={() => {
																	icache.set<boolean>(
																		`fold-category-${repo.apiRepoId}`,
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
																						widgets: [widget]
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
