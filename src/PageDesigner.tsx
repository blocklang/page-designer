import { create, tsx } from '@dojo/framework/core/vdom';
import * as css from './styles/PageDesigner.m.css';

import Header from './widgets/Header';

export interface PageDesignerProperties {}

const factory = create().properties<PageDesignerProperties>();

export default factory(function PageDesigner({ properties }) {
	return (
		<div>
			<h1 classes={[css.root]}>Page Designer</h1>
			<Header />
		</div>
	);
});
