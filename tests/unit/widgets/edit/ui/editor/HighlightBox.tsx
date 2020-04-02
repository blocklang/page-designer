const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import HighlightBox from "../../../../../../src/widgets/edit/ui/editor/HighlightBox";
import * as css from "../../../../../../src/widgets/edit/ui/editor/HighlightBox.m.css";
import Box from "../../../../../../src/widgets/edit/ui/editor/Box";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State } from "designer-core/interfaces";
import store from "designer-core/store";
import { add } from "@dojo/framework/stores/state/operations";
import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";

describe("edit/ui/editor/HighlightBox", () => {
	it("default properties", () => {
		const properties = {
			widgetName: "A",
		};
		const h = harness(() => <HighlightBox {...properties} />);

		h.expect(() => (
			<Box left={0} top={0} width={0} height={0}>
				<div classes={[css.nameBar, css.nameBarPosition]}>A</div>
			</Box>
		));
	});

	it("set highlight widget dimensions", () => {
		const properties = {
			widgetName: "A",
		};

		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <HighlightBox {...properties} />, { middleware: [[store, mockStore]] });

		const documentScrollTop = document.documentElement.scrollTop;
		const documentScrollLeft = document.documentElement.scrollLeft;

		const highlightWidgetDimensions: DimensionResults = {
			position: {
				left: 1, // 使用此值计算 left
				top: 2, // 使用此值计算 top
				bottom: 3,
				right: 4,
			},
			offset: {
				left: 5,
				top: 6,
				height: 7,
				width: 8,
			},
			size: {
				height: 9, // 使用此值计算 height
				width: 10, // 使用此值计算 width
			},
			scroll: {
				left: 11,
				top: 12,
				height: 13,
				width: 14,
			},
			client: {
				left: 15,
				top: 16,
				height: 17,
				width: 18,
			},
		};
		mockStore((path) => [add(path("highlightWidgetDimensions"), highlightWidgetDimensions)]);

		h.expect(() => (
			<Box left={documentScrollLeft + 1} top={documentScrollTop + 2} height={9} width={10}>
				<div classes={[css.nameBar, css.nameBarPosition]}>A</div>
			</Box>
		));
	});
});
