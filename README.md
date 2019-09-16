# Speaq-AI Mockup [![Build Status](https://travis-ci.org/speaq-ai/react-ui.svg?branch=master)](https://travis-ci.org/speaq-ai/react-ui)

## Setup

1. Clone this repository onto your local machine: `git clone https://github.com/speaq-ai/mockup.git`.
2. Install yarn: `brew install yarn` on Mac, for other OS see [docs](https://yarnpkg.com/lang/en/docs/install/#mac-stable).
3. Install dependencies: `yarn install`.
4. create a `.env` file in the root directory of this project. Set the following environment variables with appropriate values.

```
MAPBOX_ACCESS_TOKEN=<your-mapbox-token>
```

## Usage

To start the development web server: `yarn start`

Once the development web server is running, you can view the app at `localhost:8080`.

## Configuration Steps

These are the components I've included steps I took to configure them for this project. No need understand everything going on here, but I wanted to give a high-level overview for reference.

### Components

- Yarn: package manager (variant of npm that was created by Facebook)

- React: Front-end javascript ui library

- Webpack: Module bundler. takes care of transforming/bundling up all of our javascript code into one tidy, minified `bundle.js` file to be served to the browser.

- Babel: Javascript compiler. Javascript has a ton of active (versions)[https://www.w3schools.com/js/js_versions.asp]. Not all versions are supported by all browsers. this is annoying b/c as developers we want to use the latest and greatest syntax/features. Babel takes care of compiling any javascript you write into a universally supported version of Javascript to be bundled/run on the browser.

- Prettier: Code formatter. Makes life so much better. Never lose sleep/hair over your colleagues sloppy bracket indentations ever again :).

### Steps:

- initialize yarn/npm (creates package.json)
- add react, react-dom dependencies
- add webpack, webpack-dev-server, webpack-cli
- add index.html in root and index.js in ./src (index.js handles rendering root app component to DOM)
- configure webpack.config.js
- configure .babelrc
- configure .prettierrc

[Reference](https://dev.to/nsebhastian/step-by-step-react-configuration-2nma#why-create-your-own-configuration)
