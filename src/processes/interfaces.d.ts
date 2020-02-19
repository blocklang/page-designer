export interface PortPosition {
	nodeId: string;
	portId: string;
	left: number;
	top: number;
}

export interface ConnectorPayload {
	startPort: PortPosition;
	endPort: PortPosition;
}
