import { newFunctionDeclarationNode } from "../../../src/processes/visualNodeUtil";

const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

describe("processes/visualNodeUtil", () => {
	it("does something", () => {
		const actualVisualNode = newFunctionDeclarationNode("", {
			propertyId: "",
			name: "onValue", // 显示用
			arguments: [
				{
					id: "11",
					name: "value",
					valueType: "string",
				},
			],
		});

		assert.equal(actualVisualNode.id, "1");

		// 存储的绑定关系
		assert.equal(actualVisualNode.functionType, "Function");
		assert.equal(actualVisualNode.bindSource, "WidgetEvent");
		assert.equal(actualVisualNode.bindId, ""); // 注意：部件事件的标识要全局唯一

		assert.equal(actualVisualNode.top, 20);
		assert.equal(actualVisualNode.left, 20);
		// 以下两个字段的值推导而来，不用直接存储
		assert.equal(actualVisualNode.caption, "函数");
		assert.equal(actualVisualNode.text, "onValue"); // 来自部件事件名
		assert.equal(actualVisualNode.category, "flowControl");
		assert.isUndefined(actualVisualNode.inputSequencePort);

		assert.equal(actualVisualNode.outputSequencePorts.length, 1);
		assert.isNotEmpty(actualVisualNode.outputSequencePorts[0].id);
		assert.isEmpty(actualVisualNode.outputSequencePorts[0].text, "");

		assert.isEmpty(actualVisualNode.inputDataPorts);

		assert.equal(actualVisualNode.outputDataPorts.length, 1);
		assert.isNotEmpty(actualVisualNode.outputDataPorts[0].id);

		// 属性的绑定关系
		assert.equal(actualVisualNode.outputDataPorts[0].bindSource, "WidgetEventArgument");
		assert.equal(actualVisualNode.outputDataPorts[0].bindId, "");
		// 以下两个字段不用包含在本表中
		assert.equal(actualVisualNode.outputDataPorts[0].name, "value"); // 来自部件事件的输入参数名
		assert.equal(actualVisualNode.outputDataPorts[0].type, "string"); // 来自部件事件输入参数的类型名
	});
});
