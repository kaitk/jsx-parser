import React from 'react';
import Parser, { TProps } from './Parser';

export function JsxParser<T>(props: TProps<T>) {
  const parser = new Parser(props);
  const parsedChildren = parser.parseJSX(props.jsx!);
  return props.renderInWrapper ? (
    <div className="jsx-parser">{parsedChildren}</div>
  ) : (
    parsedChildren
  );
}
