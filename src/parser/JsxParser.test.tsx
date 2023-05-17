import React from 'react';
import { render, screen } from '@testing-library/react';
import { JsxParser } from './JsxParser';

describe('Parser', () => {
  describe('using ternaries', () => {
    test('should handle boolean test value ', () => {
      render(
        <JsxParser
          jsx={`
          <p falsyProp={false ? 1 : 0} truthyProp={true ? 1 : 0}>
            (display 1: {true ? 1 : 0}); (display 0: {false ? 1 : 0})
          </p>`}
        />
      );

      expect(
        screen.getByText('(display 1: 1); (display 0: 0)')
      ).toBeInTheDocument();
    });
  });
});
