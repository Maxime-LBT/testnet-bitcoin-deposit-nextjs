/**
 * @jest-environment node
 */

import { POST } from '@/app/api/payment/status/route'; // Adjust to the correct path of your API file
import { createMockRequest } from './mocks/requests'; // Adjust to the correct path of your mocks

describe('POST /api/payment/status', () => {
  it('should return status 200 with confirmed payment when a matching transaction is found', async () => {
    const request = createMockRequest('', {}, { address: 'tb1qxc3kjqu0nq87e60l59r6tvyurg5ujww2h0lgs7', amount: '0.81927577' });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'confirmed',
      success: true,
      data: {
        address: 'tb1qxc3kjqu0nq87e60l59r6tvyurg5ujww2h0lgs7',
        amount: '0.81927577',
        transactionId: 'f9796ee7a262c9772b1ce53b485ffdfcbfc128519aa7886d6283bbe6107a0a91',
      },
    });
  });

  it('should return 400 if input parameters are invalid or missing', async () => {
    const request = createMockRequest('', {}, { address: '', amount: '' });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ status: 'error', success: false, data: null });
  });

  it('should return status 200 with showQRCode when no matching transaction is found', async () => {
    const request = createMockRequest('', {}, { address: 'tb1qxc3kjqu0nq87e60l59r6tvyurg5ujww2h0lgs7', amount: '2.0' });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'showQRCode', success: true, data: null });
  });
});
