const { describe, it } = intern.getInterface("bdd");

import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import { add, replace } from "@dojo/framework/stores/state/operations";
import * as c from "bootstrap-classes";
import { stub } from "sinon";

import WidgetsTab from "../../../../../../src/widgets/ui-view/operate-pane/widgets-tab";
import { State } from "../../../../../../src/interfaces";
import { getWidgetsProcess } from "../../../../../../src/processes/widgetProcesses";
import store from "../../../../../../src/store";

describe("ui-view/operate-pane/widgets-tab", () => {
	it("No widget repo", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);
		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<div>
				<div classes={[c.m_1]}>
					<input classes={[c.form_control]} placeholder="搜索部件" />
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
		mockStore((path) => [add(path("widgetRepos"), [])]);
		h.expect(() => (
			<div>
				<div classes={[c.m_1]}>
					<input classes={[c.form_control]} placeholder="搜索部件" />
				</div>
				<div>
					<p classes={[c.text_muted, c.text_center]}>
						请在 <strong>DEPENDENCE.json</strong> 中添加部件仓库
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
			replace(path("widgetRepos"), [
				{ apiRepoId: 1, apiRepoName: "widget api repo 1", widgetCategories: [] },
				{ apiRepoId: 2, apiRepoName: "widget api repo 2", widgetCategories: [] }
			])
		]);
		// 如果 API 仓库下没有分类，则提示没有部件
		h.expect(() => (
			<div>
				<div classes={[c.m_1]}>
					<input classes={[c.form_control]} placeholder="搜索部件" />
				</div>
				<div>
					<div key="1">
						<div>widget api repo 1</div>
						<div>
							<p classes={[c.text_muted, c.text_center]}>无部件</p>
						</div>
					</div>
					<div key="2">
						<div>widget api repo 2</div>
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
			replace(path("widgetRepos"), [
				{ apiRepoId: 1, apiRepoName: "widget api repo 1", widgetCategories: [{ name: "c1", widgets: [] }] }
			])
		]);

		h.expect(() => (
			<div>
				<div classes={[c.m_1]}>
					<input classes={[c.form_control]} placeholder="搜索部件" />
				</div>
				<div>
					<div key="1">
						<div>widget api repo 1</div>
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
			replace(path("widgetRepos"), [
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
									iconClass: ""
								}
							]
						}
					]
				}
			])
		]);

		h.expect(() => (
			<div>
				<div classes={[c.m_1]}>
					<input classes={[c.form_control]} placeholder="搜索部件" />
				</div>
				<div>
					<div key="1">
						<div>widget api repo 1</div>
						<div>
							<div key="category 1">
								<div>category 1</div>
								<div>
									<ul>
										<li key="1">
											<span>widget 1</span>
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
