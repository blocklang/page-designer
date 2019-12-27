import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { add, replace, remove } from "@dojo/framework/stores/state/operations";
import { PageData } from "../interfaces";
import { uuid } from "@dojo/framework/core/util";
import { findIndex } from "@dojo/framework/shim/array";
import { getAllChildCount, inferNextActiveNodeIndex } from "../utils/pageTree";

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

export const insertDataProcess = createProcess("insert-data-process", [insertEmptyDataItemCommand]);
export const activeDataProcess = createProcess("active-data-process", [activeDataItemCommand]);
export const changeActiveDataPropertyProcess = createProcess("change-active-data-property-process", [
	changeActiveDataPropertyCommand
]);
export const foldDataProcess = createProcess("fold-data-process", [foldDataCommand]);
export const removeActiveDataProcess = createProcess("remove-data-process", [removeActiveDataItemCommand]);
