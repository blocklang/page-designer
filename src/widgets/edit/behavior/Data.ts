import { create, v, w } from "@dojo/framework/core/vdom";
import { VNode } from "@dojo/framework/core/interfaces";
import { PageDataItem } from "designer-core/interfaces";
import store from "designer-core/store";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { config } from "../../../config";
import {
	insertDataItemProcess,
	changeActiveDataItemPropertyProcess,
	activeDataItemProcess,
	foldDataGroupProcess,
	removeActiveDataItemProcess,
	moveUpActiveDataItemProcess,
	moveDownActiveDataItemProcess
} from "../../../processes/dataProcesses";
import * as $ from "jquery";
import { getChildrenIndex, getPreviousIndex, getNextIndex } from "../../../utils/pageTree";

import "bootstrap";
import * as c from "bootstrap-classes";
import * as css from "./Data.m.css";

const dataTypes = ["String", "Number", "Date", "Boolean", "Object", "Array"];

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
				"共发现 0 个数据节点，至少要存在一个根节点！"
			])
		]);
	}

	if (data[0].parentId !== config.rootDataParentId) {
		return v("div", { key: "root" }, [
			v("div", { key: "alert-not-a-root", classes: [c.alert, c.alert_danger, c.text_center], role: "alert" }, [
				"第一个节点必须是根节点，但也页面的第一个节点却不是根节点！"
			])
		]);
	}

	const pageData = data || [];
	const selectedBehaviorIndex = get(path("selectedBehaviorIndex")) || 0;
	const activeDataItemId = pageData[selectedBehaviorIndex].id;

	return v("div", { key: "root", classes: [c.ml_4] }, [
		v(
			"div",
			{
				key: `${data[0].id}-0`,
				classes: [
					c.position_relative,
					c.border,
					activeDataItemId === data[0].id ? c.border_primary : c.border_white
				],
				onclick: (event: MouseEvent) => {
					event.stopPropagation();
					executor(activeDataItemProcess)({ id: data[0].id });
				}
			},
			[
				v(
					"span",
					{
						classes: [c.position_absolute, css.icon, c.text_muted],
						onclick: () => {
							executor(foldDataGroupProcess)({ id: data[0].id });
						}
					},
					[
						data[0].open
							? w(FontAwesomeIcon, { icon: "angle-down" })
							: w(FontAwesomeIcon, { icon: "angle-right" })
					]
				),
				v("span", { classes: [c.ml_1] }, ["data（页面数据）"]),
				v(
					"span",
					{
						key: `op-add-${data[0].id}`,
						title: "加变量",
						classes: [c.ml_3, c.text_muted],
						onclick: (event: MouseEvent) => {
							event.stopPropagation();
							if (!data[0].open) {
								executor(foldDataGroupProcess)({ id: data[0].id });
							}
							executor(insertDataItemProcess)({});
						}
					},
					[w(FontAwesomeIcon, { icon: "plus" })]
				)
			]
		),
		data.length > 1 &&
			data[0].open &&
			v(
				"div",
				{
					key: `${data[0].id}-0-children`,
					classes: [c.pl_4, c.border_left]
				},
				_renderChildren(data, data[0], 1, activeDataItemId, selectedBehaviorIndex, executor)
			)
	]);
});

function _renderChildren(
	pageData: PageDataItem[],
	currentData: PageDataItem,
	firstChildIndex: number,
	activeDataItemId: string,
	selectedBehaviorIndex: number,
	executor: any
): VNode[] {
	const children = getChildrenIndex(pageData, currentData.id, firstChildIndex);
	let result: VNode[] = [];
	for (let i = 0; i < children.length; i++) {
		const eachData = pageData[children[i]];
		result.push(
			_renderDataItem(eachData, i, currentData, activeDataItemId, pageData, selectedBehaviorIndex, executor)
		);

		if (eachData.open) {
			const subChildren = _renderChildren(
				pageData,
				eachData,
				children[i] + 1,
				activeDataItemId,
				selectedBehaviorIndex,
				executor
			);
			if (subChildren.length > 0) {
				result.push(
					v("div", { key: `${currentData.id}-${i}-children`, classes: [c.pl_4, c.border_left] }, subChildren)
				);
			}
		}
	}
	return result;
}

function _renderDataItem(
	data: PageDataItem,
	index: number,
	parentData: PageDataItem,
	activeDataItemId: string,
	allData: PageDataItem[],
	selectedBehaviorIndex: number,
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
			}
		},
		[
			_renderIcon(data, executor),
			_renderVariableName(data, index, parentData, executor),
			_renderDataType(data, index, executor),
			_renderDefaultValue(data, executor),
			_renderOperators(data, activeDataItemId, allData, selectedBehaviorIndex, executor)
		]
	);
}

function _renderIcon(dataItem: PageDataItem, executor: any): VNode | undefined {
	if (dataItem.type === "Object" || dataItem.type === "Array") {
		return v(
			"span",
			{
				key: "icon",
				classes: [c.position_absolute, css.icon, c.text_muted],
				onclick: () => {
					executor(foldDataGroupProcess)({ id: dataItem.id });
				}
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
		return v("span", { key: "variable", classes: [c.mr_1] }, [`${index}`]);
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
				value: target.value
			});
		}
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
	return v("span", { key: "dataType", classes: [c.dropdown, c.ml_1] }, [
		v(
			"button",
			{
				classes: [c.btn, c.btn_outline_secondary, c.btn_sm, c.dropdown_toggle],
				type: "button",
				key: `dataType-button`,
				"data-toggle": "dropdown",
				"aria-haspopup": "true",
				"aria-expanded": "false",
				onclick: (event: MouseEvent) => {
					($(event.srcElement!) as any).dropdown();
				}
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
								value: dataType
							});
						}
					},
					[dataType]
				)
			)
		)
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
			checked: dataItem.value === "true",
			classes: [c.ml_1],
			onchange: (event: MouseEvent) => {
				const target = event.target as HTMLInputElement;
				executor(changeActiveDataItemPropertyProcess)({
					name: "value",
					value: String(target.checked)
				});
			}
		});
	}

	if (dataItem.type === "String" || dataItem.type === "Number" || dataItem.type === "Date") {
		return v("input", {
			key: "defaultValue",
			value: dataItem.value,
			type: "text",
			classes: [c.form_control, c.form_control_sm, c.ml_1, css.defaultValue],
			oninput: (event: KeyboardEvent) => {
				const target = event.target as HTMLInputElement;
				// TODO: 校验数据的有效性
				executor(changeActiveDataItemPropertyProcess)({
					name: "value",
					value: target.value
				});
			}
		});
	}

	// 如果是 Object 或 Array，则不显示默认值。
}

function _renderOperators(
	dataItem: PageDataItem,
	activeDataItemId: string,
	allData: PageDataItem[],
	selectedBehaviorIndex: number,
	executor: any
): VNode | undefined {
	const isActive = activeDataItemId === dataItem.id;
	if (!isActive) {
		return;
	}

	const ops = [
		v(
			"span",
			{
				key: `op-add-${dataItem.id}`,
				classes: [c.text_muted],
				title: "加变量",
				onclick: (event: MouseEvent) => {
					event.stopPropagation();
					if (!dataItem.open) {
						executor(foldDataGroupProcess)({ id: dataItem.id });
					}
					executor(insertDataItemProcess)({});
				}
			},
			[w(FontAwesomeIcon, { icon: "plus" })]
		)
	];

	const activeDataIsFirst = getPreviousIndex(allData, selectedBehaviorIndex) === -1;
	if (!activeDataIsFirst) {
		ops.push(
			v(
				"span",
				{
					key: `op-up-${dataItem.id}`,
					classes: [c.ml_1, c.text_muted],
					title: "上移",
					onclick: (event: MouseEvent) => {
						event.stopPropagation();
						// 上移
						executor(moveUpActiveDataItemProcess)({});
					}
				},
				[w(FontAwesomeIcon, { icon: "arrow-up" })]
			)
		);
	}

	const activeDataIsLast = getNextIndex(allData, selectedBehaviorIndex) === -1;
	if (!activeDataIsLast) {
		ops.push(
			v(
				"span",
				{
					key: `op-down-${dataItem.id}`,
					classes: [c.ml_1, c.text_muted],
					title: "下移",
					onclick: (event: MouseEvent) => {
						event.stopPropagation();
						// 下移
						executor(moveDownActiveDataItemProcess)({});
					}
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
				classes: [c.ml_1, c.text_muted],
				onclick: (event: MouseEvent) => {
					event.stopPropagation();
					executor(removeActiveDataItemProcess)({});
				}
			},
			[w(FontAwesomeIcon, { icon: "trash-alt" })]
		)
	);

	return v("span", { classes: [c.ml_3] }, ops);
}
