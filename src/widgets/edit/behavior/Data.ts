import { create, v, w } from "@dojo/framework/core/vdom";
import store from "../../../store";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { config } from "../../../config";
import {
	insertDataProcess,
	changeActiveDataPropertyProcess,
	activeDataProcess,
	foldDataProcess,
	removeActiveDataProcess,
	moveUpActiveDataProcess,
	moveDownActiveDataProcess
} from "../../../processes/dataProcesses";
import { PageData } from "../../../interfaces";
import * as $ from "jquery";
import { VNode } from "@dojo/framework/core/interfaces";
import { getChildrenIndex, getPreviousIndex, getNextIndex } from "../../../utils/pageTree";

import "bootstrap";
import * as c from "bootstrap-classes";
import * as css from "./Data.m.css";

const dataTypes = ["String", "Number", "Date", "Boolean", "Object", "Array"];

export interface DataProperties {
	data: PageData[];
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
					executor(activeDataProcess)({ id: data[0].id });
				}
			},
			[
				v(
					"span",
					{
						classes: [c.position_absolute, css.icon, c.text_muted],
						onclick: () => {
							executor(foldDataProcess)({ id: data[0].id });
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
								executor(foldDataProcess)({ id: data[0].id });
							}
							executor(insertDataProcess)({});
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
	pageData: PageData[],
	data: PageData,
	firstChildIndex: number,
	activeDataItemId: string,
	selectedBehaviorIndex: number,
	executor: any
): VNode[] {
	const children = getChildrenIndex(pageData, data.id, firstChildIndex);
	let result: VNode[] = [];
	for (let i = 0; i < children.length; i++) {
		const eachData = pageData[children[i]];
		result.push(_renderDataItem(eachData, i, data, activeDataItemId, pageData, selectedBehaviorIndex, executor));

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
					v("div", { key: `${data.id}-${i}-children`, classes: [c.pl_4, c.border_left] }, subChildren)
				);
			}
		}
	}
	return result;
}

function _renderDataItem(
	data: PageData,
	index: number,
	parentData: PageData,
	activeDataItemId: string,
	allData: PageData[],
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
				executor(activeDataProcess)({ id: data.id });
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

function _renderIcon(data: PageData, executor: any): VNode | undefined {
	if (data.type === "Object" || data.type === "Array") {
		return v(
			"span",
			{
				key: "icon",
				classes: [c.position_absolute, css.icon, c.text_muted],
				onclick: () => {
					executor(foldDataProcess)({ id: data.id });
				}
			},
			[data.open ? w(FontAwesomeIcon, { icon: "angle-down" }) : w(FontAwesomeIcon, { icon: "angle-right" })]
		);
	}
}

/**
 * 渲染变量名
 *
 * @param data       数据项
 * @param executor   store 执行器
 */
function _renderVariableName(data: PageData, index: number, parentData: PageData, executor: any): VNode {
	if (parentData.type === "Array") {
		return v("span", { key: "variable", classes: [c.mr_1] }, [`${index}`]);
	}

	return v("input", {
		key: "variable",
		value: data.name,
		type: "text",
		classes: [c.form_control, c.form_control_sm, css.variableName],
		placeholder: "变量名(英文字母、数字、‘_’)",
		oninput: (event: KeyboardEvent) => {
			const target = event.target as HTMLInputElement;
			// TODO: 校验数据的有效性
			executor(changeActiveDataPropertyProcess)({
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
function _renderDataType(data: PageData, index: number, executor: any): VNode {
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
			[`${data.type}`]
		),
		v(
			"div",
			{ classes: [c.dropdown_menu] },
			dataTypes.map((dataType) =>
				v(
					"a",
					{
						classes: [c.dropdown_item, dataType === data.type ? c.active : undefined],
						href: "#",
						onclick: (event: MouseEvent) => {
							event.preventDefault();
							executor(changeActiveDataPropertyProcess)({
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
function _renderDefaultValue(data: PageData, executor: any): VNode | undefined {
	if (data.type === "Boolean") {
		return v("input", {
			key: "defaultValue",
			type: "checkbox",
			checked: data.value === "true",
			classes: [c.ml_1],
			onchange: (event: MouseEvent) => {
				const target = event.target as HTMLInputElement;
				executor(changeActiveDataPropertyProcess)({
					name: "value",
					value: String(target.checked)
				});
			}
		});
	}

	if (data.type === "String" || data.type === "Number" || data.type === "Date") {
		return v("input", {
			key: "defaultValue",
			value: data.value,
			type: "text",
			classes: [c.form_control, c.form_control_sm, c.ml_1, css.defaultValue],
			oninput: (event: KeyboardEvent) => {
				const target = event.target as HTMLInputElement;
				// TODO: 校验数据的有效性
				executor(changeActiveDataPropertyProcess)({
					name: "value",
					value: target.value
				});
			}
		});
	}

	// 如果是 Object 或 Array，则不显示默认值。
}

function _renderOperators(
	data: PageData,
	activeDataItemId: string,
	allData: PageData[],
	selectedBehaviorIndex: number,
	executor: any
): VNode | undefined {
	const isActive = activeDataItemId === data.id;
	if (!isActive) {
		return;
	}

	const ops = [
		v(
			"span",
			{
				key: `op-add-${data.id}`,
				classes: [c.text_muted],
				title: "加变量",
				onclick: (event: MouseEvent) => {
					event.stopPropagation();
					if (!data.open) {
						executor(foldDataProcess)({ id: data.id });
					}
					executor(insertDataProcess)({});
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
					key: `op-up-${data.id}`,
					classes: [c.ml_1, c.text_muted],
					title: "上移",
					onclick: (event: MouseEvent) => {
						event.stopPropagation();
						// 上移
						executor(moveUpActiveDataProcess)({});
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
					key: `op-down-${data.id}`,
					classes: [c.ml_1, c.text_muted],
					title: "下移",
					onclick: (event: MouseEvent) => {
						event.stopPropagation();
						// 下移
						executor(moveDownActiveDataProcess)({});
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
				key: `op-remove-${data.id}`,
				title: "删除变量",
				classes: [c.ml_1, c.text_muted],
				onclick: (event: MouseEvent) => {
					event.stopPropagation();
					executor(removeActiveDataProcess)({});
				}
			},
			[w(FontAwesomeIcon, { icon: "trash-alt" })]
		)
	);

	return v("span", { classes: [c.ml_3] }, ops);
}
