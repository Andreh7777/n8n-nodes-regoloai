import { sendErrorPostReceive, isString } from '../GenericFunctions';
import { NodeApiError } from 'n8n-workflow';

jest.mock('n8n-workflow', () => {
	class MockNodeApiError extends Error {
		public node: unknown;
		public received: unknown;
		constructor(node: unknown, received: unknown) {
			super('NodeApiError');
			this.name = 'NodeApiError';
			this.node = node;
			this.received = received;
		}
	}
	return {
		NodeApiError: MockNodeApiError,
	};
});

type AnyResponse = {
	statusCode?: number | string | null;
	[key: string]: any;
};

// Helper to create a minimal n8n execution context with getNode().
function createCtx() {
	return {
		getNode: jest.fn(() => ({ name: 'RegoloAI' })),
	} as unknown as ThisParameterType<typeof sendErrorPostReceive>; // IExecuteSingleFunctions-ish
}

describe('GenericFunctions', () => {
	describe('sendErrorPostReceive', () => {
		it('returns data as-is when status code is 200', async () => {
			const ctx = createCtx();
			const data = [{ json: { ok: true } }];
			const response: AnyResponse = { statusCode: 200, body: 'OK' };

			const result = await sendErrorPostReceive.call(ctx, data, response as any);

			// Should be identity-like behavior on success
			expect(result).toBe(data);
			expect(result).toEqual(data);
		});

		it('returns data as-is when statusCode is undefined (treated as empty string)', async () => {
			const ctx = createCtx();
			const data = [{ json: { ok: true } }];
			const response: AnyResponse = { statusCode: undefined };

			const result = await sendErrorPostReceive.call(ctx, data, response as any);
			expect(result).toBe(data);
		});

		it('throws NodeApiError for 4xx with object-like response (JsonObject path)', async () => {
			const ctx = createCtx();
			const data = [{ json: { ok: false } }];
			const response: AnyResponse = { statusCode: 404, body: 'Not Found', extra: { a: 1 } };

			await expect(sendErrorPostReceive.call(ctx, data, response as any)).rejects.toBeInstanceOf(
				NodeApiError,
			);

			try {
				await sendErrorPostReceive.call(ctx, data, response as any);
			} catch (err: any) {
				// Our mock exposes the received payload as `received`
				expect(err).toBeInstanceOf(NodeApiError);
				expect(err.received).toEqual(response);
				expect(err.node).toEqual({ name: 'RegoloAI' });
			}
		});

		it('throws NodeApiError for 5xx with non-object response (fallback path)', async () => {
			const ctx = createCtx();
			const data = [{ json: { ok: false } }];

			const response: any[] = [];
			response.push('payload');
			(response as any).statusCode = 500;
			(response as any).body = 'Internal Server Error';

			await expect(sendErrorPostReceive.call(ctx, data, response as any)).rejects.toBeInstanceOf(
				NodeApiError,
			);

			try {
				await sendErrorPostReceive.call(ctx, data, response as any);
			} catch (err: any) {
				expect(err).toBeInstanceOf(NodeApiError);
				// The function constructs:
				// { message: 'Request failed', ...response }
				// Spreading a string produces an object with char indices as keys;
				// we verify at least the message is present.
				expect(err.received).toEqual(
					expect.objectContaining({
						message: 'Request failed',
					}),
				);
			}
		});

		it('treats string statusCode that starts with "4" as an error', async () => {
			const ctx = createCtx();
			const data = [{ json: { ok: false } }];
			const response: AnyResponse = { statusCode: '401', reason: 'Unauthorized' };

			await expect(sendErrorPostReceive.call(ctx, data, response as any)).rejects.toBeInstanceOf(
				NodeApiError,
			);

			try {
				await sendErrorPostReceive.call(ctx, data, response as any);
			} catch (err: any) {
				expect(err.received).toEqual(response);
			}
		});
	});

	describe('isString', () => {
		it('returns true for strings', () => {
			expect(isString('hello')).toBe(true);
			expect(isString('')).toBe(true);
			expect(isString(String('x'))).toBe(true);
		});

		it('returns false for non-strings', () => {
			expect(isString(123)).toBe(false);
			expect(isString({})).toBe(false);
			expect(isString([])).toBe(false);
			expect(isString(null)).toBe(false);
			expect(isString(undefined)).toBe(false);
		});
	});
});
