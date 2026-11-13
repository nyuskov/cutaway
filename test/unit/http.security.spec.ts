import { resolveCorsOptions } from '../../src/http/security';

describe('CORS options', () => {
  it('reflects the request origin by default', () => {
    expect(resolveCorsOptions({})).toEqual({ origin: true, methods: ['GET', 'POST', 'OPTIONS'] });
  });

  it('supports an explicit origin allow-list', () => {
    const options = resolveCorsOptions({
      CORS_ORIGINS: 'https://example.com, https://cv.example.com',
    });

    expect(options.origin).toEqual(['https://example.com', 'https://cv.example.com']);
  });
});
