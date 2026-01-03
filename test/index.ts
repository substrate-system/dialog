import { test } from '@substrate-system/tapzero'
import { assertNoViolations } from '@substrate-system/tapout/axe'
import { waitFor } from '@substrate-system/dom'
import { ModalWindow } from '../src/index.js'

test('basics', async t => {
    document.body.innerHTML += `
        <modal-window id="test-modal">
            <h2>Test Modal</h2>
            <p>This is test content.</p>
        </modal-window>
    `

    const el = await waitFor('modal-window') as ModalWindow
    t.ok(el, 'should find an element')
    t.ok(el instanceof ModalWindow)

    // Test open/close methods
    el.open()
    t.equal(el.getAttribute('active'), 'true', 'should be active after open()')

    el.close()
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300))
    t.equal(el.getAttribute('active'), 'false', 'should be inactive after close()')
})

test('accessibility - closed modal', async t => {
    document.documentElement.setAttribute('lang', 'en')
    document.body.innerHTML = `
        <main>
            <h1>Page Title</h1>
            <button id="open-btn">Open Modal</button>
            <modal-window id="a11y-modal">
                <h2>Accessible Modal</h2>
                <p>Modal content here.</p>
            </modal-window>
        </main>
    `

    await waitFor('modal-window')
    await assertNoViolations(t)
})

test('accessibility - open modal', async t => {
    document.documentElement.setAttribute('lang', 'en')
    document.body.innerHTML = `
        <main>
            <h1>Page Title</h1>
            <button id="open-btn">Open Modal</button>
            <modal-window id="a11y-modal-open">
                <h2>Accessible Modal</h2>
                <p>Modal content here.</p>
                <button>Close</button>
            </modal-window>
        </main>
    `

    const modal = await waitFor('modal-window') as ModalWindow
    modal.open()

    // Wait for modal to fully render
    await new Promise(resolve => setTimeout(resolve, 100))

    await assertNoViolations(t)
})

test('all done', () => {
    // @ts-expect-error tests
    window.testsFinished = true
})
