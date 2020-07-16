import * as React from 'react'
import * as PropTypes from 'prop-types'
import { StyleConsumer } from './index'
import { StyleEngine, StyleEngineDocumentRoot } from './types';

const GlobalStyles = ({ children }: React.PropsWithChildren<unknown>)
  : React.ReactElement<React.Consumer<StyleEngine>> => <StyleConsumer>{
  styleEngine => {
    const styleEngineDocument = document as unknown as StyleEngineDocumentRoot;
    styleEngineDocument.adoptedStyleSheets = styleEngine.computeGlobalStyleSheets()

    return children
  }
}</StyleConsumer>

GlobalStyles.propTypes = {
  children: PropTypes.node,
}

export default GlobalStyles;