import { create, tsx } from '@dojo/framework/core/vdom';
import theme from '@dojo/framework/core/middleware/theme';
import dojo from '@dojo/themes/dojo';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as css from './App.m.css';
import PageDesigner from './PageDesigner';
import { User, Project, Permission, Page, Path } from './interfaces';

const factory = create({ theme });

export default factory(function App({ middleware: { theme } }) {
	if (!theme.get()) {
		theme.set(dojo);
	}
	// TODO: 支持调整参数，随着参数的变化，设计器也跟着改变
	const user: User = {
		name: 'jack',
		avatar: 'url'
	};

	const project: Project = {
		id: 1,
		name: 'project',
		createUserName: 'lucy'
	};

	const permission: Permission = {
		canRead: true,
		canWrite: false
	};

	const page: Page = {
		id: 2
	};

	const pathes: Path[] = [{ name: 'page1', path: 'page1' }];

	return (
		<div classes={[css.root]}>
			<div>参数设置区</div>
			<PageDesigner user={user} project={project} permission={permission} page={page} pathes={pathes} />
		</div>
	);
});
