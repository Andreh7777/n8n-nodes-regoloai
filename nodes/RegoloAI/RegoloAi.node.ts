import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import { chatFields, chatOperations } from './ChatDescription';
import { imageFields, imageOperations } from './ImageDescription';
import { textFields, textOperations } from './EmbedDescription';

export class RegoloAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Regolo AI',
		name: 'regoloAi',
		icon: 'file:regoloai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Use Regolo AI (OpenAI-compatible)',
		defaults: { name: 'Regolo AI' },
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [{ name: 'regoloApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.url}}',
		},

		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Chat', value: 'chat' },
					{ name: 'Image', value: 'image' },
					{ name: 'Text', value: 'text' },
				],
				default: 'chat',
			},

			...chatOperations,
			...chatFields,

			...imageOperations,
			...imageFields,

			...textOperations,
			...textFields,
		],
	};
}
