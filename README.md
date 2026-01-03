# modal
[![tests](https://img.shields.io/github/actions/workflow/status/substrate-system/route-event/nodejs.yml?style=flat-square)](https://github.com/substrate-system/route-event/actions/workflows/nodejs.yml)
[![types](https://img.shields.io/npm/types/@substrate-system/modal?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](https://common-changelog.org)
[![license](https://img.shields.io/badge/license-Big_Time-blue?style=flat-square)](LICENSE)


Modal dialog window

See [smashingmagazine.com article](https://www.smashingmagazine.com/2022/04/cta-modal-build-web-component/) and [nathansmith/cta-modal](https://github.com/nathansmith/cta-modal/tree/main).

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Demo](#demo)
- [Install](#install)
- [Use](#use)
  * [Bundler](#bundler)
  * [HTML only](#html-only)
- [API](#api)
  * [attributes](#attributes)
- [example](#example)
- [credits](#credits)

<!-- tocstop -->

</details>

## Demo

See [substrate-system.github.io/modal](https://substrate-system.github.io/modal/).

## Install

```sh
npm i -S @substrate-system/modal
```

## Use

### Bundler

Just import; this calls the global function `window.customElements.define`.

```js
import '@substrate-system/modal'
```

Then use the tag in HTML:

```html
<modal-window>
    <div slot="button">
        <p>
            <button class="cta-modal-toggle" type="button">
                Open modal
            </button>
        </p>
    </div>

    <div slot="modal">modal content?</div>
    <div slot="modal">more modal content</div>
</modal-window>
```

### HTML only

First copy the file to a location accessible to your web server.

```sh
cp ./node_modules/@substrate-system/modal/dist/index.min.js ./public/modal.js
```

Then link to the file in HTML
```html
<body>
    <p>...content...</p>
    <script type="module" src="/modal.js"></script>
</body>
```

## API

### Attributes

See [nathansmith/cta-modal](https://github.com/nathansmith/cta-modal/tree/main?tab=readme-ov-file#how-to-use-extras)


#### Closable

Take an attribute `closable`. If you pass in `closable="false"`, then it will
render without a 'close' button, and escape key and clicks will not close the
modal. You would need to open/close it via your application state.

```html
<modal-window closable="false">
    <div>
        <p>
            <button
                class="cta-modal-toggle"
                type="button"
            >
                Open a modal that can't be closed
            </button>
        </p>
    </div>
    <div>modal content?</div>
    <div>more modal content</div>
</modal-window>
```

## Example

[See `./example`](./example/).

## credits

Thanks [@nathansmith](https://github.com/nathansmith) and [Smashing Magazine](https://www.smashingmagazine.com/2022/04/cta-modal-build-web-component/) for publishing this originally.
