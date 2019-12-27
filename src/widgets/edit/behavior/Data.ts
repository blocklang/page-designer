import { create, v, w } from "@dojo/framework/core/vdom";
import store from "../../../store";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as c from "bootstrap-classes";
import { config } from "../../../config";
import * as css from "./Data.m.css";
import {
	insertDataProcess,
	changeActiveDataPropertyProcess,
	activeDataProcess,
	foldDataProcess,
	removeActiveDataProcess
} from "../../../processes/dataProcesses";
import { PageData } from "../../../interfaces";
import * as $ from "jquery";
import "bootstrap";

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

	const pageData = get(path("pageModel", "data")) || [];
	const selectedBehaviorIndex = get(path("selectedBehaviorIndex")) || 0;
	const activeDataItemId = pageData[selectedBehaviorIndex].id;

	return v("div", { key: "root" }, [
		v(
			"div",
			{
				classes: [c.border, activeDataItemId === data[0].id ? c.border_primary : c.border_white],
				onmouseup: (event: MouseEvent) => {
					event.stopPropagation();
					executor(activeDataProcess)({ id: data[0].id });
				}
			},
			[
				v(
					"span",
					{
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
						classes: [c.ml_3],
						onclick: (event: MouseEvent) => {
							event.stopPropagation();
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
				{ classes: [c.ml_4] },
				data
					.filter((item) => item.parentId !== config.rootDataParentId)
					.map((item, index) =>
						v(
							"div",
							{
								key: `${item.id}-${index}`,
								classes: [c.border, activeDataItemId === item.id ? c.border_primary : c.border_white],
								onmouseup: (event: MouseEvent) => {
									event.stopPropagation();
									executor(activeDataProcess)({ id: item.id });
								}
							},
							[
								v("input", {
									value: `${item.name}`,
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
								}),
								v("span", { classes: [c.dropdown, c.ml_1] }, [
									v(
										"button",
										{
											classes: [c.btn, c.btn_secondary, c.btn_sm, c.dropdown_toggle],
											type: "button",
											key: `dataType-${index}`,
											"data-toggle": "dropdown",
											"aria-haspopup": "true",
											"aria-expanded": "false",
											onclick: (event: MouseEvent) => {
												($(event.srcElement!) as any).dropdown();
											}
										},
										[`${item.type}`]
									),
									v(
										"div",
										{ classes: [c.dropdown_menu], "aria-labelledby": `dataType-${index}` },
										dataTypes.map((dataType) =>
											v(
												"a",
												{
													classes: [
														c.dropdown_item,
														dataType === item.type ? c.active : undefined
													],
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
								]),
								item.type === "Boolean"
									? v("input", {
											type: "checkbox",
											checked: item.value === "true",
											onchange: (event: MouseEvent) => {
												const target = event.target as HTMLInputElement;
												executor(changeActiveDataPropertyProcess)({
													name: "value",
													value: String(target.checked)
												});
											}
									  })
									: v("input", {
											value: `${item.value}`,
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
									  }),

								activeDataItemId === item.id
									? v("span", { classes: [c.ml_3] }, [
											v(
												"span",
												{
													key: `op-add-${item.id}`,
													title: "加变量",
													onclick: (event: MouseEvent) => {
														event.stopPropagation();
														executor(insertDataProcess)({});
													}
												},
												[w(FontAwesomeIcon, { icon: "plus" })]
											),
											v(
												"span",
												{
													key: `op-remove-${item.id}`,
													title: "删除变量",
													classes: [c.ml_1],
													onclick: (event: MouseEvent) => {
														event.stopPropagation();
														executor(removeActiveDataProcess)({});
													}
												},
												[w(FontAwesomeIcon, { icon: "trash-alt" })]
											)
									  ])
									: undefined
							]
						)
					)
			)
	]);
});
