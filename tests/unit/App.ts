const { describe, it } = intern.getInterface('bdd');
import harness from '@dojo/framework/testing/harness';
import { v, w } from '@dojo/framework/core/vdom';

import App from '../../src/App';
import * as css from '../../src/App.m.css';
import PageDesigner from '../../src/widgets/PageDesigner';

describe('App', () => {
	it('default renders correctly', () => {
		const h = harness(() => w(App, {}));
		h.expect(() =>
			v('div', { classes: [css.root] }, [
				w(PageDesigner, {})
			])
		);
	});
});
