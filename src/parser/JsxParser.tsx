import React, { useMemo } from 'react';
import Parser, { TProps } from './Parser';

export function JsxParser<T>(props: TProps<T>): React.JSX.Element {
  const parser = new Parser(props);

  const parsedChildren = useMemo(
    () => parser.parseJSX(props.jsx!),
    [props.jsx]
  );

  return props.renderInWrapper ? (
    <div className="jsx-parser">{parsedChildren}</div>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{parsedChildren}</>
  );
}
