import type {
  JSXAttribute,
  JSXElement,
  JSXFragment,
  JSXIdentifier,
  JSXMemberExpression,
  JSXSpreadAttribute,
} from '@babel/types';
import { Node, Parser as AcornParser } from 'acorn';

import AcornJSX from 'acorn-jsx';
import React, { Fragment, ComponentType, ExoticComponent } from 'react';
import ATTRIBUTES from './constants/attributeNames';
import { canHaveChildren, canHaveWhitespace } from './constants/specialTags';
import { randomHash } from './helpers/hash';
import { parseStyle } from './helpers/parseStyle';
import { resolvePath } from './helpers/resolvePath';

type ParsedJSX = React.JSX.Element | boolean | string;
type ParsedTree = ParsedJSX | ParsedJSX[] | null;

// TODO commented out unsupported elements
export type TProps<T> = {
  // allowUnknownElements?: boolean,
  // autoCloseVoidElements?: boolean,
  bindings?: { [key: string]: unknown };
  blacklistedAttrs?: Array<string | RegExp>;
  blacklistedTags?: string[];
  // className?: string,
  components?: Record<string, ComponentType<T> | ExoticComponent<T>>;
  componentsOnly?: boolean;
  disableFragments?: boolean;
  disableKeyGeneration?: boolean;
  jsx?: string;
  onError?: (error: Error) => void;
  renderError?: (props: { error: string }) => React.JSX.Element | null;
  renderInWrapper?: boolean;
  renderUnrecognized?: (tagName: string) => React.JSX.Element | null;
  showWarnings?: boolean;
};
type Scope = Record<string, any>;

function purifyJsxString(jsxString: string) {
  const output = jsxString?.trim().replace(/<!DOCTYPE([^>]*)>/g, '');
  // because jsx-parser parses a bunch of \r \n \t into unnecessary <Fragment> components
  return output?.replace(/\s+/g, ' ').replace(/> </g, '><') ?? '';
}

// TODO fix types ad add tests they are a mess
/* eslint-disable consistent-return */
export default class Parser<T> {
  static defaultProps: TProps<any> = {
    bindings: {},
    blacklistedAttrs: [/^on.+/i],
    blacklistedTags: ['script'],
    components: {},
    componentsOnly: false,
    disableFragments: false,
    disableKeyGeneration: false,
    jsx: '',
    onError: () => {},
    showWarnings: false,
    renderError: undefined,
    renderInWrapper: true,
    renderUnrecognized: () => null,
  };

  private props: TProps<T>;

  constructor(props: TProps<T> = Parser.defaultProps) {
    this.props = props;
  }

  parseJSX = (jsx: string): React.JSX.Element | React.JSX.Element[] | null => {
    const parser = AcornParser.extend((AcornJSX as any)());
    const wrappedJsx = `<root>${purifyJsxString(jsx)}</root>`;
    let parsed: Node[] = [];
    try {
      // @ts-ignore - AcornJsx doesn't have typescript typings
      parsed = parser.parse(wrappedJsx, { ecmaVersion: 'latest' });
      // @ts-ignore - AcornJsx doesn't have typescript typings
      parsed = parsed.body[0].expression.children || [];
    } catch (error) {
      if (this.props.showWarnings) console.warn(error); // eslint-disable-line no-console
      if (this.props.onError) this.props.onError(error as Error);
      if (this.props.renderError) {
        return this.props.renderError({ error: String(error) });
      }
      return null;
    }

    return parsed.map((p) => this.parseExpression(p)).filter(Boolean);
  };

  // XXX fix typing, add tests and validate it works
  parseExpression = (expression: any, scope?: Scope): any => {
    // eslint-disable-next-line default-case
    switch (expression.type) {
      case 'JSXAttribute':
        if (expression.value === null) return true;
        return this.parseExpression(expression.value, scope);
      case 'JSXElement':
      case 'JSXFragment':
        return this.parseElement(expression, scope);
      case 'JSXExpressionContainer':
        return this.parseExpression(expression.expression, scope);
      case 'JSXText':
        // eslint-disable-next-line no-case-declarations
        const key = this.props.disableKeyGeneration ? undefined : randomHash();
        return this.props.disableFragments ? (
          expression.value
        ) : (
          <Fragment key={key}>{expression.value}</Fragment>
        );
      case 'ArrayExpression':
        return expression.elements.map((ele: Node) =>
          this.parseExpression(ele, scope)
        ) as ParsedTree;
      case 'BinaryExpression':
        /* eslint-disable eqeqeq,max-len */
        // eslint-disable-next-line default-case
        switch (expression.operator) {
          case '-':
            return (
              this.parseExpression(expression.left) -
              this.parseExpression(expression.right)
            );
          case '!=':
            return (
              this.parseExpression(expression.left) !=
              this.parseExpression(expression.right)
            );
          case '!==':
            return (
              this.parseExpression(expression.left) !==
              this.parseExpression(expression.right)
            );
          case '*':
            return (
              this.parseExpression(expression.left) *
              this.parseExpression(expression.right)
            );
          case '**':
            return (
              this.parseExpression(expression.left) **
              this.parseExpression(expression.right)
            );
          case '/':
            return (
              this.parseExpression(expression.left) /
              this.parseExpression(expression.right)
            );
          case '%':
            return (
              this.parseExpression(expression.left) %
              this.parseExpression(expression.right)
            );
          case '+':
            return (
              this.parseExpression(expression.left) +
              this.parseExpression(expression.right)
            );
          case '<':
            return (
              this.parseExpression(expression.left) <
              this.parseExpression(expression.right)
            );
          case '<=':
            return (
              this.parseExpression(expression.left) <=
              this.parseExpression(expression.right)
            );
          case '==':
            return (
              this.parseExpression(expression.left) ==
              this.parseExpression(expression.right)
            );
          case '===':
            return (
              this.parseExpression(expression.left) ===
              this.parseExpression(expression.right)
            );
          case '>':
            return (
              this.parseExpression(expression.left) >
              this.parseExpression(expression.right)
            );
          case '>=':
            return (
              this.parseExpression(expression.left) >=
              this.parseExpression(expression.right)
            );
          /* eslint-enable eqeqeq,max-len */
        }
        return undefined;
      case 'CallExpression':
        // eslint-disable-next-line no-case-declarations
        const parsedCallee = this.parseExpression(expression.callee);
        if (parsedCallee === undefined) {
          this.props.onError!(
            new Error(
              `The expression '${expression.callee}' could not be resolved, resulting in an undefined return value.`
            )
          );
          return undefined;
        }
        return parsedCallee(
          ...expression.arguments.map((arg: Node) =>
            this.parseExpression(arg, expression.callee)
          )
        );
      case 'ConditionalExpression':
        return this.parseExpression(expression.test)
          ? this.parseExpression(expression.consequent)
          : this.parseExpression(expression.alternate);
      case 'ExpressionStatement':
        return this.parseExpression(expression.expression);
      case 'Identifier':
        if (scope && expression.name in scope) {
          return scope[expression.name];
        }
        return (this.props.bindings || {})[expression.name];

      case 'Literal':
        return expression.value;
      case 'LogicalExpression':
        // eslint-disable-next-line no-case-declarations
        const left = this.parseExpression(expression.left);
        if (expression.operator === '||' && left) return left;
        if (
          (expression.operator === '&&' && left) ||
          (expression.operator === '||' && !left)
        ) {
          return this.parseExpression(expression.right);
        }
        return false;
      case 'MemberExpression':
        return this.parseMemberExpression(expression, scope);
      case 'ObjectExpression':
        // eslint-disable-next-line no-case-declarations
        const object: Record<string, any> = {};
        expression.properties.forEach((prop: any) => {
          object[prop.key.name! || prop.key.value!] = this.parseExpression(
            prop.value
          );
        });
        return object;
      case 'TemplateElement':
        return expression.value.cooked;
      case 'TemplateLiteral':
        return [...expression.expressions, ...expression.quasis]
          .sort((a, b) => {
            if (a.start < b.start) return -1;
            return 1;
          })
          .map((item) => this.parseExpression(item))
          .join('');
      case 'UnaryExpression':
        // eslint-disable-next-line default-case
        switch (expression.operator) {
          case '+':
            return expression.argument.value;
          case '-':
            return -expression.argument.value;
          case '!':
            return !expression.argument.value;
        }
        return undefined;
      case 'ArrowFunctionExpression':
        if (expression.async || expression.generator) {
          this.props.onError?.(
            new Error('Async and generator arrow functions are not supported.')
          );
        }
        return (...args: any[]): any => {
          const functionScope: Record<string, any> = {};
          expression.params.forEach((param: any, idx: number) => {
            functionScope[param.name] = args[idx];
          });
          return this.parseExpression(expression.body, functionScope);
        };
    }
  };

  parseMemberExpression = (expression: any, scope?: Scope): any => {
    // eslint-disable-next-line prefer-destructuring
    let { object } = expression;
    const path = [
      expression.property?.name ?? JSON.parse(expression.property?.raw ?? '""'),
    ];

    if (expression.object.type !== 'Literal') {
      while (object && ['MemberExpression', 'Literal'].includes(object?.type)) {
        const { property } = object as JSXMemberExpression;
        if (object.computed) {
          path.unshift(this.parseExpression(property!, scope));
        } else {
          path.unshift(
            property?.name ?? JSON.parse((property as any)?.raw ?? '""')
          );
        }

        object = (object as JSXMemberExpression).object;
      }
    }

    const target = this.parseExpression(object, scope);
    try {
      let parent = target;
      const member = path.reduce((value, next) => {
        parent = value;
        return value[next];
      }, target);
      if (typeof member === 'function') return member.bind(parent);

      return member;
    } catch {
      const name = (object as JSXIdentifier)?.name || 'unknown';
      this.props.onError!(
        new Error(`Unable to parse ${name}["${path.join('"]["')}"]}`)
      );
    }
  };

  parseName = (element: JSXIdentifier | JSXMemberExpression): string => {
    if (element.type === 'JSXIdentifier') {
      return element.name;
    }
    return `${this.parseName(element.object)}.${this.parseName(
      element.property
    )}`;
  };

  parseElement = (
    element: JSXElement | JSXFragment,
    scope?: Scope
  ): React.JSX.Element | React.JSX.Element[] | null => {
    const { components, componentsOnly, onError } = this.props;
    const { children: childNodes = [] } = element;
    const openingTag: any =
      element.type === 'JSXElement'
        ? element.openingElement
        : element.openingFragment;
    const { attributes = [] } = openingTag as any;
    const name =
      element.type === 'JSXElement' ? this.parseName(openingTag.name) : '';

    const blacklistedAttrs = (this.props.blacklistedAttrs || []).map((attr) =>
      attr instanceof RegExp ? attr : new RegExp(attr, 'i')
    );
    const blacklistedTags = (this.props.blacklistedTags || [])
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    if (/^(html|head|body)$/i.test(name)) {
      return childNodes.map((c: any) =>
        this.parseElement(c, scope)
      ) as React.JSX.Element[];
    }
    const tagName = name.trim().toLowerCase();
    if (blacklistedTags.indexOf(tagName) !== -1) {
      onError!(
        new Error(`The tag <${name}> is blacklisted, and will not be rendered.`)
      );
      return null;
    }

    if (name !== '' && !resolvePath(components, name)) {
      if (componentsOnly) {
        onError!(
          new Error(
            `The component <${name}> is unrecognized, and will not be rendered.`
          )
        );
        return this.props.renderUnrecognized!(name);
      }

      /*
      if (!allowUnknownElements && document.createElement(name) instanceof HTMLUnknownElement) {
        onError!(new Error(`The tag <${name}> is unrecognized in this browser, and will not be rendered.`))
        return this.props.renderUnrecognized!(name)
      }

       */
    }

    let children;
    const component =
      element.type === 'JSXElement' ? resolvePath(components, name) : Fragment;

    if (component || canHaveChildren(name)) {
      children = childNodes.map((node: any) =>
        this.parseExpression(node, scope)
      );
      if (!component && !canHaveWhitespace(name)) {
        children = children.filter(
          (child: any) => typeof child !== 'string' || !/^\s*$/.test(child)
        );
      }

      if (children.length === 0) {
        children = undefined;
      } else if (children.length === 1) {
        [children] = children;
      } else if (children.length > 1 && !this.props.disableKeyGeneration) {
        // Add `key` to any child that is a React element (by checking if it has `.type`) if one
        // does not already exist.
        children = children.map((child: any, key: any) =>
          child?.type && !child?.key
            ? { ...child, key: child.key || key }
            : child
        );
      }
    }

    const props: { [key: string]: any } = {
      key: this.props.disableKeyGeneration ? undefined : randomHash(),
    };
    attributes.forEach(
      // eslint-disable-next-line max-len
      (expr: JSXAttribute | JSXSpreadAttribute) => {
        if (expr.type === 'JSXAttribute') {
          const rawName: string = expr.name.name as string;
          const attributeName: string =
            ATTRIBUTES[rawName as string] || rawName;
          // if the value is null, this is an implicitly "true" prop, such as readOnly
          const value = this.parseExpression(expr, scope);

          const matches = blacklistedAttrs.filter((re) =>
            re.test(attributeName)
          );
          if (matches.length === 0) {
            props[attributeName] = value;
          }
        } else if (
          (expr.type === 'JSXSpreadAttribute' &&
            expr.argument.type === 'Identifier') ||
          expr.argument!.type === 'MemberExpression'
        ) {
          const value = this.parseExpression(expr.argument!, scope);
          if (typeof value === 'object') {
            Object.keys(value).forEach((rawName) => {
              const attributeName: string = ATTRIBUTES[rawName] || rawName;
              const matches = blacklistedAttrs.filter((re) =>
                re.test(attributeName)
              );
              if (matches.length === 0) {
                props[attributeName] = value[rawName];
              }
            });
          }
        }
      }
    );

    if (typeof props.style === 'string') {
      props.style = parseStyle(props.style);
    }
    const lowerName = name.toLowerCase();
    if (lowerName === 'option') {
      children = children?.props.children;
    }

    return React.createElement(component || lowerName, props, children);
  };
}
/* eslint-enable consistent-return */
