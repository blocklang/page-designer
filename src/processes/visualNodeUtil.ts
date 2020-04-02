import { VisualNode, WidgetProperty } from "designer-core/interfaces";
import { uuid } from "@dojo/framework/core/util";

// 如 caption 等字段的值是从其他接口中读过来的，并不会做冗余存储
// 但设置这些值时有两种时机：
// 1. 加载到页面中后不会再改变，则在服务器端设置值
// 2. 在页面中会改变的值，则在每次渲染时设置值

/**
 * 创建一个函数定义节点
 *
 * @param functionDeclaration 函数定义信息
 */
export function newFunctionDeclarationNode(functionId: string, widgetProperty: WidgetProperty): VisualNode {
	const { arguments = [] } = widgetProperty;
	const node: VisualNode = {
		id: functionId,
		// 默认放置位置
		top: 20,
		left: 20,
		caption: "函数",
		text: widgetProperty.name,
		category: "flowControl",
		inputSequencePort: undefined,
		outputSequencePorts: [
			{
				id: uuid().replace(/-/g, ""),
				text: "",
			},
		],
		inputDataPorts: [],
		outputDataPorts: arguments.map((arg) => ({
			id: uuid().replace(/-/g, ""),
			name: arg.name,
			type: arg.valueType,
		})),
	};

	return node;
}
