import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { add, replace, remove } from "@dojo/framework/stores/state/operations";
import { PageDataItem, NodeConnection } from "@blocklang/designer-core/interfaces";
import { uuid } from "@dojo/framework/core/util";
import { findIndex } from "@dojo/framework/shim/array";
import {
	getAllChildCount,
	inferNextActiveNodeIndex,
	getPreviousIndex,
	getNextIndex,
} from "@blocklang/designer-core/utils/treeUtil";

const insertEmptyDataItemCommand = commandFactory(({ get, path, at }) => {
	// 默认添加在距离父节点最近的位置，参考自 vscode 中的在文件夹下新建文件的逻辑
	const pageData = get(path("pageModel", "data"));
	const selectedDataItemIndex = get(path("selectedDataItemIndex")) || 0;
	const selectedDataItem = pageData[selectedDataItemIndex];
	let parentId = "";
	if (selectedDataItem.type === "Array" || selectedDataItem.type === "Object") {
		parentId = selectedDataItem.id;
	} else {
		parentId = selectedDataItem.parentId;
	}

	// 紧挨着选中的节点
	const insertedIndex = selectedDataItemIndex + 1;
	const dataItem: PageDataItem = {
		id: uuid().replace(/-/g, ""),
		type: "String",
		parentId,
		name: "",
		defaultValue: "",
		open: false,
	};
	return [add(at(path("pageModel", "data"), insertedIndex), dataItem)];
});

const activeDataItemCommand = commandFactory(({ payload: { id }, get, path, at }) => {
	const pageData = get(path("pageModel", "data"));
	const selectedIndex = findIndex(pageData, (item) => {
		return item.id === id;
	});
	return [replace(path("selectedDataItemIndex"), selectedIndex)];
});

const changeActiveDataItemPropertyCommand = commandFactory<{ name: keyof PageDataItem; value: string }>(
	({ payload: { name, value }, at, get, path }) => {
		const selectedDataItemIndex = get(path("selectedDataItemIndex")) || 0;

		const result = [];

		if (name === "name" || name === "type") {
			// 不能只修改当前选中的函数，而是要检查页面中的所有函数
			// 当变量名和变量类型发生变化时，尝试修改 functions/nodes/ 中的数据
			const pageData = get(path("pageModel", "data")) || [];
			const selectedDataItem = pageData[selectedDataItemIndex];
			// 找到所有 dataItemId 为 selectedDataItem.id 的所有 getter 和 setter 节点

			const functions = get(path("pageModel", "functions")) || [];
			functions.forEach((func, funcIndex) => {
				const nodes = func.nodes || [];
				const functionPath = at(path("pageModel", "functions"), funcIndex);

				nodes.forEach((node, index) => {
					if (node.dataItemId && node.dataItemId === selectedDataItem.id) {
						const currentNodePath = at(path(functionPath, "nodes"), index);
						if (name === "name") {
							// 修改了变量名
							const caption = node.category === "variableGet" ? `Get ${value}` : `Set ${value}`;
							result.push(replace(path(currentNodePath, "caption"), caption));
						} else if (name === "type") {
							// 修改变量类型
							// variableGet 和 variableSet 的端口都是固定不变的
							if (node.category === "variableGet") {
								result.push(
									replace(path(at(path(currentNodePath, "outputDataPorts"), 0), "type"), value)
								);
							} else if (node.category === "variableSet") {
								result.push(
									replace(path(at(path(currentNodePath, "inputDataPorts"), 0), "type"), value)
								);
							}
						}
					}
				});
			});
		}

		const selectedPageDataPath = at(path("pageModel", "data"), selectedDataItemIndex);
		result.push(replace(path(selectedPageDataPath, name), value));

		return result;
	}
);

/**
 * 在运行时设置值
 */
const changeDataItemValueCommand = commandFactory<{ dataItemId: string; value: string }>(
	({ at, get, path, payload: { dataItemId, value } }) => {
		// TODO: 如果是 Object 或 Array，需要修改对应的子项

		const allData = get(path("pageModel", "data")) || [];
		const dataItemIndex = findIndex(allData, (dataItem) => dataItem.id === dataItemId);

		const dataItemPath = at(path("pageModel", "data"), dataItemIndex);
		return [replace(path(dataItemPath, "value"), value)];
	}
);

const foldDataGroupCommand = commandFactory(({ payload: { id }, get, path, at }) => {
	const pageData = get(path("pageModel", "data"));
	const selectedIndex = findIndex(pageData, (item) => {
		return item.id === id;
	});

	if (selectedIndex === -1) {
		return;
	}

	const foldedPageDataPath = at(path("pageModel", "data"), selectedIndex);
	const foldedPageDataItem = pageData[selectedIndex];
	return [replace(path(foldedPageDataPath, "open"), !foldedPageDataItem.open)];
});

const removeActiveDataItemCommand = commandFactory(({ get, path, at }) => {
	const selectedDataItemIndex = get(path("selectedDataItemIndex")) || 0;
	if (selectedDataItemIndex === 0) {
		console.warn("不能删除根节点！");
		return;
	}
	const result = [];

	const pageData = get(path("pageModel", "data"));
	const allChildCount = getAllChildCount(pageData, selectedDataItemIndex);
	// 删除当前数据项及其所有子数据项
	for (let i = 0; i <= allChildCount; i++) {
		result.push(remove(at(path("pageModel", "data"), selectedDataItemIndex)));
	}

	// 删除 functions 中的 getter 和 setter，包括要删除所有的子数据项，包括对应的连接

	// 不能只删除当前选中的函数中的节点，要检查页面中的所有函数

	const functions = get(path("pageModel", "functions")) || [];
	const selectedFunctionNodeId = get(path("selectedFunctionNodeId"));
	functions.forEach((func, funcIndex) => {
		const funcNodes = func.nodes;

		for (let i = 0; i <= allChildCount; i++) {
			// 1. 获取 data item id
			const dataItem = pageData[selectedDataItemIndex + i];

			// 2. 确定是否包含对应的 getter 和 setter node
			// 3. 删除节点上的连接
			funcNodes
				.filter((node) => node.dataItemId && node.dataItemId === dataItem.id)
				.forEach((node) => {
					// 4. 如果当前节点已选中，则删除选中信息
					if (selectedFunctionNodeId && selectedFunctionNodeId === node.id) {
						result.push(remove(path("selectedFunctionNodeId")));
					}

					// 5. 如果当前节点上有连线，则删除所有连线
					const sequenceConnections = func.sequenceConnections || [];
					if (findIndex(sequenceConnections, (connection) => isConnected(node.id, connection)) > -1) {
						result.push(
							replace(
								path(at(path("pageModel", "functions"), funcIndex), "sequenceConnections"),
								sequenceConnections.filter((connection) => !isConnected(node.id, connection))
							)
						);
					}

					const dataConnections = func.dataConnections || [];
					if (findIndex(dataConnections, (connection) => isConnected(node.id, connection)) > -1) {
						result.push(
							replace(
								path(at(path("pageModel", "functions"), funcIndex), "dataConnections"),
								dataConnections.filter((connection) => !isConnected(node.id, connection))
							)
						);
					}
				});

			// 6. 删除匹配的节点
			result.push(
				replace(
					path(at(path("pageModel", "functions"), funcIndex), "nodes"),
					funcNodes.filter((node) => !(node.dataItemId && node.dataItemId === dataItem.id))
				)
			);
		}
	});

	// 重新聚焦
	const newSelectedDataItemIndex = inferNextActiveNodeIndex(pageData, selectedDataItemIndex);
	if (newSelectedDataItemIndex > -1) {
		result.push(replace(path("selectedDataItemIndex"), newSelectedDataItemIndex));
	}

	return result;
});

function isConnected(nodeId: string, connection: NodeConnection) {
	return connection.fromNode === nodeId || connection.toNode === nodeId;
}

const moveUpActiveDataItemCommand = commandFactory(({ get, path, at }) => {
	const pageData = get(path("pageModel", "data"));
	const selectedDataItemIndex = get(path("selectedDataItemIndex"));

	const previousNodeIndex = getPreviousIndex(pageData, selectedDataItemIndex);
	if (previousNodeIndex === -1) {
		return [];
	}

	// 将选中的数据节点及其所有子节点移到前一个兄弟节点之前
	// 获取当前选中节点的所有子节点个数
	const allChildCount = getAllChildCount(pageData, selectedDataItemIndex);
	// 因为目前 dojo store 不支持 move operation，所以先 remove 再 add
	const result = [];
	for (let i = selectedDataItemIndex; i <= selectedDataItemIndex + allChildCount; i++) {
		result.push(remove(at(path("pageModel", "data"), i)));
	}
	for (let i = selectedDataItemIndex, j = previousNodeIndex; i <= selectedDataItemIndex + allChildCount; i++, j++) {
		result.push(add(at(path("pageModel", "data"), j), pageData[i]));
	}
	// selectedDataItemIndex 的值没有改变
	result.push(replace(path("selectedDataItemIndex"), previousNodeIndex));

	result.push(replace(path("dirty"), true));
	return result;
});

const moveDownActiveDataItemCommand = commandFactory(({ get, path, at }) => {
	const pageData = get(path("pageModel", "data"));
	const selectedDataItemIndex = get(path("selectedDataItemIndex"));

	const nextNodeIndex = getNextIndex(pageData, selectedDataItemIndex);
	if (nextNodeIndex === -1) {
		return [];
	}

	// 将选中节点及其所有子节点移到后一个兄弟节点的所有子节点之后
	// 因为这样处理起来需要查当前节点的所有子节点个数，也要查后一个节点的所有子节点个数
	// 为了减少一次查询，将逻辑调整为将后一个节点移到当前节点之前，这样效果是一样的。

	// 获取后一个节点的所有子节点个数
	const allNextNodeChildCount = getAllChildCount(pageData, nextNodeIndex);
	// 因为目前 dojo store 不支持 move operation，所以先 remove 再 add
	const result = [];
	for (let i = nextNodeIndex; i <= nextNodeIndex + allNextNodeChildCount; i++) {
		result.push(remove(at(path("pageModel", "data"), i)));
	}
	for (let i = nextNodeIndex, j = selectedDataItemIndex; i <= nextNodeIndex + allNextNodeChildCount; i++, j++) {
		result.push(add(at(path("pageModel", "data"), j), pageData[i]));
	}
	// activeWidgetId 的值没有改变
	result.push(
		replace(path("selectedDataItemIndex"), selectedDataItemIndex + 1 /*表示 next node*/ + allNextNodeChildCount)
	);

	result.push(replace(path("dirty"), true));
	return result;
});

export const insertDataItemProcess = createProcess("insert-data-item-process", [insertEmptyDataItemCommand]);
export const activeDataItemProcess = createProcess("active-data-item-process", [activeDataItemCommand]);
export const changeActiveDataItemPropertyProcess = createProcess("change-active-data-item-property-process", [
	changeActiveDataItemPropertyCommand,
]);
export const changeDataItemValueProcess = createProcess("change-data-item-value", [changeDataItemValueCommand]);
export const foldDataGroupProcess = createProcess("fold-data-group-process", [foldDataGroupCommand]);
export const removeActiveDataItemProcess = createProcess("remove-data-item-process", [removeActiveDataItemCommand]);
export const moveUpActiveDataItemProcess = createProcess("move-up-data-item-process", [moveUpActiveDataItemCommand]);
export const moveDownActiveDataItemProcess = createProcess("move-down-data-item-process", [
	moveDownActiveDataItemCommand,
]);
