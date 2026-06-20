
import { jest } from '@jest/globals';

//
// Mock db/index.js before importing the service
//
jest.unstable_mockModule('../../db/index.js', () => ({
    query: jest.fn(),
    getClient: jest.fn()
}));

const { query } = await import('../../db/index.js');

const {
    listSuppliersService,
    getSupplierService,
    createSupplierService,
    updateSupplierService
} = await import('../../services/suppliersService.js');

describe('suppliersService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listSuppliersService', () => {

        test('returns suppliers with pagination metadata', async () => {

            query.mockResolvedValue({
                rowCount: 2,
                rows: [
                    {
                        supplier_id: '1',
                        name: 'ABC Suppliers'
                    },
                    {
                        supplier_id: '2',
                        name: 'XYZ Suppliers'
                    }
                ]
            });

            const result = await listSuppliersService(
                'business-1',
                { page: 1, limit: 50 }
            );

            expect(query).toHaveBeenCalled();

            expect(result).toEqual({
                data: [
                    {
                        supplier_id: '1',
                        name: 'ABC Suppliers'
                    },
                    {
                        supplier_id: '2',
                        name: 'XYZ Suppliers'
                    }
                ],
                meta: {
                    page: 1,
                    limit: 50
                }
            });

        });

    });

    describe('getSupplierService', () => {

        test('returns a supplier when found', async () => {

            query.mockResolvedValue({
                rowCount: 1,
                rows: [
                    {
                        supplier_id: '1',
                        name: 'ABC Suppliers'
                    }
                ]
            });

            const supplier = await getSupplierService(
                '1',
                'business-1'
            );

            expect(supplier).toEqual({
                supplier_id: '1',
                name: 'ABC Suppliers'
            });

        });

        test('throws when supplier does not exist', async () => {

            query.mockResolvedValue({
                rowCount: 0,
                rows: []
            });

            await expect(
                getSupplierService(
                    '999',
                    'business-1'
                )
            ).rejects.toThrow('Supplier not found');

        });

    });

    describe('createSupplierService', () => {

        test('creates a supplier', async () => {

            query.mockResolvedValue({
                rowCount: 1,
                rows: [
                    {
                        supplier_id: '1',
                        name: 'ABC Suppliers',
                        phone: '0712345678',
                        email: 'abc@gmail.com',
                        payment_terms: '30 days'
                    }
                ]
            });

            const result = await createSupplierService(
                'business-1',
                {
                    name: 'ABC Suppliers',
                    phone: '0712345678',
                    email: 'abc@gmail.com',
                    payment_terms: '30 days'
                }
            );

            expect(query).toHaveBeenCalled();

            expect(result.name).toBe('ABC Suppliers');

        });

    });

    describe('updateSupplierService', () => {

        test('updates supplier name', async () => {

            query.mockResolvedValue({
                rowCount: 1,
                rows: [
                    {
                        supplier_id: '1',
                        name: 'New Supplier'
                    }
                ]
            });

            const result = await updateSupplierService(
                '1',
                'business-1',
                {
                    name: 'New Supplier'
                }
            );

            expect(result).toEqual({
                supplier_id: '1',
                name: 'New Supplier'
            });

        });

        test('throws when supplier is not found', async () => {

            query.mockResolvedValue({
                rowCount: 0,
                rows: []
            });

            await expect(
                updateSupplierService(
                    '999',
                    'business-1',
                    {
                        name: 'Updated'
                    }
                )
            ).rejects.toThrow('Supplier not found');

        });

    });

});

