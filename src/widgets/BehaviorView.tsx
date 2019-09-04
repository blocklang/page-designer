import { create, tsx } from "@dojo/framework/core/vdom";

export interface BehaviorViewProperties {}

const factory = create().properties<BehaviorViewProperties>();

export default factory(function BehaviorView({ properties }) {
	const {} = properties();
	return <div></div>;
});
