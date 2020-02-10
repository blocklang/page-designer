import { create, tsx } from "@dojo/framework/core/vdom";
import store from "designer-core/store";
import { AttachedWidget, Func } from "designer-core/interfaces";
import List from "./List";
import Editor from "./Editor";

export interface FuncProperties {
	widgets: AttachedWidget[];
	functions: Func[];
}

const factory = create({ store }).properties<FuncProperties>();

export default factory(function Func({ properties, middleware: { store } }) {
	const { widgets, functions } = properties();

	const { get, path } = store;

	const funcViewType = get(path("paneLayout", "funcViewType")) || "funcList";

	return (
		<div key="root">
			{funcViewType === "funcList" ? <List widgets={widgets} /> : <Editor functions={functions} />}
		</div>
	);
});
