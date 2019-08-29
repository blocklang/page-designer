import { create, tsx } from '@dojo/framework/core/vdom';

export interface HeaderProperties {}

const factory = create().properties<HeaderProperties>();

export default factory(function Header({ properties }) {
	return <div>a</div>;
});
