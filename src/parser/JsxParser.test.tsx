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

    test('should handle test predicate returned value ', () => {
      const { container } = render(
        <JsxParser
          jsx={
            '<p>{true && true ? "a" : "b"}</p>' +
            '<p>{true && false ? "a" : "b"}</p>' +
            '<p>{true || false ? "a" : "b"}</p>' +
            '<p>{false || false ? "a" : "b"}</p>'
          }
        />
      );

      const elements = container.querySelectorAll('p');
      expect(elements[0].textContent).toEqual('a');
      expect(elements[1].textContent).toEqual('b');
      expect(elements[2].textContent).toEqual('a');
      expect(elements[3].textContent).toEqual('b');
    });
  });

  describe('conditional || rendering', () => {
    test('should handle boolean test value ', () => {
      render(
        <JsxParser
          jsx={
            '<p falsyProp={false || "fallback"} truthyProp={true || "fallback"}>' +
            '(display "good": {"good" || "fallback"}); (display "fallback": {"" || "fallback"})' +
            '</p>'
          }
        />
      );

      expect(
        screen.getByText(
          '(display "good": good); (display "fallback": fallback)'
        )
      ).toBeInTheDocument();
    });

    test('should handle evaluative', () => {
      render(
        <JsxParser
          bindings={{ foo: 1 }}
          jsx={`
            <div truthyProp={foo === 1 || 'fallback'} falseyProp={foo !== 1 || 'fallback'}>
              {foo === 1 || 'trueFallback'}{foo !== 1 || 'falseFallback'}
            </div>
          `}
        />
      );

      expect(screen.getByText('falseFallback')).toBeInTheDocument();
    });
  });
});
