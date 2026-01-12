import { test } from '@substrate-system/tapzero'
import { assertNoViolations } from '@substrate-system/tapout/axe'
import { waitFor, click } from '@substrate-system/dom'
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

test('clicking backdrop closes modal by default', async t => {
    document.body.innerHTML = `
        <modal-window id="backdrop-close-test" animated="false">
            <h2>Backdrop Test</h2>
            <p>Test content</p>
        </modal-window>
    `

    const modal = await waitFor('modal-window') as ModalWindow
    modal.open()

    // Wait for modal to fully render (no animation)
    await new Promise(resolve => setTimeout(resolve, 50))
    t.equal(modal.getAttribute('active'), 'true', 'modal should be open')

    // Click on the overlay (backdrop)
    const overlay = await waitFor('.modal-overlay') as HTMLElement
    t.ok(overlay, 'overlay should exist')

    click(overlay)

    // Wait a bit for close
    await new Promise(resolve => setTimeout(resolve, 100))
    t.equal(modal.getAttribute('active'), 'false', 'modal should close after backdrop click')
})

test('noclick attribute prevents backdrop from closing modal', async t => {
    document.body.innerHTML = `
        <modal-window id="noclick-test" noclick animated="false">
            <h2>Noclick Test</h2>
            <p>Test content</p>
        </modal-window>
    `

    const modal = await waitFor('modal-window') as ModalWindow
    modal.open()

    // Wait for modal to fully render (no animation)
    await new Promise(resolve => setTimeout(resolve, 50))
    t.equal(modal.getAttribute('active'), 'true', 'modal should be open')

    // Click on the overlay (backdrop)
    const overlay = await waitFor('.modal-overlay') as HTMLElement
    t.ok(overlay, 'overlay should exist')
    click(overlay)

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100))
    t.equal(modal.getAttribute('active'), 'true',
        'modal should remain open after backdrop click with noclick attribute')

    // But close button should still work
    const closeBtn = modal.querySelector('[data-modal-close]') as HTMLButtonElement
    if (closeBtn) {
        closeBtn.click()
        await new Promise(resolve => setTimeout(resolve, 100))
        t.equal(modal.getAttribute('active'), 'false',
            'close button should still work with noclick attribute')
    }
})

test('noclick attribute allows Escape key to close modal', async t => {
    document.body.innerHTML = `
        <modal-window id="noclick-escape-test" noclick animated="false">
            <h2>Noclick Escape Test</h2>
            <p>Test content</p>
        </modal-window>
    `

    const modal = await waitFor('modal-window') as ModalWindow
    modal.open()

    // Wait for modal to fully render (no animation)
    await new Promise(resolve => setTimeout(resolve, 50))
    t.equal(modal.getAttribute('active'), 'true', 'modal should be open')

    // Press Escape key
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100))
    t.equal(modal.getAttribute('active'), 'false',
        'Escape key should still close modal with noclick attribute')
})

test('all done', () => {
    // @ts-expect-error tests
    window.testsFinished = true
})
