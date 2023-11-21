import React from 'react';
import Parser from './Parser';

describe('Parser', () => {
  describe('using ternaries', () => {
    test('should handle boolean test value ', () => {
      const parser = new Parser();

      const parsed = parser.parseJSX(`
          <p falsyprop={false ? 1 : 0} truthyprop={true ? 1 : 0}>
            (display 1: {true ? 1 : 0}); (display 0: {false ? 1 : 0})
          </p>`) as React.JSX.Element[];

      expect(parsed[0].props.truthyprop).toBe(1);
      expect(parsed[0].props.falsyprop).toBe(0);
    });
  });

  describe('conditional || rendering', () => {
    test('should handle boolean test value ', () => {
      const parser = new Parser();

      const parsed = parser.parseJSX(
        '<p falsyprop={false || "fallback"} truthyprop={true || "fallback"}>' +
          '(display "good": {"good" || "fallback"}); (display "fallback": {"" || "fallback"})' +
          '</p>'
      ) as React.JSX.Element[];

      expect(parsed[0].props.falsyprop).toBe('fallback');
      expect(parsed[0].props.truthyprop).toBe(true);
    });

    test('should handle evaluative', () => {
      const parser = new Parser({ bindings: { foo: 1 } });

      const parsed = parser.parseJSX(
        `<div truthyprop={foo === 1 || 'fallback'} falseyProp={foo !== 1 || 'fallback'}>
            {foo === 1 || 'trueFallback'}{foo !== 1 || 'falseFallback'}
          </div>`
      ) as React.JSX.Element[];

      expect(parsed[0].props.truthyprop).toBe(true);
      expect(parsed[0].props.falseyProp).toBe('fallback');
    });
  });
});
