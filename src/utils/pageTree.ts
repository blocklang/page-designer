/**
 * 获取当前部件（由 selectedIndex 指定）的**所有**子节点的个数，包含孙子节点。
 *
 * @param treeNodes           数据列表
 * @param selectedIndex       当前部件的索引
 * @returns                   返回所有子节点的个数
 */
export function getAllChildCount<T extends { id: string; parentId: string }>(
	treeNodes: ReadonlyArray<T>,
	selectedIndex: number
): number {
	const dataLength = treeNodes.length;

	if (selectedIndex < 0 || dataLength <= selectedIndex) {
		throw `超出索引：treeNodes 中共有 ${dataLength} 个元素，不存在索引为 ${selectedIndex} 的元素。`;
	}

	if (dataLength === 0) {
		return 0;
	}

	// 计算部件所有子节点个数专用变量。
	let _childCount = 0;

	/**
	 * 获取一个部件的所有子部件的个数，包括子部件的子部件等
	 *
	 * @param parentId           父部件标识
	 * @param firstChildIndex    第一个子节点的索引
	 */
	function _calChildCount(parentId: string, firstChildIndex: number) {
		let parentIds = [];
		const len = treeNodes.length;
		for (let i = firstChildIndex; i < len; i++) {
			const eachNode = treeNodes[i];
			if (eachNode.parentId === parentId) {
				parentIds.push({ parentId: eachNode.id, firstChildIndex: i + 1 });
			}
		}

		var parentIdsLen = parentIds.length;
		if (parentIdsLen > 0) {
			_childCount += parentIdsLen;
			for (let i = 0; i < parentIdsLen; i++) {
				_calChildCount(parentIds[i].parentId, parentIds[i].firstChildIndex);
			}
		}
	}

	const parentId = treeNodes[selectedIndex].id;
	const firstChildIndex = selectedIndex + 1;

	_calChildCount(parentId, firstChildIndex);
	return _childCount;
}

/**
 * 获取前一个兄弟节点的索引，如果前一个兄弟节点不存在，则返回 -1
 *
 * @param treeNodes           数据列表
 * @param selectedIndex       当前部件的索引
 *
 * @returns                   前一个兄弟节点的索引，如果前一个兄弟节点不存在，则返回 -1
 */
export function getPreviousIndex<T extends { id: string; parentId: string }>(
	treeNodes: ReadonlyArray<T>,
	selectedIndex: number
): number {
	const dataLength = treeNodes.length;

	if (selectedIndex < 0 || dataLength <= selectedIndex) {
		throw `超出索引：treeNodes 中共有 ${dataLength} 个元素，不存在索引为 ${selectedIndex} 的元素。`;
	}

	// 从后往前查找，找到第一个与选择部件的 parentId 相同的节点
	const parentId = treeNodes[selectedIndex].parentId;
	for (let i = selectedIndex - 1; i > 0; i--) {
		if (treeNodes[i].parentId === parentId) {
			return i;
		}
	}

	return -1;
}

/**
 * 获取后一个兄弟节点的索引，如果后一个兄弟节点不存在，则返回 -1
 *
 * @param treeNodes           数据列表
 * @param selectedIndex       当前部件的索引
 *
 * @returns                   后一个兄弟节点的索引，如果后一个兄弟节点不存在，则返回 -1
 */
export function getNextIndex<T extends { id: string; parentId: string }>(
	treeNodes: ReadonlyArray<T>,
	selectedIndex: number
): number {
	const dataLength = treeNodes.length;

	if (selectedIndex < 0 || dataLength <= selectedIndex) {
		throw `超出索引：treeNodes 中共有 ${dataLength} 个元素，不存在索引为 ${selectedIndex} 的元素。`;
	}

	// 从 selectedIndex 开始往后查找，找到第一个与选择部件的 parentId 相同的节点
	const parentId = treeNodes[selectedIndex].parentId;
	for (let i = selectedIndex + 1; i < dataLength; i++) {
		if (treeNodes[i].parentId === parentId) {
			return i;
		}
	}

	return -1;
}

/**
 * 获取父节点的索引，如果父节点不存在，则返回 -1
 *
 * @param treeNodes           数据列表
 * @param selectedIndex       当前部件的索引
 *
 * @returns                   父节点的索引，如果父节点不存在，则返回 -1
 */
export function getParentIndex<T extends { id: string; parentId: string }>(
	treeNodes: ReadonlyArray<T>,
	selectedIndex: number
): number {
	const dataLength = treeNodes.length;

	if (selectedIndex < 0 || dataLength <= selectedIndex) {
		throw `超出索引：treeNodes 中共有 ${dataLength} 个元素，不存在索引为 ${selectedIndex} 的元素。`;
	}

	const parentId = treeNodes[selectedIndex].parentId;
	for (let i = 0; i < selectedIndex; i++) {
		if (treeNodes[i].id === parentId) {
			return i;
		}
	}

	return -1;
}

/**
 * 当选中的节点被删除后，推断出下一个获取焦点的节点信息
 *
 *  删除之后，要重新设置聚焦的部件，按以下顺序设置：
 *  1. 如果聚焦项有前一个兄弟节点，则让前一个兄弟节点聚焦
 *  2. 如果聚焦项有后一个兄弟节点，则让后一个兄弟节点聚焦
 *  3. 让父节点聚焦
 *
 * @param treeNodes          节点数组
 * @param selectedIndex      当前选中的节点索引
 *
 * @returns                  新获取焦点的节点索引，索引是基于全节点数组的
 */
export function inferNextActiveNodeIndex<T extends { id: string; parentId: string }>(
	treeNodes: ReadonlyArray<T>,
	selectedIndex: number
): number {
	// 寻找前一个兄弟节点
	const previousNodeIndex = getPreviousIndex(treeNodes, selectedIndex);
	if (previousNodeIndex > -1) {
		return previousNodeIndex;
	}

	// 寻找后一个兄弟节点
	const nextNodeIndex = getNextIndex(treeNodes, selectedIndex);
	if (nextNodeIndex > 0 /* 不需要与 -1 比较，因为前面已有一个兄弟节点 */) {
		// 要考虑在计算索引时还没有实际删除，所以索引的位置还需要再移动一次的
		// 因为会删除前一个兄弟节点，所以需要再减去 1，但是获取部件时还不能减 1，因为还没有真正删除。
		return nextNodeIndex - 1;
	}

	// 寻找父节点
	const parentNodeIndex = getParentIndex(treeNodes, selectedIndex);
	if (parentNodeIndex > -1) {
		return parentNodeIndex;
	}

	// 如果依然没有找到，则抛出异常
	throw "没有找到下一个获取焦点的节点";
}

/**
 * @function getChildrenIndex
 *
 * 获取 widgetId 对应部件的所有直属子部件的索引集合。
 *
 * @param treeNodes         数据列表
 * @param widgetId          部件 id
 * @param firstChildIndex   是第一个子部件的索引，从 firstChildIndex 位置开始查找
 *
 * @returns                 因为直属子部件的索引在列表中是不连续的，所以返回的是索引集合，而不是最后一个子部件的索引。
 */
export function getChildrenIndex<T extends { id: string; parentId: string }>(
	treeNodes: ReadonlyArray<T>,
	widgetId: string,
	firstChildIndex: number
): number[] {
	const result: number[] = [];
	const len = treeNodes.length;
	for (let i = firstChildIndex; i < len; i++) {
		if (treeNodes[i].parentId === widgetId) {
			result.push(i);
		}
	}
	return result;
}
