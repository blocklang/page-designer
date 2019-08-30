const { describe, it } = intern.getInterface('bdd');
import harness from '@dojo/framework/testing/harness';
import { tsx } from '@dojo/framework/core/vdom';

import App from '../../src/App';
import * as css from '../../src/App.m.css';
import PageDesigner from '../../src/PageDesigner';

describe('App', () => {
	it('default renders correctly', () => {
		const h = harness(() => <App />);
		h.expect(() => (
			<div classes={[css.root]}>
				<PageDesigner />
			</div>
		));
	});
});
