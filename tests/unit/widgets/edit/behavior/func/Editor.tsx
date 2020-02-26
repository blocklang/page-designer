const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import assertionTemplate from "@dojo/framework/testing/assertionTemplate";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import Editor from "../../../../../../src/widgets/edit/behavior/func/Editor";
import * as css from "../../../../../../src/widgets/edit/behavior/func/Editor.m.css";
import * as c from "bootstrap-classes";
import { PageFunction, State } from "designer-core/interfaces";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import store from "designer-core/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import {
	activeFunctionNodeProcess,
	addSequenceConnectorProcess,
	addDataConnectorProcess
} from "../../../../../../src/processes/pageFunctionProcesses";
import { stub } from "sinon";
import { add } from "@dojo/framework/stores/state/operations";

describe("widgets/edit/behavior/func/Editor", () => {
	const baseAssertion = assertionTemplate(() => (
		<div key="root" classes={[c.border, css.root]}>
			<div classes={[c.text_center, c.text_muted, c.mt_5, c.pt_5]}>
				在“界面/操作面板/属性选项卡”中选择一个事件后，在此处定义事件处理函数。
			</div>
		</div>
	));

	it("default properties", () => {
		const h = harness(() => <Editor />);
		h.expect(baseAssertion);
	});

	it("a Function node, no output data port", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div>onValue</div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
				</div>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);
		h.expect(nodeAssertion);
	});

	// 未选中
	it("a Function node, one output data port", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div>onValue</div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div classes={[c.pl_1]}>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span
								key="odp1"
								classes={[c.px_1, css.dataPointIcon]}
								onpointerdown={() => {}}
								onpointerenter={() => {}}
								onpointerleave={() => {}}
							>
								<FontAwesomeIcon icon="circle" size="xs" />
							</span>
						</div>
					</div>
				</div>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);
		h.expect(nodeAssertion);
	});

	it("a Function node, two output data port", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div>onValue</div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div classes={[c.pl_1]}>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span
								key="odp1"
								classes={[c.px_1, css.dataPointIcon]}
								onpointerdown={() => {}}
								onpointerenter={() => {}}
								onpointerleave={() => {}}
							>
								<FontAwesomeIcon icon="circle" size="xs" />
							</span>
						</div>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div classes={[c.pl_1]}>
							<span>value2</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span
								key="odp2"
								classes={[c.px_1, css.dataPointIcon]}
								onpointerdown={() => {}}
								onpointerenter={() => {}}
								onpointerleave={() => {}}
							>
								<FontAwesomeIcon icon="circle" size="xs" />
							</span>
						</div>
					</div>
				</div>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						},
						{
							id: "odp2",
							name: "value2",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);
		h.expect(nodeAssertion);
	});

	it("a set data node", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						Set a
						<span classes={[c.float_right, c.text_white, css.close]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div
							key="isp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
						<div></div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.d_flex, c.justify_content_start]}>
							<div classes={[c.d_flex, c.align_items_center]}>
								<span
									key="idp1"
									classes={[c.px_1, css.dataPointIcon]}
									onpointerdown={() => {}}
									onpointerenter={() => {}}
									onpointerleave={() => {}}
								>
									<FontAwesomeIcon icon="circle" size="xs" />
								</span>
							</div>
							<div>
								<div>
									<small classes={[c.font_italic]}>string</small>
									<span classes={[c.ml_1]}>set</span>
								</div>
								<div>
									<input classes={[css.inputValue]} />
								</div>
							</div>
						</div>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
					</div>
				</div>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp1",
							name: "set",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);
		h.expect(nodeAssertion);
	});

	it("a get data node", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						Get a
						<span classes={[c.float_right, c.text_white, css.close]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div classes={[c.pl_1]}>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span
								key="odp1"
								classes={[c.px_1, css.dataPointIcon]}
								onpointerdown={() => {}}
								onpointerenter={() => {}}
								onpointerleave={() => {}}
							>
								<FontAwesomeIcon icon="circle" size="xs" />
							</span>
						</div>
					</div>
				</div>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Get a",
					text: "",
					category: "data",
					outputSequencePorts: [],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);
		h.expect(nodeAssertion);
	});

	// 注意 dimension.get(node) 返回的位置都为 0
	it("show sequence connection", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div>onValue</div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
				</div>,
				<div
					key="12"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "20px", left: "10px" }}
					onpointerdown={() => {}}
				>
					<div key="12-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						Set a
						<span classes={[c.float_right, c.text_white, css.close]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div
							key="isp2"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
						<div></div>
						<div
							key="osp2"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
				</div>,
				<svg
					key="sc1"
					classes={[css.svg]}
					styles={{ left: "0px", top: "0px" }}
					width="2"
					height="2"
					pointer-events="none"
				>
					<path d="M0 0 L0 0" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="none" />
				</svg>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "12",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: {
						id: "isp2"
					},
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [
				{
					id: "sc1",
					fromNode: "11",
					fromOutput: "osp1",
					toNode: "12",
					toInput: "isp2"
				}
			],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);
		h.expect(nodeAssertion);
	});

	it("show data connection", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div classes={[c.pl_1]}>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span
								key="odp1"
								classes={[c.px_1, css.dataPointIcon]}
								onpointerdown={() => {}}
								onpointerenter={() => {}}
								onpointerleave={() => {}}
							>
								<FontAwesomeIcon icon="circle" size="xs" />
							</span>
						</div>
					</div>
				</div>,
				<div
					key="12"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "20px", left: "10px" }}
					onpointerdown={() => {}}
				>
					<div key="12-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						Set a
						<span classes={[c.float_right, c.text_white, css.close]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.d_flex, c.justify_content_start]}>
							<div classes={[c.d_flex, c.align_items_center]}>
								<span
									key="idp2"
									classes={[c.px_1, css.dataPointIcon]}
									onpointerdown={() => {}}
									onpointerenter={() => {}}
									onpointerleave={() => {}}
								>
									<FontAwesomeIcon icon="circle" size="xs" />
								</span>
							</div>
							<div>
								<div>
									<small classes={[c.font_italic]}>string</small>
									<span classes={[c.ml_1]}>set</span>
								</div>
								<div>
									<input classes={[css.inputValue]} />
								</div>
							</div>
						</div>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
					</div>
				</div>,
				<svg
					key="dc1"
					classes={[css.svg]}
					styles={{ left: "0px", top: "0px" }}
					width="2"
					height="2"
					pointer-events="none"
				>
					<path d="M0 0 L0 0" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="none" />
				</svg>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string",
							left: 2,
							top: 3
						}
					]
				},
				{
					id: "12",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					outputSequencePorts: [],
					inputDataPorts: [
						{
							id: "idp2",
							name: "set",
							type: "string",
							left: 11,
							top: 21,
							connected: true
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: [
				{
					id: "dc1",
					fromNode: "11",
					fromOutput: "odp1",
					toNode: "12",
					toInput: "idp2"
				}
			]
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);
		h.expect(nodeAssertion);
	});

	it("select node", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, c.border_primary, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div>onValue</div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
				</div>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const activeFunctionNodeProcessStub = stub();
		const mockStore = createMockStoreMiddleware([[activeFunctionNodeProcess, activeFunctionNodeProcessStub]]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@11", "onpointerdown", { preventDefault: () => {} });
		assert.isTrue(activeFunctionNodeProcessStub.calledOnce);

		mockStore((path) => [add(path("selectedFunctionNodeId"), "11")]);

		// 如果已经选中，则就不再设置选中数据
		h.trigger("@11", "onpointerdown", { preventDefault: () => {} });
		assert.isTrue(activeFunctionNodeProcessStub.calledOnce);

		h.expect(nodeAssertion);
	});

	/**
	 * 注意，写连线相关的测试用例时，必须在每个测试用例后面调用 root 节点的 onpointerup 事件，以重置 isConnecting 等值
	 */

	it("start connect from FlowControl node's output sequence port", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div>onValue</div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
				</div>,
				<svg
					key="drawingConnector"
					classes={[css.svg]}
					styles={{ left: "0px", top: "0px" }}
					width="10"
					height="20"
					pointer-events="none"
				>
					<path d="M0 0 L10 20" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="none" />
				</svg>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);

		// 先点击节点上的序列输出端口
		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		// 然后触发 canvas 节点上的移动事件
		h.trigger("@root", "onpointermove", { clientX: 10, clientY: 20 });

		h.expect(nodeAssertion);

		const noSvgAssertion = nodeAssertion.remove("@drawingConnector");
		h.trigger("@root", "onpointerup");
		h.expect(noSvgAssertion);
	});

	it("start connect from Data node's output sequence port", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						Set a
						<span classes={[c.float_right, c.text_white, css.close]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div
							key="isp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
						<div></div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
				</div>,
				<svg
					key="drawingConnector"
					classes={[css.svg]}
					styles={{ left: "0px", top: "0px" }}
					width="10"
					height="20"
					pointer-events="none"
				>
					<path d="M0 0 L10 20" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="none" />
				</svg>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);

		// 先点击节点上的序列输出端口
		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		// 然后触发 canvas 节点上的移动事件
		h.trigger("@root", "onpointermove", { clientX: 10, clientY: 20 });

		h.expect(nodeAssertion);

		const noSvgAssertion = nodeAssertion.remove("@drawingConnector");
		h.trigger("@root", "onpointerup");
		h.expect(noSvgAssertion);
	});

	it("start connect from Data node's input sequence port", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						Set a
						<span classes={[c.float_right, c.text_white, css.close]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div
							key="isp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
						<div></div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
				</div>,
				<svg
					key="drawingConnector"
					classes={[css.svg]}
					styles={{ left: "0px", top: "0px" }}
					width="10"
					height="20"
					pointer-events="none"
				>
					<path d="M10 20 L0 0" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="none" />
				</svg>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);

		// 先点击节点上的序列输出端口
		h.trigger("@isp1", "onpointerdown", { clientX: 10, clientY: 20 });
		// 然后触发 canvas 节点上的移动事件
		h.trigger("@root", "onpointermove", { clientX: 0, clientY: 0 });

		h.expect(nodeAssertion);

		const noSvgAssertion = nodeAssertion.remove("@drawingConnector");
		h.trigger("@root", "onpointerup");
		h.expect(noSvgAssertion);
	});

	it("start connect from FlowControl node's output data port", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div classes={[c.pl_1]}>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span
								key="odp1"
								classes={[c.px_1, css.dataPointIcon]}
								onpointerdown={() => {}}
								onpointerenter={() => {}}
								onpointerleave={() => {}}
							>
								<FontAwesomeIcon icon="circle" size="xs" />
							</span>
						</div>
					</div>
				</div>,
				<svg
					key="drawingConnector"
					classes={[css.svg]}
					styles={{ left: "0px", top: "0px" }}
					width="10"
					height="20"
					pointer-events="none"
				>
					<path d="M0 0 L10 20" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="none" />
				</svg>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);

		// 先点击节点上的序列输出端口
		h.trigger("@odp1", "onpointerdown", { clientX: 0, clientY: 0 });
		// 然后触发 canvas 节点上的移动事件
		h.trigger("@root", "onpointermove", { clientX: 10, clientY: 20 });

		h.expect(nodeAssertion);

		const noSvgAssertion = nodeAssertion.remove("@drawingConnector");
		h.trigger("@root", "onpointerup");
		h.expect(noSvgAssertion);
	});

	it("start connect from Data node's output data port", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						Get a
						<span classes={[c.float_right, c.text_white, css.close]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
						<div classes={[c.pl_1]}>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span
								key="odp1"
								classes={[c.px_1, css.dataPointIcon]}
								onpointerdown={() => {}}
								onpointerenter={() => {}}
								onpointerleave={() => {}}
							>
								<FontAwesomeIcon icon="circle" size="xs" />
							</span>
						</div>
					</div>
				</div>,
				<svg
					key="drawingConnector"
					classes={[css.svg]}
					styles={{ left: "0px", top: "0px" }}
					width="10"
					height="20"
					pointer-events="none"
				>
					<path d="M0 0 L10 20" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="none" />
				</svg>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Get a",
					text: "",
					category: "data",
					outputSequencePorts: [],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);

		// 先点击节点上的序列输出端口
		h.trigger("@odp1", "onpointerdown", { clientX: 0, clientY: 0 });
		// 然后触发 canvas 节点上的移动事件
		h.trigger("@root", "onpointermove", { clientX: 10, clientY: 20 });

		h.expect(nodeAssertion);

		const noSvgAssertion = nodeAssertion.remove("@drawingConnector");
		h.trigger("@root", "onpointerup");
		h.expect(noSvgAssertion);
	});

	it("start connect from Data node's input data port", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, c.bg_light, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="11-caption" classes={[c.bg_secondary, c.px_1, css.caption]}>
						Set a
						<span classes={[c.float_right, c.text_white, css.close]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div
							key="isp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
						<div></div>
						<div
							key="osp1"
							classes={[c.px_1]}
							onpointerdown={() => {}}
							onpointerenter={() => {}}
							onpointerleave={() => {}}
						>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.d_flex, c.justify_content_start]}>
							<div classes={[c.d_flex, c.align_items_center]}>
								<span
									key="idp1"
									classes={[c.px_1, css.dataPointIcon]}
									onpointerdown={() => {}}
									onpointerenter={() => {}}
									onpointerleave={() => {}}
								>
									<FontAwesomeIcon icon="circle" size="xs" />
								</span>
							</div>
							<div>
								<div>
									<small classes={[c.font_italic]}>string</small>
									<span classes={[c.ml_1]}>set</span>
								</div>
								<div>
									<input classes={[css.inputValue]} />
								</div>
							</div>
						</div>
						<div classes={[c.px_1]}>
							<span classes={[css.blankPort]}></span>
						</div>
					</div>
				</div>,
				<svg
					key="drawingConnector"
					classes={[css.svg]}
					styles={{ left: "0px", top: "0px" }}
					width="10"
					height="20"
					pointer-events="none"
				>
					<path d="M0 0 L10 20" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="none" />
				</svg>
			]);

		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp1",
							name: "set",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const h = harness(() => <Editor pageFunction={pageFunction} />);

		// 先点击节点上的序列输出端口
		h.trigger("@idp1", "onpointerdown", { clientX: 0, clientY: 0 });
		// 然后触发 canvas 节点上的移动事件
		h.trigger("@root", "onpointermove", { clientX: 10, clientY: 20 });

		h.expect(nodeAssertion);

		const noSvgAssertion = nodeAssertion.remove("@drawingConnector");
		h.trigger("@root", "onpointerup");
		h.expect(noSvgAssertion);
	});

	it("can connect - Function node's output sequence port to SetData node's input sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				},
				{
					id: "12",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: {
						id: "isp2"
					},
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "set",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		// 先点击节点上的序列输出端口
		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@isp2", "onpointerenter", { clientX: 10, clientY: 20 });
		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.calledOnce);
	});

	it("can connect - SetData node's input sequence port to Function node's output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				},
				{
					id: "12",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: {
						id: "isp2"
					},
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "set",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@isp2", "onpointerdown", { clientX: 10, clientY: 20 });
		h.trigger("@osp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.calledOnce);
	});

	it("can connect - SetData node's input sequence port to SetData node's output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: {
						id: "isp1"
					},
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp1",
							name: "set",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				},
				{
					id: "12",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: {
						id: "isp2"
					},
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "set",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@isp2", "onpointerdown", { clientX: 10, clientY: 20 });
		h.trigger("@osp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.calledOnce);
	});

	it("can connect - Function node's output data port to SetData node's input data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[addDataConnectorProcess, addDataConnectorProcessStub]]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@odp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@idp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addDataConnectorProcessStub.calledOnce);
	});

	it("can connect - SetData node's input data port to Function node's output data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[addDataConnectorProcess, addDataConnectorProcessStub]]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@idp2", "onpointerdown", { clientX: 10, clientY: 20 });
		h.trigger("@odp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addDataConnectorProcessStub.calledOnce);
	});

	it("can connect - SetData node's input data port to GetData node's output data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Get a",
					text: "",
					category: "data",
					outputSequencePorts: [],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[addDataConnectorProcess, addDataConnectorProcessStub]]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@idp2", "onpointerdown", { clientX: 10, clientY: 20 });
		h.trigger("@odp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addDataConnectorProcessStub.calledOnce);
	});

	// 1. sequence port 与 data port 不能互连
	// 2. output 不能连 output，input 不能连 input
	// 3. 不能连节点自身的其余 port 上
	// 4. port 不能自己连自己
	it("can not connect self - FlowControl node's output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		// 先点击节点上的序列输出端口
		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@osp1", "onpointerenter");
		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
	});

	it("can not connect self - FlowControl node's output data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[addDataConnectorProcess, addDataConnectorProcessStub]]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		// 先点击节点上的序列输出端口
		h.trigger("@odp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@odp1", "onpointerenter");
		h.trigger("@root", "onpointerup");

		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect self - Data node's output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@osp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
	});

	it("can not connect self - Data node's input sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@isp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@isp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
	});

	it("can not connect self - Data node's output data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					outputSequencePorts: [],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[addDataConnectorProcess, addDataConnectorProcessStub]]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@odp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@odp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect self - Data node's input data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					outputSequencePorts: [],
					inputDataPorts: [
						{
							id: "idp1",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[addDataConnectorProcess, addDataConnectorProcessStub]]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@idp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@idp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Function nodes - Function node's output sequence port to Function node's output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@osp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Function nodes - Function node's output sequence port to Function node's output data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp2",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@odp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Function nodes - Function node's output data port to Function node's output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp2",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@odp2", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@osp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's output sequence port to Data node's output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@osp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's input sequence port to Data node's input sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@isp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@isp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's input sequence port to Data node's input data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@isp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@idp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's input sequence port to Data node's output data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp2",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@isp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@odp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's output sequence port to Data node's input data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@idp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's output sequence port to Data node's output data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp2",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@osp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@odp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's output data port to Data node's output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp2",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@odp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@odp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's output data port to Data node's input sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp2",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@odp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@isp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's output data port to Data node's output data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp2",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@odp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@odp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's input data port to Data node's output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp1",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp2",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@idp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@osp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's input data port to Data node's input sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp1",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp2",
							name: "value",
							type: "string"
						}
					]
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@idp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@isp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("can not connect two Data nodes - Data node's input data port to Data node's input data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp1",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@idp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@idp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("duplicate connector - Data node input sequence port to Function node output sequence port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "函数",
					text: "onValue",
					category: "flowControl",
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [
				{
					id: "sc1",
					fromNode: "11",
					fromOutput: "osp1",
					toNode: "21",
					toInput: "isp2"
				}
			],
			dataConnections: []
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@isp2", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@osp1", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("duplicate connector - output data port to input data port", () => {
		const pageFunction: PageFunction = {
			id: "1",
			nodes: [
				{
					id: "11",
					left: 1,
					top: 2,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp1" },
					outputSequencePorts: [
						{
							id: "osp1",
							text: ""
						}
					],
					inputDataPorts: [],
					outputDataPorts: [
						{
							id: "odp1",
							name: "value",
							type: "string"
						}
					]
				},
				{
					id: "21",
					left: 10,
					top: 20,
					caption: "Set a",
					text: "",
					category: "data",
					inputSequencePort: { id: "isp2" },
					outputSequencePorts: [
						{
							id: "osp2",
							text: ""
						}
					],
					inputDataPorts: [
						{
							id: "idp2",
							name: "value",
							type: "string",
							connected: false
						}
					],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: [
				{
					id: "dc1",
					fromNode: "11",
					fromOutput: "odp1",
					toNode: "21",
					toInput: "idp2"
				}
			]
		};

		const addSequenceConnectorProcessStub = stub();
		const addDataConnectorProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[addSequenceConnectorProcess, addSequenceConnectorProcessStub],
			[addDataConnectorProcess, addDataConnectorProcessStub]
		]);
		const h = harness(() => <Editor pageFunction={pageFunction} />, { middleware: [[store, mockStore]] });

		h.trigger("@odp1", "onpointerdown", { clientX: 0, clientY: 0 });
		h.trigger("@idp2", "onpointerenter");

		h.trigger("@root", "onpointerup");

		assert.isTrue(addSequenceConnectorProcessStub.notCalled);
		assert.isTrue(addDataConnectorProcessStub.notCalled);
	});

	it("remove connector - output sequence port to input sequence port", () => {});

	it("remove connector - input data port to output data port", () => {});

	it("update connector - output sequence port to another output sequence port", () => {});

	it("update connector - input data port to another input data port", () => {});
});
