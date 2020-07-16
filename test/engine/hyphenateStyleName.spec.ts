import hyphenateStyleName from '../../src/engine/hyphenateStyleName'

describe('Hyphenate Style Name', () => {
  it('should hyphenate a style name', () => {
    expect(
      hyphenateStyleName('someStyleName'),
    ).toEqual('some-style-name')
  })

  it('should allow ms prefix', () => {
    expect(
      hyphenateStyleName('msSomeStyleName'),
    ).toEqual('-ms-some-style-name')
  })
})