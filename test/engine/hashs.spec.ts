import hash from '../../src/engine/hash'

describe('Hash', () => {
  it('hashes an integer value from a string', () => {
    const h = hash('some value')
    expect(h).toEqual(expect.any(Number))
  })

  it('similar strings should be uniquely separate in hashes', () => {
    const h = hash('some value')
    const h2 = hash(' some value')
    expect(h2).toEqual(expect.any(Number))
    expect(h2).not.toEqual(h)
  })

  it('hashes an integer value from an object', () => {
    const h = hash({ some: 'value' })
    expect(h).toEqual(expect.any(Number))
  })

  it('similar objects should be uniquely separate in hashes', () => {
    const h = hash({ some: 'value' })
    const h2 = hash({ some: ' value' })
    expect(h2).toEqual(expect.any(Number))
    expect(h2).not.toEqual(h)
  })

  it('objects with same defined values should equal hashes', () => {
    const h = hash({ some: 'value' })
    const h2 = hash({ some: 'value', other: undefined })
    expect(h2).toEqual(h)
  })

  it('should return 0 for empty string', () => {
    expect(hash('')).toEqual(0)
  })
})