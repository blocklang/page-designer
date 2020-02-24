import Store from "@dojo/framework/stores/Store";
import { State } from "designer-core/interfaces";

const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

describe("processes/pageFunctionProcesses", () => {
	let store: Store<State>;

	beforeEach(() => {
		store = new Store<State>();
	});

	it("addConnectorProcess: ", () => {});
});
