const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import * as c from "bootstrap-classes";

import Behavior from "../../../../../src/widgets/edit/behavior";
import Data from "../../../../../src/widgets/edit/behavior/Data";

describe("edit/behavior", () => {
	it("default properties", () => {
		const h = harness(() => <Behavior />);

		h.expect(() => (
			<div classes={[c.ml_2]}>
				<Data />
			</div>
		));
	});
});
