import { NextRequest } from 'next/server';

export const createMockRequest = (url: string = '', query: any = {}, body: any): NextRequest => {
  return {
    nextUrl: {
      pathname: url,
      searchParams: new URLSearchParams(query),
    },
    query,
    json: async () => body,
  } as unknown as NextRequest;
};
