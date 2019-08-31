import { create, tsx } from '@dojo/framework/core/vdom';
import * as css from './styles/PageDesigner.m.css';

import Header from './widgets/Header';
import { User, Project, Page, Path, Permission } from './interfaces';

export interface PageDesignerProperties {
	user?: User; // 如果是匿名用户，则值为 null
	project: Project;
	permission: Permission;
	page: Page;
	pathes: Path[];
}

const factory = create().properties<PageDesignerProperties>();

export default factory(function PageDesigner({ properties }) {
	const { user, project, permission, pathes } = properties();
	return (
		<div classes={[css.root]}>
			<Header user={user} permission={permission} project={project} pathes={pathes} />
		</div>
	);
});
