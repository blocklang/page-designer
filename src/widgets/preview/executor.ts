import { changeDataItemValueProcess } from "../../processes/pageDataProcesses";
import { find } from "@dojo/framework/shim/array";
import { PageFunction } from "designer-core/interfaces";

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

	// 找到下一个节点
	const sequenceConnect = find(
		sequenceConnections,
		(sc) => sc.fromNode === firstNode.id && sc.fromOutput === firstOsp.id
	);
	if (!sequenceConnect) {
		// 没有连接线，则不再往后执行
		return;
	}

	const nextNode = find(nodes, (node) => node.id === sequenceConnect.toNode);
	if (!nextNode) {
		return;
	}
	// 从这个节点起开始执行
	if (nextNode.category === "variableSet") {
		// 找到输入参数
		// 不能直接传 eventValue，需要根据 dataConnections 判断
		// Set 只有一个输入参数
		const dc = find(
			dataConnections,
			(dc) => dc.toNode === nextNode.id && dc.toInput === nextNode.inputDataPorts[0].id
		);
		let value = "";
		if (dc) {
			if (dc.fromNode === firstNode.id && dc.fromOutput === firstNode.outputDataPorts[0].id) {
				value = eventValue;
			}
		}
		store.executor(changeDataItemValueProcess)({ dataItemId: nextNode.dataItemId, value });
	}
}
