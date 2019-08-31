import { create, tsx } from '@dojo/framework/core/vdom';
import { User, Project, Path, Permission } from '../interfaces';

export interface HeaderProperties {
	user?: User;
	permission: Permission;
	project: Project;
	pathes: Path[];
}

const factory = create().properties<HeaderProperties>();

export default factory(function Header({ properties }) {
	return <div>Widget Content</div>;
});
