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
});
