import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { add, replace, remove } from "@dojo/framework/stores/state/operations";
import { PageData } from "designer-core/interfaces";
import { uuid } from "@dojo/framework/core/util";
import { findIndex } from "@dojo/framework/shim/array";
import { getAllChildCount, inferNextActiveNodeIndex, getPreviousIndex, getNextIndex } from "../utils/pageTree";

const insertEmptyDataItemCommand = commandFactory(({ get, path, at }) => {
	// 默认添加在距离父节点最近的位置，参考自 vscode 中的在文件夹下新建文件的逻辑
	const pageData = get(path("pageModel", "data"));
	const selectedBehaviorIndex = get(path("selectedBehaviorIndex")) || 0;
	const selectedBehaviorData = pageData[selectedBehaviorIndex];
	let parentId = "";
	if (selectedBehaviorData.type === "Array" || selectedBehaviorData.type === "Object") {
		parentId = selectedBehaviorData.id;
	} else {
		parentId = selectedBehaviorData.parentId;
	}

	// 紧挨着选中的节点
	const insertedIndex = selectedBehaviorIndex + 1;
	const dataItem: PageData = {
		id: uuid().replace(/-/g, ""),
		type: "String",
		parentId,
		name: "",
		value: "",
		open: false
	};
	return [add(at(path("pageModel", "data"), insertedIndex), dataItem)];
});

const activeDataItemCommand = commandFactory(({ payload: { id }, get, path, at }) => {
	const pageData = get(path("pageModel", "data"));
	const selectedIndex = findIndex(pageData, (item) => {
		return item.id === id;
	});
	return [replace(path("selectedBehaviorIndex"), selectedIndex)];
});

const changeActiveDataPropertyCommand = commandFactory(({ payload: { name, value }, at, get, path }) => {
	const selectedBehaviorIndex = get(path("selectedBehaviorIndex")) || 0;
	const selectedPageDataPath = at(path("pageModel", "data"), selectedBehaviorIndex);

	return [replace(path(selectedPageDataPath, name), value)];
});

const foldDataCommand = commandFactory(({ payload: { id }, get, path, at }) => {
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
	const selectedBehaviorIndex = get(path("selectedBehaviorIndex")) || 0;
	if (selectedBehaviorIndex === 0) {
		console.warn("不能删除根节点！");
		return;
	}
	const result = [];

	const pageData = get(path("pageModel", "data"));
	const allChildCount = getAllChildCount(pageData, selectedBehaviorIndex);
	for (let i = 0; i <= allChildCount; i++) {
		result.push(remove(at(path("pageModel", "data"), selectedBehaviorIndex)));
	}
	// 重新聚焦
	const newSelectedBehaviorIndex = inferNextActiveNodeIndex(pageData, selectedBehaviorIndex);
	if (newSelectedBehaviorIndex > -1) {
		result.push(replace(path("selectedBehaviorIndex"), newSelectedBehaviorIndex));
	}

	return result;
});

const moveUpActiveDataItemCommand = commandFactory(({ get, path, at }) => {
	const pageData = get(path("pageModel", "data"));
	const selectedBehaviorIndex = get(path("selectedBehaviorIndex"));

	const previousNodeIndex = getPreviousIndex(pageData, selectedBehaviorIndex);
	if (previousNodeIndex === -1) {
		return [];
	}

	// 将选中的数据节点及其所有子节点移到前一个兄弟节点之前
	// 获取当前选中节点的所有子节点个数
	const allChildCount = getAllChildCount(pageData, selectedBehaviorIndex);
	// 因为目前 dojo store 不支持 move operation，所以先 remove 再 add
	const result = [];
	for (let i = selectedBehaviorIndex; i <= selectedBehaviorIndex + allChildCount; i++) {
		result.push(remove(at(path("pageModel", "data"), i)));
	}
	for (let i = selectedBehaviorIndex, j = previousNodeIndex; i <= selectedBehaviorIndex + allChildCount; i++, j++) {
		result.push(add(at(path("pageModel", "data"), j), pageData[i]));
	}
	// selectedBehaviorIndex 的值没有改变
	result.push(replace(path("selectedBehaviorIndex"), previousNodeIndex));

	result.push(replace(path("dirty"), true));
	return result;
});

const moveDownActiveDataItemCommand = commandFactory(({ get, path, at }) => {
	const pageData = get(path("pageModel", "data"));
	const selectedBehaviorIndex = get(path("selectedBehaviorIndex"));

	const nextNodeIndex = getNextIndex(pageData, selectedBehaviorIndex);
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
	for (let i = nextNodeIndex, j = selectedBehaviorIndex; i <= nextNodeIndex + allNextNodeChildCount; i++, j++) {
		result.push(add(at(path("pageModel", "data"), j), pageData[i]));
	}
	// activeWidgetId 的值没有改变
	result.push(
		replace(path("selectedBehaviorIndex"), selectedBehaviorIndex + 1 /*表示 next node*/ + allNextNodeChildCount)
	);

	result.push(replace(path("dirty"), true));
	return result;
});

export const insertDataProcess = createProcess("insert-data-process", [insertEmptyDataItemCommand]);
export const activeDataProcess = createProcess("active-data-process", [activeDataItemCommand]);
export const changeActiveDataPropertyProcess = createProcess("change-active-data-property-process", [
	changeActiveDataPropertyCommand
]);
export const foldDataProcess = createProcess("fold-data-process", [foldDataCommand]);
export const removeActiveDataProcess = createProcess("remove-data-process", [removeActiveDataItemCommand]);
export const moveUpActiveDataProcess = createProcess("move-up-data-process", [moveUpActiveDataItemCommand]);
export const moveDownActiveDataProcess = createProcess("move-down-data-process", [moveDownActiveDataItemCommand]);
