import { Operation } from "designer-core/interfaces";

export interface PortPosition {
	nodeId: string;
	portId: string;
}

export interface ConnectorPayload {
	startPort: PortPosition;
	endPort: PortPosition;
}

export interface ServicePayload extends Operation {
	path: string;
}
