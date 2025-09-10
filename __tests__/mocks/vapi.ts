// VAPI mocks for testing
export const mockVapi = {
  on: jest.fn(),
  off: jest.fn(),
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  isCallActive: jest.fn().mockReturnValue(false),
  getCallStatus: jest.fn().mockReturnValue('inactive'),
};

jest.mock('@/lib/vapi.sdk', () => ({
  vapi: mockVapi,
}));



