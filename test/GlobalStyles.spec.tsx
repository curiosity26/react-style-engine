import * as React from 'react'
import { mount } from 'enzyme'
import { StyleProvider } from '../src'
import GlobalStyles from '../src/GlobalStyles'
import { StyleEngineDocumentRoot } from '../src/types';

describe('Global Styles', () => {
  it('should mount', () => {
    // JSDom doesn't really have Shadow DOM (at least not on the document object)
    const shadowDoc = document as unknown as StyleEngineDocumentRoot;
    shadowDoc.adoptedStyleSheets = [];

    const wrapper = mount(<StyleProvider globalStyles={ { body: { color: 'blue' } } }>
      <GlobalStyles>
        <div>I&lsquot;m mounted baby!</div>
      </GlobalStyles>
    </StyleProvider>)

    expect(wrapper).toHaveLength(1);
    expect(wrapper.find('div')).toHaveLength(1)
    expect(wrapper.find('div').text()).toEqual('I&lsquot;m mounted baby!')

    expect(shadowDoc.adoptedStyleSheets).toHaveLength(1)

    const [ styleSheet ] = shadowDoc.adoptedStyleSheets
    expect(styleSheet).toBeInstanceOf(CSSStyleSheet)
    expect(styleSheet.cssRules).toHaveLength(1)

    const [ rule ] = Array.from(styleSheet.cssRules)
    expect(rule.cssText).toEqual('body {color: blue;}')
  })
})