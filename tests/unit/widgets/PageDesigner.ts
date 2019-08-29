const { describe, it } = intern.getInterface('bdd');
import harness from '@dojo/framework/testing/harness';
import { w, v } from '@dojo/framework/core/vdom';

import About from '../../../src/PageDesigner';
import * as css from '../../../src/styles/PageDesigner.m.css';

describe('Page Designer', () => {
	it('default renders correctly', () => {
		const h = harness(() => w(About, {}));
		h.expect(() => v('h1', { classes: [css.root] }, ['Page Designer']));
	});
});
