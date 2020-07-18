import constructStyleSheets from './constructStyleSheets'
import { ConstructableStyleSheet, Scales, StyleDefinition, StyleRules } from '../types';

export default (global: StyleRules, scales: Scales = {}): ConstructableStyleSheet[] =>
  Object.entries(global).reduce(
    (sheets: ConstructableStyleSheet[], [ selector, definition ]: [ string, StyleDefinition ]) => {
      if (!definition) return sheets;

      return sheets.concat(constructStyleSheets(definition, scales, selector))
    }, [])