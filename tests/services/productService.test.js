import { jest } from '@jest/globals';

// Mock db/index.js before importing the service
jest.unstable_mockModule('../../src/db/index.js', () => ({
    query: jest.fn(),
    getClient: jest.fn()
}));

const { query } = await import('../../src/db/index.js');

const {
    getProductsService
} = await import('../../src/services/productService.js');

describe('productService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProductsService', () => {

        test('gets products without search query', async () => {

            query.mockResolvedValue({
                rowCount: 2,
                rows: [
                    { product_id: 1, name: 'Product A' },
                    { product_id: 2, name: 'Product B' }
                ]
            });

            const result = await getProductsService('business-1', { limit: 10, offset: 0 });

            expect(query).toHaveBeenCalled();
            // The query should not include ILIKE search clause
            const [queryText, params] = query.mock.calls[0];
            expect(queryText).not.toContain('ILIKE');
            expect(params).toEqual(['business-1', 10, 0]);
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Product A');

        });

        test('gets products with search query', async () => {

            query.mockResolvedValue({
                rowCount: 1,
                rows: [
                    { product_id: 1, name: 'Searchable Product A' }
                ]
            });

            const result = await getProductsService('business-1', { limit: 10, offset: 0, search: 'Searchable' });

            expect(query).toHaveBeenCalled();
            // The query should contain the ILIKE search clause
            const [queryText, params] = query.mock.calls[0];
            expect(queryText).toContain('ILIKE');
            expect(params).toEqual(['business-1', 10, 0, '%Searchable%']);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Searchable Product A');

        });

    });

});
