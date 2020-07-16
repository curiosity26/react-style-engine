import tryCatch from '../../src/utils/tryCatch';

describe('tryCatch', () => {
  it('suppresses exception', () => {
    const logger = jest.fn();
    const errFunc = jest.fn(() => {
      throw new Error('Error')
    })

    expect(tryCatch(errFunc, logger)).toBeUndefined();

    expect(errFunc).toHaveBeenCalled()
    expect(logger).toHaveBeenCalled()
  })
})