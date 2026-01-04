import { ModalWindow } from '../src/index.js'
import '../src/index.css'

(async () => {
    await Promise.race([
        // Load all custom elements
        Promise.allSettled([
            customElements.whenDefined(ModalWindow.TAG),
        ]),
        // Resolve after two seconds
        new Promise(resolve => setTimeout(resolve, 2000))
    ])

    // Remove the class, showing the page content
    document.body.classList.remove('reduce-fouce')
})()

// Get modal elements
const modal = document.getElementById('my-modal') as ModalWindow
const unclosableModal = document.getElementById('unclosable-modal') as ModalWindow

// Open modal via button click
document.getElementById('open-modal')?.addEventListener('click', () => {
    modal.open()
})

// Open unclosable modal
document.getElementById('open-unclosable')?.addEventListener('click', () => {
    unclosableModal.open()
})

// Close from inside (button in modal content)
document.getElementById('close-from-inside')?.addEventListener('click', () => {
    unclosableModal.close()
})

// Noclick modal
const noclickModal = document.getElementById('noclick-modal') as ModalWindow

document.getElementById('open-noclick')?.addEventListener('click', () => {
    noclickModal.open()
})

// Styled modal (Edit Profile)
const styledModal = document.getElementById('modal-with-style') as ModalWindow

document.getElementById('open-styled')?.addEventListener('click', () => {
    styledModal.open()
})

document.getElementById('cancel-profile')?.addEventListener('click', () => {
    styledModal.close()
})
