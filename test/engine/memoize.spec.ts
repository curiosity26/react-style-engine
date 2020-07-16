import memoize from '../../src/engine/memoize'

describe('Memoize', () => {
  it('should cache the results of a function', () => {
    const fn = jest.fn((args) => args)
    const memFn = memoize(fn)

    expect(memFn('value')).toEqual('value')
    expect(memFn('value')).toEqual('value')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should cache the results based on keys', () => {
    const fn = jest.fn((args) => args)
    const memFn = memoize(fn, [ 'cacheKey1' ])

    expect(memFn('value')).toEqual('value')
    expect(memFn({ value: 'value 2' })).toEqual('value')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})