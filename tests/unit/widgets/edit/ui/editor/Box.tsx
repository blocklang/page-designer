const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import Box from "../../../../../../src/widgets/edit/ui/editor/Box";
import * as css from "../../../../../../src/widgets/edit/ui/editor/Box.m.css";

describe("edit/ui/editor/Box", () => {
	it("default properties", () => {
		const properties = {
			left: 0,
			top: 0,
			height: 0,
			width: 0
		};
		const h = harness(() => <Box {...properties} />);

		h.expect(() => (
			<div
				classes={[css.root]}
				styles={{
					left: "0px",
					top: "0px",
					height: "0px",
					width: "0px",
					borderWidth: "1px",
					borderColor: "#0080ff"
				}}
			></div>
		));
	});

	it("custom properties", () => {
		const properties = {
			left: 1,
			top: 2,
			height: 3,
			width: 4,
			borderWidth: 5,
			borderColor: "6"
		};
		const h = harness(() => <Box {...properties} />);

		h.expect(() => (
			<div
				classes={[css.root]}
				styles={{
					left: "1px",
					top: "2px",
					height: "3px",
					width: "4px",
					borderWidth: "5px",
					borderColor: "6"
				}}
			></div>
		));
	});

	it("children", () => {
		const properties = {
			left: 0,
			top: 0,
			height: 0,
			width: 0
		};
		const h = harness(() => <Box {...properties}>text</Box>);

		h.expect(() => (
			<div
				classes={[css.root]}
				styles={{
					left: "0px",
					top: "0px",
					height: "0px",
					width: "0px",
					borderWidth: "1px",
					borderColor: "#0080ff"
				}}
			>
				text
			</div>
		));
	});
});
