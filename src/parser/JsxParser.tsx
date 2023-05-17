import React from 'react';
import Parser, { TProps } from './Parser';

export function JsxParser<T>(props: TProps<T>): React.JSX.Element {
  const parser = new Parser(props);
  const parsedChildren = parser.parseJSX(props.jsx!);
  return props.renderInWrapper ? (
    <div className="jsx-parser">{parsedChildren}</div>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{parsedChildren}</>
  );
}
