import { create, v } from "@dojo/framework/core/vdom";
import { PageFunction, VisualNode } from "designer-core/interfaces";
import * as c from "bootstrap-classes";
import * as css from "./Editor.m.css";
import { DNode } from "@dojo/framework/core/interfaces";
import store from "designer-core/store";
import { activeFunctionNodeProcess } from "../../../../processes/pageFunctionProcesses";
// import FontAwesomeIcon from 'dojo-fontawesome/FontAwesomeIcon';

export interface EditorProperties {
	pageFunction?: PageFunction;
}

const factory = create({ store }).properties<EditorProperties>();

let isConnecting = false;
// let drawingConnectorStartPoint: { x: number; y: number };
// let drawingConnectorEndPoint: { x: number; y: number };

export default factory(function Editor({ properties, middleware: { store } }) {
	const { pageFunction } = properties();

	if (!pageFunction) {
		return v("div", { key: "root", classes: [c.text_center, c.pt_5, c.border, c.mb_4, css.root] }, [
			v("span", { classes: [c.text_muted, c.mt_3] }, [
				`在“界面/操作面板/属性选项卡”中选择一个事件后，在此处定义事件处理函数。`
			])
		]);
	}

	const { get, path, executor } = store;
	const selectedFunctionNodeId = get(path("selectedFunctionNodeId"));
	const { nodes } = pageFunction;

	return v("div", { classes: [c.border, css.root] }, [
		...renderNodes(),
		...renderSequenceConnections(),
		...renderDataConnections(),
		isConnecting && renderConnection()
	]);

	function renderNodes(): DNode[] {
		return nodes.map((node) => {
			if (node.category === "flowControl") {
				return renderFlowControlNode(node);
			} else if (node.category === "data") {
				return renderDataNode(node);
			} else {
				return v("div", { classes: [c.border, css.node] }, ["未实现"]);
			}
		});
	}

	function renderFlowControlNode(node: VisualNode): DNode {
		// const singleSequenceOutput = node.outputSequencePorts.length === 1 && node.outputSequencePorts[0].text === "";

		return v(
			"div",
			{
				key: node.id,
				classes: [c.border, node.id === selectedFunctionNodeId && c.border_primary, css.node],
				styles: { top: `${node.top}px`, left: `${node.left}px` },
				onpointerdown: (event: PointerEvent) => {
					// 用于选中节点
					// 如果已经选中了，则不再重复选中
					if (selectedFunctionNodeId !== node.id) {
						executor(activeFunctionNodeProcess)({ functionNodeId: node.id });
					}
					event.preventDefault();
				}
			},
			[v("div", { key: "caption", classes: [c.bg_secondary, c.px_1] }, [node.caption])]
		);

		// return (<div
		//     key={node.id}
		//     classes={[c.border, node.id === selectedFunctionNodeId && c.border_primary, css.node]}
		//     styles={{ top: `${node.top}px`, left: `${node.left}px` }}
		//     onpointerdown={(event: PointerEvent) => {
		//         // 用于选中节点
		//         // 如果已经选中了，则不再重复选中
		//         if (selectedFunctionNodeId !== node.id) {
		//             executor(activeFunctionNodeProcess)({ functionNodeId: node.id });
		//         }
		//         event.preventDefault();
		//     }}>
		//     <div key="caption" classes={[c.bg_secondary, c.px_1]}>{node.caption}</div>
		//     {
		//         singleSequenceOutput && (<div classes={[c.d_flex, c.justify_content_between]}>
		//             <div classes={[css.port]}>
		//                 {
		//                     node.inputSequencePort && <FontAwesomeIcon icon="caret-right" />
		//                 }
		//             </div>
		//             <div>{node.text}</div>
		//             <div classes={[css.port]}>
		//                 <FontAwesomeIcon icon="caret-right" />
		//             </div>
		//         </div>)
		//     }
		//     {
		//         !singleSequenceOutput && (<virtual>
		//             {
		//                 node.
		//             }
		//         </virtual>)
		//     }
		// </div>);
	}

	function renderDataNode(node: VisualNode): DNode {
		return v("div");
	}

	function renderSequenceConnections(): DNode[] {
		return [];
	}

	function renderDataConnections(): DNode[] {
		return [];
	}

	function renderConnection(): DNode {
		return v("svg");
	}
});
