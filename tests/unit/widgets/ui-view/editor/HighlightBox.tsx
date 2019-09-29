const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import HighlightBox from "../../../../../src/widgets/ui-view/editor/HighlightBox";
import * as css from "../../../../../src/widgets/ui-view/editor/HighlightBox.m.css";
import Box from "../../../../../src/widgets/ui-view/editor/Box";

describe("HighlightBox", () => {
	it("default properties", () => {
		const properties = {
			left: 1,
			top: 2,
			width: 3,
			height: 4,
			widgetName: "A"
		};
		const h = harness(() => <HighlightBox {...properties} />);

		h.expect(() => (
			<Box left={1} top={2} width={3} height={4}>
				<div classes={[css.nameBar]}>A</div>
			</Box>
		));
	});
});
