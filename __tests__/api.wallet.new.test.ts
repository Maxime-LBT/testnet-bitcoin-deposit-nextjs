/**
 * @jest-environment node
 */

import { GET } from '@/app/api/wallet/new/route'; // Adjust the path to your API file
import * as bip39 from 'bip39';

describe('GET /api/wallet/generate', () => {
  it('should return wallet details with status 200', async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('address');
    expect(body.data).toHaveProperty('privateKey');
    expect(body.data).toHaveProperty('mnemonic');
  });

  it('should return 500 if an error occurs during wallet generation', async () => {
    // Mocking an error in mnemonic generation to simulate a failure
    jest.spyOn(bip39, 'generateMnemonic').mockImplementationOnce(() => {
      throw new Error('Failed to generate mnemonic');
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: 'Internal Server Error', data: null });

    // Restore the original implementation of the generateMnemonic function
    jest.restoreAllMocks();
  });
});
