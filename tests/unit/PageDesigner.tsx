const { describe, it } = intern.getInterface('bdd');
import harness from '@dojo/framework/testing/harness';
import { tsx } from '@dojo/framework/core/vdom';

import * as css from '../../src/styles/PageDesigner.m.css';
import PageDesigner from '../../src/PageDesigner';
import Header from '../../src/widgets/Header';

describe('Page Designer', () => {
	it('default renders correctly', () => {
		const h = harness(() => <PageDesigner />);
		h.expect(() => (
			<div classes={[css.root]}>
				<Header />
			</div>
		));
	});
});
