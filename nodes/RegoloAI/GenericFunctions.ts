import type {
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

function isJsonObject(obj: unknown): obj is JsonObject {
	return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export async function sendErrorPostReceive(
	this: IExecuteSingleFunctions,
	data: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const code = String(response.statusCode ?? '');
	if (code.startsWith('4') || code.startsWith('5')) {
		if (isJsonObject(response)) {
			throw new NodeApiError(this.getNode(), response);
		}
		throw new NodeApiError(this.getNode(), {
			message: 'Request failed',
			...response,
		} as JsonObject);
	}
	return data;
}
