const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import assertionTemplate from "@dojo/framework/testing/assertionTemplate";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import Editor from "../../../../../../src/widgets/edit/behavior/func/Editor";
import * as css from "../../../../../../src/widgets/edit/behavior/func/Editor.m.css";
import * as c from "bootstrap-classes";
import { PageFunction } from "designer-core/interfaces";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import store from "designer-core/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { activeFunctionNodeProcess } from "../../../../../../src/processes/pageFunctionProcesses";
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
					classes={[c.border, undefined, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[css.port]}></div>
						<div>onValue</div>
						<div classes={[css.port]} onpointerdown={() => {}} onpointerup={() => {}}>
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
					classes={[c.border, undefined, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[css.port]}></div>
						<div>onValue</div>
						<div classes={[css.port]} onpointerdown={() => {}} onpointerup={() => {}}>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div>
							<span classes={[css.port]}></span>
						</div>
						<div onpointerdown={() => {}} onpointerup={() => {}}>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span classes={[css.port, c.ml_1]}>
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
					classes={[c.border, undefined, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[css.port]}></div>
						<div>onValue</div>
						<div classes={[css.port]} onpointerdown={() => {}} onpointerup={() => {}}>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div>
							<span classes={[css.port]}></span>
						</div>
						<div onpointerdown={() => {}} onpointerup={() => {}}>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span classes={[css.port, c.ml_1]}>
								<FontAwesomeIcon icon="circle" size="xs" />
							</span>
						</div>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div>
							<span classes={[css.port]}></span>
						</div>
						<div onpointerdown={() => {}} onpointerup={() => {}}>
							<span>value2</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span classes={[css.port, c.ml_1]}>
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
					classes={[c.border, undefined, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						Set a
						<span classes={[c.float_right, c.text_white]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[css.port]} onpointerdown={() => {}} onpointerup={() => {}}>
							<FontAwesomeIcon icon="caret-right" />
						</div>
						<div></div>
						<div classes={[css.port]} onpointerdown={() => {}} onpointerup={() => {}}>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.d_flex, c.justify_content_start]}>
							<div onpointerdown={() => {}} onpointerup={() => {}}>
								<span classes={[css.port, c.ml_1]}>
									<FontAwesomeIcon icon="circle" size="xs" />
								</span>
							</div>
							<div>
								<div>
									<small classes={[c.ml_1, c.font_italic]}>string</small>
									<span>set</span>
								</div>
								<div>
									<input />
								</div>
							</div>
						</div>
						<div>
							<span classes={[css.port]}></span>
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
					classes={[c.border, undefined, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						Get a
						<span classes={[c.float_right, c.text_white]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div>
							<span classes={[css.port]}></span>
						</div>
						<div>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span classes={[css.port, c.ml_1]} onpointerdown={() => {}} onpointerup={() => {}}>
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

	it("show sequence connection", () => {
		const nodeAssertion = baseAssertion
			// 以下两个事件专用于在节点间连线。
			.setProperty("@root", "onpointermove", () => {})
			.setProperty("@root", "onpointerup", () => {})
			.replaceChildren("@root", () => [
				<div
					key="11"
					classes={[c.border, undefined, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[css.port]}></div>
						<div>onValue</div>
						<div classes={[css.port]} onpointerdown={() => {}} onpointerup={() => {}}>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
				</div>,
				<div
					key="12"
					classes={[c.border, undefined, css.node]}
					styles={{ top: "20px", left: "10px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						Set a
						<span classes={[c.float_right, c.text_white]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[css.port]} onpointerdown={() => {}} onpointerup={() => {}}>
							<FontAwesomeIcon icon="caret-right" />
						</div>
						<div></div>
						<div classes={[css.port]} onpointerdown={() => {}} onpointerup={() => {}}>
							<FontAwesomeIcon icon="caret-right" />
						</div>
					</div>
				</div>,
				<svg
					key="sc1"
					classes={[css.svg]}
					styles={{ left: "2px", top: "3px" }}
					width="9"
					height="18"
					pointer-events="none"
				>
					<path d="M0 0 L9 18" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="visibleStroke" />
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
							text: "",
							left: 2,
							top: 3
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
						id: "isp2",
						left: 11,
						top: 21
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
					classes={[c.border, undefined, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div>
							<span classes={[css.port]}></span>
						</div>
						<div onpointerdown={() => {}} onpointerup={() => {}}>
							<span>value</span>
							<small classes={[c.ml_1, c.font_italic]}>string</small>
							<span classes={[css.port, c.ml_1]}>
								<FontAwesomeIcon icon="circle" size="xs" />
							</span>
						</div>
					</div>
				</div>,
				<div
					key="12"
					classes={[c.border, undefined, css.node]}
					styles={{ top: "20px", left: "10px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						Set a
						<span classes={[c.float_right, c.text_white]} onclick={() => {}}>
							<FontAwesomeIcon icon="times" />
						</span>
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[c.d_flex, c.justify_content_start]}>
							<div onpointerdown={() => {}} onpointerup={() => {}}>
								<span classes={[css.port, c.ml_1]}>
									<FontAwesomeIcon icon="circle" size="xs" />
								</span>
							</div>
							<div>
								<div>
									<small classes={[c.ml_1, c.font_italic]}>string</small>
									<span>set</span>
								</div>
								<div>
									<input />
								</div>
							</div>
						</div>
						<div>
							<span classes={[css.port]}></span>
						</div>
					</div>
				</div>,
				<svg
					key="dc1"
					classes={[css.svg]}
					styles={{ left: "2px", top: "3px" }}
					width="9"
					height="18"
					pointer-events="none"
				>
					<path d="M0 0 L9 18" fill="none" stroke="#6c757d" stroke-width="2" pointer-events="visibleStroke" />
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
							id: "idp1",
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
					toInput: "idp1"
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
					classes={[c.border, c.border_primary, css.node]}
					styles={{ top: "2px", left: "1px" }}
					onpointerdown={() => {}}
				>
					<div key="caption" classes={[c.bg_secondary, c.px_1]}>
						函数
					</div>
					<div classes={[c.d_flex, c.justify_content_between]}>
						<div classes={[css.port]}></div>
						<div>onValue</div>
						<div classes={[css.port]} onpointerdown={() => {}} onpointerup={() => {}}>
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
});
