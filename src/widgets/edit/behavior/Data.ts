import { create, v, w } from "@dojo/framework/core/vdom";
import { VNode } from "@dojo/framework/core/interfaces";
import { PageDataItem } from "@blocklang/designer-core/interfaces";
import store from "@blocklang/designer-core/store";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";
import { config } from "../../../config";
import {
	insertDataItemProcess,
	changeActiveDataItemPropertyProcess,
	activeDataItemProcess,
	foldDataGroupProcess,
	removeActiveDataItemProcess,
	moveUpActiveDataItemProcess,
	moveDownActiveDataItemProcess,
} from "../../../processes/pageDataProcesses";
import { getChildrenIndex, getPreviousIndex, getNextIndex } from "@blocklang/designer-core/utils/treeUtil";

import Dropdown from "bootstrap/js/dist/dropdown";
import * as c from "@blocklang/bootstrap-classes";
import * as css from "./Data.m.css";
import { addVariableGetNodeProcess, addVariableSetNodeProcess } from "../../../processes/pageFunctionProcesses";

const dataTypes = ["String", "Number", "Date", "Boolean", "Object", "Array"];

function _renderIcon(dataItem: PageDataItem, executor: any): VNode | undefined {
	if (dataItem.type === "Object" || dataItem.type === "Array") {
		return v(
			"span",
			{
				key: "icon",
				classes: [c.position_absolute, css.icon, c.text_muted],
				onclick: () => {
					executor(foldDataGroupProcess)({ id: dataItem.id });
				},
			},
			[dataItem.open ? w(FontAwesomeIcon, { icon: "angle-down" }) : w(FontAwesomeIcon, { icon: "angle-right" })]
		);
	}
}

/**
 * 渲染变量名
 *
 * @param data       数据项
 * @param executor   store 执行器
 */
function _renderVariableName(
	dataItem: PageDataItem,
	index: number,
	parentDataItem: PageDataItem,
	executor: any
): VNode {
	if (parentDataItem.type === "Array") {
		return v("span", { key: "variable", classes: [c.me_1] }, [`${index}`]);
	}

	return v("input", {
		key: "variable",
		value: dataItem.name,
		type: "text",
		classes: [c.form_control, c.form_control_sm, css.variableName],
		placeholder: "变量名(英文字母、数字、‘_’)",
		oninput: (event: KeyboardEvent) => {
			const target = event.target as HTMLInputElement;
			// TODO: 校验数据的有效性
			executor(changeActiveDataItemPropertyProcess)({
				name: "name",
				value: target.value,
			});
		},
	});
}
/**
 * 渲染变量类型
 *
 * @param data       数据项
 * @param index      数据的索引值
 * @param executor   store 执行器
 */
function _renderDataType(dataItem: PageDataItem, index: number, executor: any): VNode {
	return v("span", { key: "dataType", classes: [c.dropdown, c.ms_1] }, [
		v(
			"button",
			{
				classes: [c.btn, c.btn_outline_secondary, c.btn_sm, c.dropdown_toggle],
				type: "button",
				key: `dataType-button`,
				"data-bs-toggle": "dropdown",
				"aria-haspopup": "true",
				"aria-expanded": "false",
				onclick: (event: MouseEvent<HTMLButtonElement>) => {
					const dropdown = new Dropdown(event.target);
					dropdown.show();
				},
			},
			[`${dataItem.type}`]
		),
		v(
			"div",
			{ classes: [c.dropdown_menu] },
			dataTypes.map((dataType) =>
				v(
					"a",
					{
						classes: [c.dropdown_item, dataType === dataItem.type ? c.active : undefined],
						href: "#",
						onclick: (event: MouseEvent) => {
							event.preventDefault();
							executor(changeActiveDataItemPropertyProcess)({
								name: "type",
								value: dataType,
							});
						},
					},
					[dataType]
				)
			)
		),
	]);
}

/**
 * 渲染默认值
 *
 * @param data       数据项
 * @param executor   store 执行器
 */
function _renderDefaultValue(dataItem: PageDataItem, executor: any): VNode | undefined {
	if (dataItem.type === "Boolean") {
		return v("input", {
			key: "defaultValue",
			type: "checkbox",
			checked: dataItem.defaultValue === "true",
			title: "默认值",
			classes: [c.ms_1],
			onchange: (event: MouseEvent) => {
				const target = event.target as HTMLInputElement;
				executor(changeActiveDataItemPropertyProcess)({
					name: "defaultValue",
					value: String(target.checked),
				});
			},
		});
	}

	if (dataItem.type === "String" || dataItem.type === "Number" || dataItem.type === "Date") {
		return v("input", {
			key: "defaultValue",
			value: dataItem.defaultValue,
			placeholder: "默认值",
			type: "text",
			classes: [c.form_control, c.form_control_sm, c.ms_1, css.defaultValue],
			oninput: (event: KeyboardEvent) => {
				const target = event.target as HTMLInputElement;
				// TODO: 校验数据的有效性
				executor(changeActiveDataItemPropertyProcess)({
					name: "defaultValue",
					value: target.value,
				});
			},
		});
	}

	// 如果是 Object 或 Array，则不显示默认值。
}

function _renderOperators(
	dataItem: PageDataItem,
	activeDataItemId: string,
	allData: PageDataItem[],
	selectedDataItemIndex: number,
	selectedFunctionId: string,
	executor: any
): VNode | undefined {
	const isActive = activeDataItemId === dataItem.id;
	if (!isActive) {
		return;
	}

	const ops = [];

	// 为数据项添加 Getter 和 Setter 按钮，要满足一个条件：
	// 1. 当前有选中一个事件
	if (selectedFunctionId) {
		ops.push(
			v(
				"span",
				{
					classes: [c.text_muted, css.op, css.getter],
					title: "在函数设计器中添加 Get 节点",
					onclick: (event: MouseEvent) => {
						event.stopPropagation();
						executor(addVariableGetNodeProcess)({ dataItem });
					},
				},
				["Get"]
			)
		);
		ops.push(
			v(
				"span",
				{
					classes: [c.text_muted, c.ms_1, c.me_3, css.op, css.setter],
					title: "在函数设计器中添加 Set 节点",
					onclick: (event: MouseEvent) => {
						event.stopPropagation();
						executor(addVariableSetNodeProcess)({ dataItem });
					},
				},
				["Set"]
			)
		);
	}

	ops.push(
		v(
			"span",
			{
				key: `op-add-${dataItem.id}`,
				classes: [c.text_muted, css.op],
				title: "加变量",
				onclick: (event: MouseEvent) => {
					event.stopPropagation();
					if (!dataItem.open) {
						executor(foldDataGroupProcess)({ id: dataItem.id });
					}
					executor(insertDataItemProcess)({});
				},
			},
			[w(FontAwesomeIcon, { icon: "plus" })]
		)
	);

	const activeDataIsFirst = getPreviousIndex(allData, selectedDataItemIndex) === -1;
	if (!activeDataIsFirst) {
		ops.push(
			v(
				"span",
				{
					key: `op-up-${dataItem.id}`,
					classes: [c.ms_1, c.text_muted, css.op],
					title: "上移",
					onclick: (event: MouseEvent) => {
						event.stopPropagation();
						// 上移
						executor(moveUpActiveDataItemProcess)({});
					},
				},
				[w(FontAwesomeIcon, { icon: "arrow-up" })]
			)
		);
	}

	const activeDataIsLast = getNextIndex(allData, selectedDataItemIndex) === -1;
	if (!activeDataIsLast) {
		ops.push(
			v(
				"span",
				{
					key: `op-down-${dataItem.id}`,
					classes: [c.ms_1, c.text_muted, css.op],
					title: "下移",
					onclick: (event: MouseEvent) => {
						event.stopPropagation();
						// 下移
						executor(moveDownActiveDataItemProcess)({});
					},
				},
				[w(FontAwesomeIcon, { icon: "arrow-down" })]
			)
		);
	}

	ops.push(
		v(
			"span",
			{
				key: `op-remove-${dataItem.id}`,
				title: "删除变量",
				classes: [c.ms_1, c.text_muted, css.op],
				onclick: (event: MouseEvent) => {
					event.stopPropagation();
					executor(removeActiveDataItemProcess)({});
				},
			},
			[w(FontAwesomeIcon, { icon: "trash-alt" })]
		)
	);

	return v("span", { classes: [c.ms_3] }, ops);
}

function _renderDataItem(
	data: PageDataItem,
	index: number,
	parentData: PageDataItem,
	activeDataItemId: string,
	allData: PageDataItem[],
	selectedDataItemIndex: number,
	selectedFunctionId: string,
	executor: any
): VNode {
	return v(
		"div",
		{
			key: `${data.id}-${index}`,
			classes: [c.position_relative, c.border, activeDataItemId === data.id ? c.border_primary : c.border_white],
			// 注意：如果改为 onclick，则第一次点击数据类型的 dropdown 时没有弹出菜单。
			onmouseup: (event: MouseEvent) => {
				event.stopPropagation();
				executor(activeDataItemProcess)({ id: data.id });
			},
		},
		[
			_renderIcon(data, executor),
			_renderVariableName(data, index, parentData, executor),
			_renderDataType(data, index, executor),
			_renderDefaultValue(data, executor),
			_renderOperators(data, activeDataItemId, allData, selectedDataItemIndex, selectedFunctionId, executor),
		]
	);
}

function _renderChildren(
	pageData: PageDataItem[],
	currentData: PageDataItem,
	firstChildIndex: number,
	activeDataItemId: string,
	selectedDataItemIndex: number,
	selectedFunctionId: string,
	executor: any
): VNode[] {
	const children = getChildrenIndex(pageData, currentData.id, firstChildIndex);
	const result: VNode[] = [];
	for (let i = 0; i < children.length; i++) {
		const eachData = pageData[children[i]];
		result.push(
			_renderDataItem(
				eachData,
				i,
				currentData,
				activeDataItemId,
				pageData,
				selectedDataItemIndex,
				selectedFunctionId,
				executor
			)
		);

		if (eachData.open) {
			const subChildren = _renderChildren(
				pageData,
				eachData,
				children[i] + 1,
				activeDataItemId,
				selectedDataItemIndex,
				selectedFunctionId,
				executor
			);
			if (subChildren.length > 0) {
				result.push(
					v("div", { key: `${currentData.id}-${i}-children`, classes: [c.ps_4, c.border_start] }, subChildren)
				);
			}
		}
	}
	return result;
}

export interface DataProperties {
	data: PageDataItem[];
}

const factory = create({ store }).properties<DataProperties>();

export default factory(function Data({ properties, middleware: { store } }) {
	const { data = [] } = properties();

	const { get, path, executor } = store;

	if (data.length === 0) {
		return v("div", { key: "root" }, [
			v("div", { key: "alert-has-no-root", classes: [c.alert, c.alert_danger, c.text_center], role: "alert" }, [
				"共发现 0 个数据节点，至少要存在一个根节点！",
			]),
		]);
	}

	if (data[0].parentId !== config.rootDataParentId) {
		return v("div", { key: "root" }, [
			v("div", { key: "alert-not-a-root", classes: [c.alert, c.alert_danger, c.text_center], role: "alert" }, [
				"第一个节点必须是根节点！",
			]),
		]);
	}

	const selectedDataItemIndex = get(path("selectedDataItemIndex")) || 0;
	const activeDataItemId = data[selectedDataItemIndex].id;

	const selectedFunctionId = get(path("selectedFunctionId"));

	return v("div", { key: "root", classes: [c.ms_4] }, [
		v(
			"div",
			{
				key: `${data[0].id}-0`,
				classes: [
					c.position_relative,
					c.border,
					activeDataItemId === data[0].id ? c.border_primary : c.border_white,
				],
				onclick: (event: MouseEvent) => {
					event.stopPropagation();
					executor(activeDataItemProcess)({ id: data[0].id });
				},
			},
			[
				v(
					"span",
					{
						classes: [c.position_absolute, css.icon, c.text_muted],
						onclick: () => {
							executor(foldDataGroupProcess)({ id: data[0].id });
						},
					},
					[
						data[0].open
							? w(FontAwesomeIcon, { icon: "angle-down" })
							: w(FontAwesomeIcon, { icon: "angle-right" }),
					]
				),
				v("span", { classes: [c.ms_1] }, ["data（页面数据）"]),
				activeDataItemId === data[0].id &&
					v(
						"span",
						{
							key: `op-add-${data[0].id}`,
							title: "加变量",
							classes: [c.ms_3, c.text_muted, css.op],
							onclick: (event: MouseEvent) => {
								event.stopPropagation();
								if (!data[0].open) {
									executor(foldDataGroupProcess)({ id: data[0].id });
								}
								executor(insertDataItemProcess)({});
							},
						},
						[w(FontAwesomeIcon, { icon: "plus" })]
					),
			]
		),
		data.length > 1 &&
			data[0].open &&
			v(
				"div",
				{
					key: `${data[0].id}-0-children`,
					classes: [c.ps_4, c.border_start],
				},
				_renderChildren(data, data[0], 1, activeDataItemId, selectedDataItemIndex, selectedFunctionId, executor)
			),
	]);
});
