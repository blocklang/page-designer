import { v, create } from '@dojo/framework/core/vdom';

import * as css from './styles/PageDesigner.m.css';

const factory = create();

export default factory(function PageDesigner() {
	return v('h1', { classes: [css.root] }, ['Page Designer']);
});
