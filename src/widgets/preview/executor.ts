import { changeDataItemValueProcess } from "../../processes/pageDataProcesses";
import { find } from "@dojo/framework/shim/array";
import { PageFunction, VisualNode, InputDataPort, ComponentRepo } from "@blocklang/designer-core/interfaces";
import { getValue } from "@blocklang/designer-core/utils/pageDataUtil";
import * as blocklang from "@blocklang/designer-core/blocklang";

/**
 * 执行函数
 *
 * 因为 page Data 是设计器内置的功能，所以此处将 variableSet、 variableGet 等组件的代码放在设计器中，而不是第三方的组件中。
 *
 * @property ideRepos      只包含 web api
 */
export function execute(
	store: any,
	func: PageFunction,
	eventValue: string,
	ideRepos: ReadonlyArray<ComponentRepo>
): void {
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

	function getInputDataPortValue(nextNodeId: string, inputDataPort: InputDataPort): string | undefined {
		const dc = find(dataConnections, (dc) => dc.toNode === nextNodeId && dc.toInput === inputDataPort.id);
		if (!dc) {
			// 如果没有通过连接线设置值，则尝试获取节点的默认值
			return inputDataPort.value || "";
		}
		if (dc.fromNode === firstNode.id && dc.fromOutput === firstNode.outputDataPorts[0].id) {
			// 如果连接线的起点是函数定义节点
			return eventValue;
		}

		const previousNode = find(nodes, (node) => node.id === dc.fromNode);
		if (!previousNode) {
			return;
		}
		// 如果连接线的起点是 variableGet 节点
		if (previousNode.category === "variableGet" && previousNode.dataItemId) {
			return getValue(pageData, previousNode.dataItemId);
		}
	}

	function getFunc(ideRepo: ComponentRepo, objectName: string, funcName: string): any {
		const repoKey = blocklang.getRepoUrl({
			website: ideRepo.gitRepoWebsite,
			owner: ideRepo.gitRepoOwner,
			repoName: ideRepo.gitRepoName,
		});
		const obj = blocklang.findJsObject(repoKey, objectName);
		if (!obj) {
			console.error(`在 ${repoKey} 仓库中未找到 ${objectName} 对象`);
			return;
		}
		const func = (obj as any)[funcName];
		if (!func) {
			console.error(`在 ${repoKey} 仓库中的 ${objectName} 对象中未找到 ${funcName} 函数`);
			return;
		}
		return func;
	}

	while ((nextNode = findNextNode(nextNode))) {
		// 从这个节点起开始执行
		if (nextNode.category === "variableSet") {
			// 找到输入参数
			// 不能直接传 eventValue，需要根据 dataConnections 判断
			// Set 只有一个输入参数

			const nextNodeId = nextNode.id;
			const inputDataPort = nextNode.inputDataPorts[0];
			const value = getInputDataPortValue(nextNodeId, inputDataPort);
			store.executor(changeDataItemValueProcess)({ dataItemId: nextNode.dataItemId, value });
		} else if (nextNode.category === "functionCall") {
			// node 节点中存放函数信息
			const ideRepo = find(ideRepos, (item) => item.apiRepoId === (nextNode as VisualNode).apiRepoId);
			if (ideRepo) {
				const funcInfo = nextNode.funcInfo;
				if (funcInfo) {
					const func = getFunc(ideRepo, funcInfo.objectName, funcInfo.funcName);
					if (!func) {
						console.error(`未找到函数 ${nextNode.caption}`);
					} else {
						const nextNodeId = nextNode.id;
						const paramValues = nextNode.inputDataPorts.map((item) =>
							getInputDataPortValue(nextNodeId, item)
						);
						func(...paramValues);
					}
				}
			}
		}
	}
}
