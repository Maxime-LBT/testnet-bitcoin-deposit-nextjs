/**
 * @jest-environment node
 */

import { GET } from '@/app/api/wallet/[address]/route';
import { NextRequest } from 'next/server';

// Utility function to create a mock NextRequest object
function createMockRequest(url: string = '', query: any = {}): NextRequest {
  return {
    nextUrl: {
      pathname: url,
      searchParams: new URLSearchParams(query),
    },
    query,
  } as unknown as NextRequest;
}

describe('GET /api/wallet/[address]', () => {
  it('should return data with status 200 for a valid address', async () => {
    const response = await GET(createMockRequest(), { params: { address: 'tb1qxc3kjqu0nq87e60l59r6tvyurg5ujww2h0lgs7' } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      message: 'OK',
      data: {
        balance: '0.00000000',
        transactions: [
          {
            txid: '1c9ed57cd659e4c77c1e628a2ef775822c46008c28fe06fda8da096e92aaeacc',
            direction: 'Sent',
            amount: -0.81927577,
            confirmed: true,
          },
          {
            txid: 'f9796ee7a262c9772b1ce53b485ffdfcbfc128519aa7886d6283bbe6107a0a91',
            direction: 'Received',
            amount: 0.81927577,
            confirmed: true,
          },
        ],
      },
    });
  });

  it('should return 400 if the address is invalid or missing', async () => {
    const response = await GET(createMockRequest(), { params: { address: '' } });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: 'Invalid address provided', data: null });
  });

  it('should handle API failure gracefully', async () => {
    // Provide an invalid address to simulate an API failure
    const response = await GET(createMockRequest(), { params: { address: 'invalid-address' } });
    const body = await response.json();

    // Expect a 500 status code if the external API fails
    expect(response.status).toBe(500);
    expect(body).toEqual({ message: 'Internal Server Error' });
  });

  it('should handle unexpected errors gracefully', async () => {
    try {
      // Call the GET function with an address that is unlikely to work
      const response = await GET(createMockRequest(), { params: { address: 'unlikely-to-work-address' } });
      const body = await response.json();

      // Expect a 500 status code
      expect(response.status).toBe(500);
      expect(body).toEqual({ message: 'Internal Server Error' });
    } catch (error) {
      // Handle any unexpected errors during the test
      expect(error).toBeUndefined();
    }
  });
});
