import React from 'react';
import Parser from './Parser';

describe('Parser', () => {
  describe('using ternaries', () => {
    test('should handle boolean test value ', () => {
      const parser = new Parser();

      const parsed = parser.parseJSX(`
          <p falsyProp={false ? 1 : 0} truthyProp={true ? 1 : 0}>
            (display 1: {true ? 1 : 0}); (display 0: {false ? 1 : 0})
          </p>`) as React.JSX.Element[];

      expect(parsed[0].props.truthyProp).toBe(1);
      expect(parsed[0].props.falsyProp).toBe(0);
    });
  });

  describe('conditional || rendering', () => {
    test('should handle boolean test value ', () => {
      const parser = new Parser();

      const parsed = parser.parseJSX(
        '<p falsyProp={false || "fallback"} truthyProp={true || "fallback"}>' +
          '(display "good": {"good" || "fallback"}); (display "fallback": {"" || "fallback"})' +
          '</p>'
      ) as React.JSX.Element[];

      expect(parsed[0].props.falsyProp).toBe('fallback');
      expect(parsed[0].props.truthyProp).toBe(true);
    });

    test('should handle evaluative', () => {
      const parser = new Parser({ bindings: { foo: 1 } });

      const parsed = parser.parseJSX(
        `<div truthyProp={foo === 1 || 'fallback'} falseyProp={foo !== 1 || 'fallback'}>
            {foo === 1 || 'trueFallback'}{foo !== 1 || 'falseFallback'}
          </div>`
      ) as React.JSX.Element[];

      expect(parsed[0].props.truthyProp).toBe(true);
      expect(parsed[0].props.falseyProp).toBe('fallback');
    });
  });
});
