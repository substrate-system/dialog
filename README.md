# dialog
[![tests](https://img.shields.io/github/actions/workflow/status/substrate-system/dialog/nodejs.yml?style=flat-square)](https://github.com/substrate-system/dialog/actions/workflows/nodejs.yml)
[![types](https://img.shields.io/npm/types/@substrate-system/dialog?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](https://common-changelog.org)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/dialog)](https://packagephobia.com/result?p=@substrate-system/dialog)
[![GZip size](https://flat.badgen.net/bundlephobia/minzip/@substrate-system/dialog)](https://bundlephobia.com/package/@substrate-system/dialog)
[![license](https://img.shields.io/badge/license-Big_Time-blue?style=flat-square)](LICENSE)


Modal/dialog window.

See [smashingmagazine.com article](https://www.smashingmagazine.com/2022/04/cta-modal-build-web-component/) and [nathansmith/cta-modal](https://github.com/nathansmith/cta-modal/tree/main).


<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Demo](#demo)
- [Install](#install)
- [Use](#use)
  * [FOUCE](#fouce)
  * [Bundler](#bundler)
  * [HTML only](#html-only)
- [API](#api)
  * [Attributes](#attributes)
  * [Methods](#methods)
- [Accessibility](#accessibility)
- [Example](#example)
- [credits](#credits)

<!-- tocstop -->

</details>

## Demo

See [substrate-system.github.io/modal](https://substrate-system.github.io/modal/).

## Install

```sh
npm i -S @substrate-system/dialog
```

## Use

### FOUCE

>
> [!NOTE]
> You should prevent the flash of undefined custom elements, because
> the modal content should be hidden from the user until it is opened.
> See [abeautifulsite.net](https://www.abeautifulsite.net/posts/revisiting-fouce).
>

In the example, we have:

```ts
import { ModalWindow } from '@substrate-system/dialog'

(async () => {
    await Promise.race([
        // Load all custom elements
        Promise.allSettled([
            customElements.whenDefined(ModalWindow.TAG),  // modal-window
        ]),
        // Resolve after two seconds
        new Promise(resolve => setTimeout(resolve, 2000))
    ])

    // Remove the class, showing the page content
    document.body.classList.remove('reduce-fouce')
})()
```

And the HTML has a class `reduce-fouce`:

```html
<body class="reduce-fouce">
```

The CSS:

```css
body {
    &.reduce-fouce {
        opacity: 0;
    }
}
```

### Bundler

Just import. This calls the global function `window.customElements.define`.

```js
import '@substrate-system/dialog'
```

Then use the tag in HTML:

```html
<button id="open-modal" type="button">Open modal</button>

<modal-window id="my-modal">
    <h2>Modal Title</h2>
    <p>This is the modal content.</p>
    <p>Click the X, press Escape, or click outside to close.</p>
</modal-window>
```

Open/close via JavaScript:

```js
const modal = document.getElementById('my-modal')

document.getElementById('open-modal').addEventListener('click', () => {
    modal.open()
})
```

### HTML only

First copy the file to a location accessible to your web server.

```sh
cp ./node_modules/@substrate-system/dialog/dist/index.min.js ./public/dialog.js
```

Then link to the file in HTML
```html
<body>
    <p>...content...</p>
    <script type="module" src="/dialog.js"></script>
</body>
```

## API

### Attributes

#### `active`

Controls whether the modal is open. Set to `"true"` to open, `"false"` or remove the attribute to close.

```js
modal.setAttribute('active', 'true')   // open
modal.setAttribute('active', 'false')  // close
modal.removeAttribute('active')        // close
```

#### `closable`

Set to `"false"` to prevent the modal from being closed via the close button, Escape key, or clicking outside. You must close it programmatically. Defaults to `true`.

```html
<modal-window closable="false">
    <h2>Unclosable Modal</h2>
    <p>This modal cannot be closed with the X button, Escape key, or clicking outside.</p>
    <button id="close-btn" type="button">Close this modal</button>
</modal-window>
```

```js
document.getElementById('close-btn').addEventListener('click', () => {
    modal.close()
})
```

#### `no-icon`

Hides the close button icon. Useful when you want to provide your own close UI.

```html
<modal-window no-icon>
    <header>
        <button type="button" id="cancel">Cancel</button>
        <h3>Edit profile</h3>
        <button type="button" id="save">Save</button>
    </header>
    <div>...form content...</div>
</modal-window>
```

#### `animated`

Controls whether open/close animations are used. Set to `"false"` to disable. Defaults to `true`. Animations also respect `prefers-reduced-motion`.

```html
<modal-window animated="false">
    <p>No animation</p>
</modal-window>
```

#### `static`

When set to `"true"`, clicking outside the modal does not close it. The Escape key and close button still work (unless `closable="false"`).

```html
<modal-window static="true">
    <p>Click outside won't close this</p>
</modal-window>
```

#### `close`

Sets the title/aria-label for the close button. Defaults to "Close".

```html
<modal-window close="Dismiss">
    <p>Close button will have title "Dismiss"</p>
</modal-window>
```

### Methods

#### `open()`

Opens the modal and focuses it.

```js
const modal = document.querySelector('modal-window')
modal.open()
```

#### `close()`

Closes the modal and returns focus to the previously focused element.

```js
modal.close()
```

## Accessibility

Things handled by this library:

* `role="dialog"` and `aria-modal="true"` on the dialog
* Focus trapping (Tab cycles within modal)
* Escape key closes the modal (when `closable`)
* Focus returns to the trigger element on close
* Close button has `aria-label`
* Respects `prefers-reduced-motion`

### Things You Need To Do

### Include a heading

The component extracts text from the first heading (h1-h6) to use as the
dialog's `aria-label`. Always include a descriptive heading:

```html
<!-- Good: heading text becomes the aria-label -->
<modal-window>
    <h2>Edit Profile</h2>
    <p>Update your information below.</p>
</modal-window>

<!-- Avoid: no heading results in aria-label="modal" -->
<modal-window>
    <p>Some content without a heading...</p>
</modal-window>
```

### Adding a description

For modals with important supplementary text (like warnings), you can
add `aria-describedby`. This library will handle an `aria-describedby` attribute
correctly, meaning that it will be forwarded to the correct element.

```html
<modal-window aria-describedby="delete-warning" id="confirm-delete">
    <h2>Delete Account</h2>
    <p id="delete-warning">
        This action cannot be undone.
    </p>
    <button type="button">Cancel</button>
    <button type="button">Delete</button>
</modal-window>
```

## Example

[See `./example`](./example/).

## Credits

Thanks
[@nathansmith](https://github.com/nathansmith) and
[Smashing Magazine](https://www.smashingmagazine.com/2022/04/cta-modal-build-web-component/)
for publishing this originally.
