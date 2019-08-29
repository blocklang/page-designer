import { create, v, w } from '@dojo/framework/core/vdom';
import theme from '@dojo/framework/core/middleware/theme';
import dojo from '@dojo/themes/dojo';

import * as css from './App.m.css';
import PageDesigner from './widgets/PageDesigner';

const factory = create({ theme });

export default factory(function App({ middleware: { theme } }) {
	if (!theme.get()) {
		theme.set(dojo);
	}
	return v('div', { classes: [css.root] }, [
		w(PageDesigner, {})
	]);
});
