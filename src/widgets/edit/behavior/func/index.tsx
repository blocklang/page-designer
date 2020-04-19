import { create, tsx, invalidator } from "@dojo/framework/core/vdom";
import { PageFunction, AttachedWidget, AttachedWidgetProperty, EventHandler } from "designer-core/interfaces";
import store from "designer-core/store";
import { drag } from "../../../../middleware/drag";
import { find } from "@dojo/framework/shim/array";
import { newFunctionProcess, activeFunctionProcess } from "../../../../processes/pageFunctionProcesses";
import dimensions from "@dojo/framework/core/middleware/dimensions";
import TitleBar from "./TitleBar";
import Editor from "./editor";
import OperatePane from "./operate-pane";

export interface EditorProperties {
	functions: PageFunction[];
	widgets: AttachedWidget[];
}

const factory = create({ store, drag, invalidator, dimensions }).properties<EditorProperties>();

export default factory(function Func({ properties, middleware: { store, drag, invalidator, dimensions } }) {
	const { widgets = [], functions = [] } = properties();

	const { get, path, executor } = store;

	function getActiveWidget(): { node: AttachedWidget; index: number } | undefined {
		if (widgets.length === 0) {
			console.warn("页面中未添加部件。");
			return;
		}

		const selectedWidgetIndex = get(path("selectedWidgetIndex"));
		if (selectedWidgetIndex == undefined || selectedWidgetIndex === -1) {
			console.warn(`selectedWidgetIndex 的值为 ${selectedWidgetIndex}。`);
			return;
		}

		const activeWidget = widgets[selectedWidgetIndex];
		if (!activeWidget) {
			console.warn(`在页面的 widgets 列表中未找到索引为 ${selectedWidgetIndex} 的部件。`);
			return;
		}

		return { node: activeWidget, index: selectedWidgetIndex };
	}

	function getActiveProperty(activeWidget: AttachedWidget): AttachedWidgetProperty | undefined {
		const selectedWidgetPropertyIndex = get(path("selectedWidgetPropertyIndex"));
		if (selectedWidgetPropertyIndex == undefined || selectedWidgetPropertyIndex === -1) {
			console.warn(`selectedWidgetPropertyIndex 的值为 ${selectedWidgetPropertyIndex}。`);
			return;
		}

		const activeWidgetProperty = activeWidget.properties[selectedWidgetPropertyIndex];
		if (!activeWidgetProperty) {
			console.warn(`在当前选中的部件中未找到索引为 ${selectedWidgetPropertyIndex} 的属性。`);
			return;
		}

		if (activeWidgetProperty.valueType !== "function") {
			console.warn(
				`只能编辑值类型为 function 的属性，但当前选中的属性值类型为 ${activeWidgetProperty.valueType}。`
			);
			return;
		}

		return activeWidgetProperty;
	}

	const activeWidget = getActiveWidget();
	const activeWidgetProperty = activeWidget && getActiveProperty(activeWidget.node);

	// FIXME: 获取函数的逻辑，应该移到父部件中去，这样就不会在每次渲染时都要重复计算当前函数
	let currentFunction;
	if (activeWidgetProperty) {
		// 部件的事件所设置的值并不是一段函数代码，而是函数定义标识
		currentFunction = find(functions, (item) => item.id === activeWidgetProperty.value);
		// 如果在 functions 中没有找到 id 标识的函数，则创建一个。
		if (!currentFunction) {
			// TODO: pageModel 中还需要存储函数定义信息，函数签名信息应该来自部件的事件定义

			// 新建一个函数
			const eventHandler: EventHandler = {
				handlerId: activeWidgetProperty.value!,
				eventName: activeWidgetProperty.name,
				eventInputArguments: activeWidgetProperty.arguments || [],
			};
			executor(newFunctionProcess)({ eventHandler });
		} else {
			executor(activeFunctionProcess)({ functionId: currentFunction.id });
		}
	}

	// 使用 dimensions 设置 OperatePane 的初始位置
	const top = currentFunction ? dimensions.get("editor").offset.top : 0;

	return (
		<div key="root">
			<TitleBar
				selectedWidgetIndex={activeWidget ? activeWidget.index : -1}
				activeWidget={activeWidget && activeWidget.node}
				widgets={activeWidget ? widgets : []}
				activeWidgetProperty={activeWidgetProperty}
			/>
			<div key="editor">
				{currentFunction && <OperatePane top={top} />}
				<Editor pageFunction={currentFunction} />
			</div>
		</div>
	);
});
