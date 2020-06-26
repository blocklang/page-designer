import { create, tsx } from "@dojo/framework/core/vdom";
import * as c from "@blocklang/bootstrap-classes";

export interface Simulator {
	name: string;
	width: number;
	height: number;
	dpr: number;
}

export const simulators: Simulator[] = [
	{
		name: "iPhone 6/7/8 Plus iOS 11",
		width: 414,
		height: 736,
		dpr: 3,
	},
	{
		name: "iPhone 6/7/8 iOS 11",
		width: 357,
		height: 667,
		dpr: 2,
	},
	{
		name: "iPhone X/XS iOS 12",
		width: 375,
		height: 812,
		dpr: 3,
	},
	{
		name: "iPhone XR iOS 12",
		width: 414,
		height: 896,
		dpr: 2,
	},
	{
		name: "iPhone XS Max iOS 12",
		width: 414,
		height: 896,
		dpr: 3,
	},
	{
		name: "Nexus 5X Android 8.0",
		width: 412,
		height: 732,
		dpr: 2.625,
	},
	{
		name: "Nexus 6P Android 8.0",
		width: 412,
		height: 732,
		dpr: 3.5,
	},
	{
		name: "iPad",
		width: 768,
		height: 1024,
		dpr: 2,
	},
	{
		name: "iPad Pro 10.5-inch",
		width: 834,
		height: 1112,
		dpr: 2,
	},
	{
		name: "iPad Pro 12.9-inch",
		width: 1024,
		height: 1366,
		dpr: 2,
	},
];

export interface SimulatorToolbarProperties {
	selectedIndex: number;
	changeSimulator: (newIndex: number) => void;
}

const factory = create().properties<SimulatorToolbarProperties>();

export default factory(function SimulatorToolbar({ properties }) {
	const { selectedIndex = 0, changeSimulator } = properties();
	const selectedSimulator = simulators[selectedIndex];
	return (
		<div classes={[c.d_flex, c.justify_content_center, c.bg_light, c.border, c.border_light, c.py_1]}>
			<select
				onchange={(event: MouseEvent<HTMLSelectElement>) => {
					const index = event.target.selectedIndex;
					changeSimulator && changeSimulator(index);
				}}
			>
				{simulators.map((item, index) => (
					<option key={item.name} selected={index === selectedIndex}>
						{item.name}
					</option>
				))}
			</select>
			<div>
				<span classes={[c.mx_2, c.text_muted]}>{`${selectedSimulator.width}`}</span>
				<span>x</span>
				<span classes={[c.mx_2, c.text_muted]}>{`${selectedSimulator.height}`}</span>
			</div>
		</div>
	);
});
