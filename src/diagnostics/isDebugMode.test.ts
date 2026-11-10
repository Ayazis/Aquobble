import { isDebugMode } from './isDebugMode';

describe('isDebugMode', () => {
  it('is on only when the debug parameter is present', () => {
    expect(isDebugMode('?debug')).toBe(true);
    expect(isDebugMode('?seed=3&debug=1')).toBe(true);
    expect(isDebugMode('')).toBe(false);
    expect(isDebugMode('?debugger')).toBe(false);
  });
});
