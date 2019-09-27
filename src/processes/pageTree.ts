/**
 * 获取当前部件（由 selectedIndex 指定）的**所有**子节点的个数，包含孙子节点。
 *
 * @param treeNodes           数据列表
 * @param selectedIndex       当前部件的索引
 * @returns                   返回所有子节点的个数
 */
export function getAllChildCount<T extends { id: string; parentId: string }>(
	treeNodes: T[],
	selectedIndex: number
): number {
	const dataLength = treeNodes.length;
	if (dataLength === 0) {
		return 0;
	}
	if (selectedIndex >= dataLength) {
		throw `超出索引：treeNodes 中共有 ${dataLength} 个元素，不存在索引为 ${selectedIndex} 的元素。`;
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
			const eachModel = treeNodes[i];
			if (eachModel.parentId === parentId) {
				parentIds.push({ parentId: eachModel.id, firstChildIndex: i + 1 });
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
