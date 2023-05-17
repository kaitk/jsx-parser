import React, { useMemo, useState } from 'react';
import Parser, { TProps } from './Parser';

export function JsxParser<T>(props: TProps<T>): React.JSX.Element {
  const [should, setFail] = useState(false);
  console.warn('THIS WORKS', should);

  const test = () => {
    console.log(setFail);
  };

  const parser = new Parser({ ...props, onError: test });

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
