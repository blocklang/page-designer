import { create, tsx } from "@dojo/framework/core/vdom";

export interface WidgetsTabProperties {}

const factory = create().properties<WidgetsTabProperties>();

export default factory(function WidgetsTab({ properties }) {
	const {} = properties();
	return <div>部件面板</div>;
});
