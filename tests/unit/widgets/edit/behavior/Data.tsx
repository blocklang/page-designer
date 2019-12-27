const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as c from "bootstrap-classes";

import Data from "../../../../../src/widgets/edit/behavior/Data";
import * as css from "../../../../../src/widgets/edit/behavior/Data.m.css";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State, PageData } from "../../../../../src/interfaces";
import store from "../../../../../src/store";
import { replace } from "@dojo/framework/stores/state/operations";

describe("edit/behavior/data", () => {
	it("loading", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Data />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<div key="root">
				<div key="loading" classes={[c.spinner_border, c.text_secondary]} role="status">
					<span classes={[c.sr_only]}>Loading...</span>
				</div>
			</div>
		));
	});

	it("load, should has one root data", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Data />, { middleware: [[store, mockStore]] });

		const pageData: PageData[] = [];
		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);
		h.expect(() => (
			<div key="root">
				<div key="alert-has-no-root" classes={[c.alert, c.alert_danger]} role="alert">
					共发现 0 个数据节点，至少要存在一个根节点！
				</div>
			</div>
		));
	});

	it("load, first node must be root data", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Data />, { middleware: [[store, mockStore]] });

		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "invalid parent id",
				name: "str",
				value: "a string value",
				type: "String",
				open: false
			}
		];
		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);
		h.expect(() => (
			<div key="root">
				<div key="alert-not-a-root" classes={[c.alert, c.alert_danger]} role="alert">
					第一个节点必须是根节点，但也页面的第一个节点却不是根节点！
				</div>
			</div>
		));
	});

	// TODO: 默认获取焦点

	it("load complete, only has one node", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Data />, { middleware: [[store, mockStore]] });

		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "str",
				type: "Object",
				open: true
			}
		];
		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);

		h.expect(() => (
			<div key="root">
				<div>
					<span onclick={() => {}}>
						<FontAwesomeIcon icon="angle-down" />
					</span>
					<span classes={[c.ml_1]}>data（页面数据）</span>
					<span key="op-add-1" title="加变量" classes={[c.ml_3]} onclick={() => {}}>
						<FontAwesomeIcon icon="plus" />
					</span>
				</div>
			</div>
		));
	});

	// 默认展开
	it("load with a string variable", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Data />, { middleware: [[store, mockStore]] });

		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "root",
				type: "Object",
				open: true
			},
			{
				id: "2",
				parentId: "1",
				name: "str",
				value: "a string value",
				type: "String",
				open: false
			}
		];
		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);

		h.expect(() => (
			<div key="root">
				<div>
					<span onclick={() => {}}>
						<FontAwesomeIcon icon="angle-down" />
					</span>
					<span classes={[c.ml_1]}>data（页面数据）</span>
					<span key="op-add-1" title="加变量" classes={[c.ml_3]} onclick={() => {}}>
						<FontAwesomeIcon icon="plus" />
					</span>
				</div>
				<div classes={[c.ml_4]}>
					<div>
						<input value="str" type="text" classes={[css.variableName]} />
						<span classes={[c.dropdown]}>
							<button
								classes={[c.btn, c.btn_secondary, c.dropdown_toggle]}
								type="button"
								data-toggle="dropdown"
								aria-haspopup="true"
								aria-expanded="false"
							>
								String
							</button>
							<div classes={[c.dropdown_menu]}>
								<a classes={[c.dropdown_item, c.active]} href="#">
									String
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Number
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Date
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Boolean
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Object
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Array
								</a>
							</div>
						</span>
						<input value="a string value" type="text" classes={[css.defaultValue]} />
					</div>
				</div>
			</div>
		));
	});

	it("load with a number variable", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Data />, { middleware: [[store, mockStore]] });

		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "root",
				type: "Object",
				open: true
			},
			{
				id: "2",
				parentId: "1",
				name: "num",
				value: "1",
				type: "Number",
				open: false
			}
		];
		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);

		h.expect(() => (
			<div key="root">
				<div>
					<span onclick={() => {}}>
						<FontAwesomeIcon icon="angle-down" />
					</span>
					<span classes={[c.ml_1]}>data（页面数据）</span>
					<span key="op-add-1" title="加变量" classes={[c.ml_3]} onclick={() => {}}>
						<FontAwesomeIcon icon="plus" />
					</span>
				</div>
				<div classes={[c.ml_4]}>
					<div>
						<input value="num" type="text" classes={[css.variableName]} />
						<span classes={[c.dropdown]}>
							<button
								classes={[c.btn, c.btn_secondary, c.dropdown_toggle]}
								type="button"
								data-toggle="dropdown"
								aria-haspopup="true"
								aria-expanded="false"
							>
								Number
							</button>
							<div classes={[c.dropdown_menu]}>
								<a classes={[c.dropdown_item, undefined]} href="#">
									String
								</a>
								<a classes={[c.dropdown_item, c.active]} href="#">
									Number
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Date
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Boolean
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Object
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Array
								</a>
							</div>
						</span>
						<input value="1" type="text" classes={[css.defaultValue]} />
					</div>
				</div>
			</div>
		));
	});

	it("trigger add event: to add a variable", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Data />, { middleware: [[store, mockStore]] });

		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "root",
				type: "Object",
				open: true
			},
			{
				id: "2",
				parentId: "1",
				name: "",
				type: "String",
				open: false,
				value: ""
			}
		];
		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);

		h.expect(() => (
			<div key="root">
				<div>
					<span onclick={() => {}}>
						<FontAwesomeIcon icon="angle-down" />
					</span>
					<span classes={[c.ml_1]}>data（页面数据）</span>
					<span key="op-add-1" title="加变量" classes={[c.ml_3]} onclick={() => {}}>
						<FontAwesomeIcon icon="plus" />
					</span>
				</div>
				<div classes={[c.ml_4]}>
					<div>
						<input value="" type="text" classes={[css.variableName]} />
						<span classes={[c.dropdown]}>
							<button
								classes={[c.btn, c.btn_secondary, c.dropdown_toggle]}
								type="button"
								data-toggle="dropdown"
								aria-haspopup="true"
								aria-expanded="false"
							>
								String
							</button>
							<div classes={[c.dropdown_menu]}>
								<a classes={[c.dropdown_item, c.active]} href="#">
									String
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Number
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Date
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Boolean
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Object
								</a>
								<a classes={[c.dropdown_item, undefined]} href="#">
									Array
								</a>
							</div>
						</span>
						<input value="" type="text" classes={[css.defaultValue]} />
					</div>
				</div>
			</div>
		));
	});
});
