export function getConnectorOffset(
	start: { x: number; y: number },
	end: { x: number; y: number }
): { top: number; left: number; width: number; height: number } {
	return {
		top: Math.min(start.y, end.y),
		left: Math.min(start.x, end.x),
		width: Math.abs(end.x - start.x),
		height: Math.abs(end.y - start.y),
	};
}

export function getConnectorPath(
	start: { x: number; y: number },
	end: { x: number; y: number }
): { start: { x: number; y: number }; end: { x: number; y: number } } {
	let startX, endX;
	if (start.x <= end.x) {
		startX = 0;
		endX = end.x - start.x;
	} else {
		startX = start.x - end.x;
		endX = 0;
	}

	let startY, endY;
	if (start.y <= end.y) {
		startY = 0;
		endY = end.y - start.y;
	} else {
		startY = start.y - end.y;
		endY = 0;
	}

	return {
		start: { x: startX, y: startY },
		end: { x: endX, y: endY },
	};
}
