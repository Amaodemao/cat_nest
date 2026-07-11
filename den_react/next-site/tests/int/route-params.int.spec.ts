import { describe, expect, it } from 'vitest'

import { decodeRouteParam } from '@/lib/decodeRouteParam'

describe('route parameters', () => {
  it('decodes percent-encoded Unicode slugs', () => {
    expect(decodeRouteParam('%E5%85%A8%E5%9B%BD%E5%8F%AF%E9%A3%9E')).toBe('全国可飞')
  })

  it('preserves decoded and malformed values', () => {
    expect(decodeRouteParam('markdown-test')).toBe('markdown-test')
    expect(decodeRouteParam('全国可飞')).toBe('全国可飞')
    expect(decodeRouteParam('%E5%A')).toBe('%E5%A')
  })
})
