import { changeDataItemValueProcess } from "../../processes/pageDataProcesses";
import { find } from "@dojo/framework/shim/array";
import { PageFunction, VisualNode } from "designer-core/interfaces";
import { getValue } from "designer-core/utils/pageDataUtil";

/**
 * 执行函数
 *
 * 因为 page Data 是设计器内置的功能，所以此处将 variableSet、 variableGet 等组件的代码放在设计器中，而不是第三方的组件中。
 */
export function execute(store: any, func: PageFunction, eventValue: string) {
	const { nodes = [], sequenceConnections, dataConnections } = func;

	if (nodes.length === 0) {
		return;
	}
	// 从第一个节点开始执行，先找到输出型序列端口
	// 第一个节点是函数定义节点，只能包含一个输出型序列端口
	const firstNode = nodes[0];
	const firstOsp = firstNode.outputSequencePorts[0];
	if (!firstOsp) {
		return;
	}

	const pageData = store.get(store.path("pageModel", "data")) || [];
	let nextNode: VisualNode | undefined = firstNode;

	while ((nextNode = findNextNode(nextNode))) {
		// 从这个节点起开始执行
		if (nextNode.category === "variableSet") {
			// 找到输入参数
			// 不能直接传 eventValue，需要根据 dataConnections 判断
			// Set 只有一个输入参数
			const dc = find(
				dataConnections,
				(dc) => dc.toNode === nextNode!.id && dc.toInput === nextNode!.inputDataPorts[0].id
			);
			let value = "";
			if (dc) {
				if (dc.fromNode === firstNode.id && dc.fromOutput === firstNode.outputDataPorts[0].id) {
					// 如果连接线的起点是函数定义节点
					value = eventValue;
				} else {
					// 如果连接线的起点是 variableGet 节点
					const previousNode = find(nodes, (node) => node.id === dc.fromNode);
					if (previousNode && previousNode.category === "variableGet") {
						value = getValue(pageData, previousNode.dataItemId!);
					}
				}
			} else {
				// 如果没有通过连接线设置值，则尝试获取节点的默认值
				value = nextNode.inputDataPorts[0].value || "";
			}
			store.executor(changeDataItemValueProcess)({ dataItemId: nextNode.dataItemId, value });
		}
	}

	function findNextNode(node: VisualNode): VisualNode | undefined {
		const sequenceConnect = find(
			sequenceConnections,
			(sc) => sc.fromNode === node.id && sc.fromOutput === node.outputSequencePorts[0].id
		);
		if (!sequenceConnect) {
			// 没有连接线，则不再往后执行
			return;
		}

		return find(nodes, (node) => node.id === sequenceConnect.toNode);
	}
}
