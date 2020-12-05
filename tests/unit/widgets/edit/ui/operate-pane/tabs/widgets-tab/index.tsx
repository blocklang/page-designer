const { describe, it } = intern.getInterface("bdd");

import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import harness from "@dojo/framework/testing/harness/harness";
import { tsx } from "@dojo/framework/core/vdom";
import { add, replace } from "@dojo/framework/stores/state/operations";
import * as c from "@blocklang/bootstrap-classes";
import { stub } from "sinon";

import WidgetsTab from "../../../../../../../../src/widgets/edit/ui/operate-pane/tabs/widgets-tab";
import * as css from "../../../../../../../../src/widgets/edit/ui/operate-pane/tabs/widgets-tab/index.m.css";
import { State } from "@blocklang/designer-core/interfaces";
import store from "@blocklang/designer-core/store";
import { getWidgetsProcess } from "../../../../../../../../src/processes/projectDependenciesProcesses";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";

describe("edit/ui/operate-pane/tabs/widgets-tab", () => {
	it("No widget repo", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);
		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<div classes={[c.text_muted, c.text_center]}>
						<div classes={[c.spinner_border]} role="status">
							<span classes={[c.sr_only]}>Loading...</span>
						</div>
					</div>
				</div>
			</div>
		));

		// 加载完成，返回空数组
		mockStore((path) => [add(path("repoWidgets"), [])]);
		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<p classes={[c.text_muted, c.text_center]}>
						请在 <strong>DEPENDENCY.json</strong> 中添加部件仓库
					</p>
				</div>
			</div>
		));
	});

	it("Has two widget repos, but both has no categories", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);
		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		// 加载完成，返回两个空的部件仓库
		mockStore((path) => [
			replace(path("repoWidgets"), [
				{ apiRepoId: 1, apiRepoName: "widget api repo 1", widgetCategories: [] },
				{ apiRepoId: 2, apiRepoName: "widget api repo 2", widgetCategories: [] },
			]),
		]);

		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
						<div>
							<p classes={[c.text_muted, c.text_center]}>无部件</p>
						</div>
					</div>
					<div key="2">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 2</span>
						</div>
						<div>
							<p classes={[c.text_muted, c.text_center]}>无部件</p>
						</div>
					</div>
				</div>
			</div>
		));
	});

	it("fold repo pane", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);

		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		// 加载完成，返回两个空的部件仓库
		mockStore((path) => [
			replace(path("repoWidgets"), [{ apiRepoId: 1, apiRepoName: "widget api repo 1", widgetCategories: [] }]),
		]);

		h.trigger(`.${css.repoNameBar}`, "onclick");

		// 如果 API 仓库下没有分类，则提示没有部件
		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-right" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
					</div>
				</div>
			</div>
		));

		h.trigger(`.${css.repoNameBar}`, "onclick");

		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
						<div>
							<p classes={[c.text_muted, c.text_center]}>无部件</p>
						</div>
					</div>
				</div>
			</div>
		));
	});

	it("如果分类下没有部件，则过滤掉此分类", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);
		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		mockStore((path) => [
			replace(path("repoWidgets"), [
				{ apiRepoId: 1, apiRepoName: "widget api repo 1", widgetCategories: [{ name: "c1", widgets: [] }] },
			]),
		]);

		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
						<div>
							<p classes={[c.text_muted, c.text_center]}>无部件</p>
						</div>
					</div>
				</div>
			</div>
		));
	});

	it("显示部件", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);
		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		mockStore((path) => [
			replace(path("repoWidgets"), [
				{
					apiRepoId: 1,
					apiRepoName: "widget api repo 1",
					widgetCategories: [
						{
							name: "category 1",
							widgets: [
								{
									widgetCode: "0001",
									widgetId: 1,
									widgetName: "widget 1",
									canHasChildren: false,
									apiRepoId: 1,
									properties: [],
								},
							],
						},
					],
				},
			]),
		]);

		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
						<div>
							<div key="category 1">
								<div classes={[c.pl_1, c.text_muted, css.categoryNameBar]} onclick={() => {}}>
									<FontAwesomeIcon icon="angle-down" />
									<span classes={[c.ml_1]}>category 1</span>
								</div>
								<div>
									<ul classes={[css.widgetGroup]}>
										<li key="1" classes={[css.widgetItem]} onclick={() => {}}>
											<svg classes={[css.widgetItemIcon]}>
												<use href="#widget 1"></use>
											</svg>
											<span classes={[css.widgetItemlabel]}>widget 1</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		));
	});

	it("fold category pane", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);
		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		mockStore((path) => [
			replace(path("repoWidgets"), [
				{
					apiRepoId: 1,
					apiRepoName: "widget api repo 1",
					widgetCategories: [
						{
							name: "category 1",
							widgets: [
								{
									widgetCode: "0001",
									widgetId: 1,
									widgetName: "widget 1",
									canHasChildren: false,
									apiRepoId: 1,
									properties: [],
								},
							],
						},
					],
				},
			]),
		]);

		h.trigger(`.${css.categoryNameBar}`, "onclick");

		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
						<div>
							<div key="category 1">
								<div classes={[c.pl_1, c.text_muted, css.categoryNameBar]} onclick={() => {}}>
									<FontAwesomeIcon icon="angle-right" />
									<span classes={[c.ml_1]}>category 1</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		));

		// 切换
		h.trigger(`.${css.categoryNameBar}`, "onclick");

		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
						<div>
							<div key="category 1">
								<div classes={[c.pl_1, c.text_muted, css.categoryNameBar]} onclick={() => {}}>
									<FontAwesomeIcon icon="angle-down" />
									<span classes={[c.ml_1]}>category 1</span>
								</div>
								<div>
									<ul classes={[css.widgetGroup]}>
										<li key="1" classes={[css.widgetItem]} onclick={() => {}}>
											<svg classes={[css.widgetItemIcon]}>
												<use href="#widget 1"></use>
											</svg>
											<span classes={[css.widgetItemlabel]}>widget 1</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		));
	});

	it("如果部件未分类，则都归到 _ 下", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);
		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		mockStore((path) => [
			replace(path("repoWidgets"), [
				{
					apiRepoId: 1,
					apiRepoName: "widget api repo 1",
					widgetCategories: [
						{
							name: "_", // 未分类
							widgets: [
								{
									widgetCode: "0001",
									widgetId: 1,
									widgetName: "widget 1",
									canHasChildren: false,
									apiRepoId: 1,
									properties: [],
								},
							],
						},
					],
				},
			]),
		]);

		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value=""
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
						<div>
							<div key="_">
								<div classes={[c.pl_1, c.text_muted, css.categoryNameBar]} onclick={() => {}}>
									<FontAwesomeIcon icon="angle-down" />
									<span classes={[c.ml_1]}>未分类</span>
								</div>
								<div>
									<ul classes={[css.widgetGroup]}>
										<li key="1" classes={[css.widgetItem]} onclick={() => {}}>
											<svg classes={[css.widgetItemIcon]}>
												<use href="#widget 1"></use>
											</svg>
											<span classes={[css.widgetItemlabel]}>widget 1</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		));
	});

	it("搜索部件", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);
		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		mockStore((path) => [
			replace(path("repoWidgets"), [
				{
					apiRepoId: 1,
					apiRepoName: "widget api repo 1",
					widgetCategories: [
						{
							name: "_", // 未分类
							widgets: [
								{
									widgetCode: "0001",
									widgetId: 1,
									widgetName: "widget 1",
									canHasChildren: false,
									apiRepoId: 1,
									properties: [],
								},
							],
						},
					],
				},
			]),
		]);

		h.trigger("@search", "oninput", { target: { value: "a" } });

		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value="a"
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
						<div>
							<p classes={[c.text_muted, c.text_center]}>无部件</p>
						</div>
					</div>
				</div>
			</div>
		));

		// 忽略大小写
		h.trigger("@search", "oninput", { target: { value: "W" } });
		h.expect(() => (
			<div>
				<div classes={[c.mt_1]}>
					<input
						key="search"
						classes={[c.form_control, c.form_control_sm, css.searchInput]}
						placeholder="搜索部件"
						oninput={() => {}}
						value="W"
					/>
				</div>
				<div>
					<div key="1">
						<div classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]} onclick={() => {}}>
							<FontAwesomeIcon icon="angle-down" />
							<span classes={[c.ml_1]}>widget api repo 1</span>
						</div>
						<div>
							<div key="_">
								<div classes={[c.pl_1, c.text_muted, css.categoryNameBar]} onclick={() => {}}>
									<FontAwesomeIcon icon="angle-down" />
									<span classes={[c.ml_1]}>未分类</span>
								</div>
								<div>
									<ul classes={[css.widgetGroup]}>
										<li key="1" classes={[css.widgetItem]} onclick={() => {}}>
											<svg classes={[css.widgetItemIcon]}>
												<use href="#widget 1"></use>
											</svg>
											<span classes={[css.widgetItemlabel]}>widget 1</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		));
	});
});
