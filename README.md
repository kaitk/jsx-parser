# next-jsx-parser

A React 18 and Server Component compatible JSX Parser

❗**Warning: This software is pre-alpha and provided as is**

Be careful using it. The Only reason for this to exist, is that it works on a small subset of components of an internal app to be rendered as [Server Components](https://nextjs.org/docs/getting-started/react-essentials#server-components) in a Next.js 13.4 app.

### Forefathers

This library is based (more of a copy paste) on: [react-jsx-parser](https://github.com/TroyAlford/react-jsx-parser)
with minimaly changes to make it work with Server Components (not using deprecated React Components)

### TODO (docs, tests)

Tests and docs will be added later (if at all)

### Releasing, tagging & publishing to NPM

Create a semantic version tag and publish to Github Releases. When a new release is detected a Github Action will automatically build the package and publish it to NPM. Additionally, a Storybook will be published to Github pages.

Learn more about how to use the `release-it` command [here](https://github.com/release-it/release-it).

```console
yarn release
```

When you are ready to publish to NPM simply run the following command:

```console
yarn publish
```

#### Auto publish after Github Release

❗Important note: in order to publish package to NPM you must add your token as a Github Action secret. Learn more on how to configure your repository and publish packages through Github Actions [here](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages).

## PostCSS

[tsup](https://github.com/egoist/tsup) supports PostCSS out of the box. Simply run `yarn add postcss -D` add a `postcss.config.js` file to the root of your project, then add any plugins you need. Learn more how to configure PostCSS [here](https://tsup.egoist.dev/#css-support).

Additionally consider using the [tsup](https://github.com/egoist/tsup) configuration option `injectStyle` to inject the CSS directly into your Javascript bundle instead of outputting a separate CSS file.
