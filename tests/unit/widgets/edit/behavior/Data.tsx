const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as c from "bootstrap-classes";

import Data from "../../../../../src/widgets/edit/behavior/Data";
import * as css from "../../../../../src/widgets/edit/behavior/Data.m.css";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State, PageDataItem } from "designer-core/interfaces";
import store from "designer-core/store";
import { replace } from "@dojo/framework/stores/state/operations";

describe("edit/behavior/data", () => {
	it("load, should has one root data", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Data data={[]} />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<div key="root">
				<div key="alert-has-no-root" classes={[c.alert, c.alert_danger, c.text_center]} role="alert">
					共发现 0 个数据节点，至少要存在一个根节点！
				</div>
			</div>
		));
	});

	it("load, first node must be root data", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "invalid parent id",
				name: "str",
				value: "a string value",
				type: "String",
				open: false,
			},
		];
		const h = harness(() => <Data data={pageData} />, { middleware: [[store, mockStore]] });

		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);
		h.expect(() => (
			<div key="root">
				<div key="alert-not-a-root" classes={[c.alert, c.alert_danger, c.text_center]} role="alert">
					第一个节点必须是根节点！
				</div>
			</div>
		));
	});

	// TODO: 默认获取焦点

	it("load complete, only has one node", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "str",
				type: "Object",
				open: true,
			},
		];
		const h = harness(() => <Data data={pageData} />, { middleware: [[store, mockStore]] });

		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);

		h.expect(() => (
			<div key="root" classes={[c.ml_4]}>
				<div key="1-0" classes={[c.position_relative, c.border, c.border_primary]} onclick={() => {}}>
					<span classes={[c.position_absolute, css.icon, c.text_muted]} onclick={() => {}}>
						<FontAwesomeIcon icon="angle-down" />
					</span>
					<span classes={[c.ml_1]}>data（页面数据）</span>
					<span key="op-add-1" title="加变量" classes={[c.ml_3, c.text_muted]} onclick={() => {}}>
						<FontAwesomeIcon icon="plus" />
					</span>
				</div>
			</div>
		));
	});

	// 默认展开
	it("load with a string variable", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "root",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "str",
				value: "a string value",
				type: "String",
				open: false,
			},
		];
		const h = harness(() => <Data data={pageData} />, { middleware: [[store, mockStore]] });
		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);

		h.expectPartial("@1-0-children", () => (
			<div key="1-0-children" classes={[c.pl_4, c.border_left]}>
				{
					// index 不是全页面的，而是当前兄弟节点内排序
				}
				<div key="2-0" classes={[c.position_relative, c.border, c.border_white]} onmouseup={() => {}}>
					<input
						key="variable"
						value="str"
						type="text"
						classes={[c.form_control, c.form_control_sm, css.variableName]}
						placeholder="变量名(英文字母、数字、‘_’)"
						oninput={() => {}}
					/>
					<span key="dataType" classes={[c.dropdown, c.ml_1]}>
						<button
							classes={[c.btn, c.btn_outline_secondary, c.btn_sm, c.dropdown_toggle]}
							type="button"
							key="dataType-button"
							data-toggle="dropdown"
							aria-haspopup="true"
							aria-expanded="false"
							onclick={() => {}}
						>
							String
						</button>
						<div classes={[c.dropdown_menu]}>
							<a classes={[c.dropdown_item, c.active]} href="#" onclick={() => {}}>
								String
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Number
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Date
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Boolean
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Object
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Array
							</a>
						</div>
					</span>
					<input
						key="defaultValue"
						value="a string value"
						type="text"
						classes={[c.form_control, c.form_control_sm, c.ml_1, css.defaultValue]}
						oninput={() => {}}
					/>
				</div>
			</div>
		));
	});

	it("load with a number variable", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "root",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "num",
				value: "1",
				type: "Number",
				open: false,
			},
		];
		const h = harness(() => <Data data={pageData} />, { middleware: [[store, mockStore]] });
		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);

		h.expectPartial("@1-0-children", () => (
			<div key="1-0-children" classes={[c.pl_4, c.border_left]}>
				{
					// index 不是全页面的，而是当前兄弟节点内排序
				}
				<div key="2-0" classes={[c.position_relative, c.border, c.border_white]} onmouseup={() => {}}>
					<input
						key="variable"
						value="num"
						type="text"
						classes={[c.form_control, c.form_control_sm, css.variableName]}
						placeholder="变量名(英文字母、数字、‘_’)"
						oninput={() => {}}
					/>
					<span key="dataType" classes={[c.dropdown, c.ml_1]}>
						<button
							classes={[c.btn, c.btn_outline_secondary, c.btn_sm, c.dropdown_toggle]}
							type="button"
							key="dataType-button"
							data-toggle="dropdown"
							aria-haspopup="true"
							aria-expanded="false"
							onclick={() => {}}
						>
							Number
						</button>
						<div classes={[c.dropdown_menu]}>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								String
							</a>
							<a classes={[c.dropdown_item, c.active]} href="#" onclick={() => {}}>
								Number
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Date
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Boolean
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Object
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Array
							</a>
						</div>
					</span>
					<input
						key="defaultValue"
						value="1"
						type="text"
						classes={[c.form_control, c.form_control_sm, c.ml_1, css.defaultValue]}
						oninput={() => {}}
					/>
				</div>
			</div>
		));
	});

	it("load with a object variable", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "root",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "obj",
				type: "Object",
				open: false,
			},
		];
		const h = harness(() => <Data data={pageData} />, { middleware: [[store, mockStore]] });
		mockStore((path) => [replace(path("pageModel", "data"), pageData)]);

		h.expectPartial("@1-0-children", () => (
			<div key="1-0-children" classes={[c.pl_4, c.border_left]}>
				{
					// index 不是全页面的，而是当前兄弟节点内排序
				}
				<div key="2-0" classes={[c.position_relative, c.border, c.border_white]} onmouseup={() => {}}>
					<span key="icon" classes={[c.position_absolute, css.icon, c.text_muted]} onclick={() => {}}>
						<FontAwesomeIcon icon="angle-right" />
					</span>
					<input
						key="variable"
						value="obj"
						type="text"
						classes={[c.form_control, c.form_control_sm, css.variableName]}
						placeholder="变量名(英文字母、数字、‘_’)"
						oninput={() => {}}
					/>
					<span key="dataType" classes={[c.dropdown, c.ml_1]}>
						<button
							classes={[c.btn, c.btn_outline_secondary, c.btn_sm, c.dropdown_toggle]}
							type="button"
							key="dataType-button"
							data-toggle="dropdown"
							aria-haspopup="true"
							aria-expanded="false"
							onclick={() => {}}
						>
							Object
						</button>
						<div classes={[c.dropdown_menu]}>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								String
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Number
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Date
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Boolean
							</a>
							<a classes={[c.dropdown_item, c.active]} href="#" onclick={() => {}}>
								Object
							</a>
							<a classes={[c.dropdown_item, undefined]} href="#" onclick={() => {}}>
								Array
							</a>
						</div>
					</span>
				</div>
			</div>
		));
	});
});
