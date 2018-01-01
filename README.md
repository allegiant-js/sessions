# sessions

> Simple sessions module for the allegiant app framework.
>> There be 🐲 here! The API and functionality are being cemented, anything before a 1.0.0 release is subject to change.

[![Npm Version](https://img.shields.io/npm/v/@allegiant/sessions.svg)](https://www.npmjs.com/package/@allegiant/sessions)
[![Build Status](https://travis-ci.org/allegiant-js/sessions.svg?branch=master)](https://travis-ci.org/allegiant-js/sessions.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/allegiant-js/sessions/badge.svg?branch=master)](https://coveralls.io/github/allegiant-js/sessions?branch=master)


## Installation

```
npm install @allegiant/sessions --save
```

## Usage

```js
const App = require('@allegiant/core');

let server = App.create("https://localhost:7000", { 
    '@allegiant/sessions': {
        enabled: true,
        path: path.resolve(path.join(process.cwd(), 'sessions')),
        autoStart: true
    }
});
server.get('/', function() {
    if(this.session.data.firstTimeServed) {
      this.session.data.firstTimeServed = new Date()
    }
    this.content = `<h1>It just works! You first looked at this content on ${this.session.data.firstTimeServed}</h1>`;
    return 200;
})
.start();
```


### Copyright & License

Copyright &copy; 2017 Allegiant. Distributed under the terms of the MIT License, see [LICENSE](https://github.com/allegiant-js/sessions/blob/master/LICENSE)

Availble via [npm](https://www.npmjs.com/package/@allegiant/sessions) or [github](https://github.com/allegiant-js/sessions).
