import { WebComponent, define } from '@substrate-system/web-component'
import { lockBodyScrolling, unlockBodyScrolling } from '@substrate-system/scroll-lock'

// for docuement.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'modal-window':ModalWindow
    }
}

/**
 * Modal window web component.
 *
 * Opens/closes via the `active` attribute:
 *   modal.setAttribute('active', 'true')  // open
 *   modal.setAttribute('active', 'false') // close
 *   modal.removeAttribute('active')       // close
 *
 * Or via methods:
 *   modal.open()
 *   modal.close()
 */

// ==========
// Constants.
// ==========

const ACTIVE = 'active'
const ANIMATED = 'animated'
const ANIMATION_DURATION = 250
const ARIA_DESCRIBEDBY = 'aria-describedby'
const ARIA_LABEL = 'aria-label'
const CLOSE = 'close'
const CLOSE_TITLE = 'Close'
const NO_ICON = 'no-icon'
const CLASS_HIDE = 'modal-hide'
const CLASS_SHOW = 'modal-show'
const CLASS_VISIBLE = 'modal-visible'
const ESCAPE = 'escape'
const FALSE = 'false'
const FOCUSIN = 'focusin'
const KEYDOWN = 'keydown'
const MODAL_LABEL_FALLBACK = 'modal'
const NOCLICK = 'noclick'
const PREFERS_REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const SPACE = ' '
const SPACE_REGEX = /\s+/g
const STATIC = 'static'
const TAB = 'tab'
const TRUE = 'true'

const FOCUSABLE_SELECTORS = [
    '[contenteditable]',
    '[tabindex="0"]:not([disabled])',
    'a[href]',
    'audio[controls]',
    'button:not([disabled])',
    'iframe',
    "input:not([disabled]):not([type='hidden'])",
    'select:not([disabled])',
    'summary',
    'textarea:not([disabled])',
    'video[controls]',
].join(',')

// ====================
// The component
// ====================

export class ModalWindow extends WebComponent.create('modal-window') {
    // Element references (set during build).
    _buttonClose:HTMLButtonElement|null = null
    _modal:HTMLDialogElement|null = null
    _modalOverlay:HTMLDivElement|null = null
    _modalScroll:HTMLDivElement|null = null
    _modalContent:HTMLDivElement|null = null
    _focusTrap1:HTMLSpanElement|null = null
    _focusTrap2:HTMLSpanElement|null = null
    _heading:HTMLElement|null = null

    static TAG:string = 'modal-window'

    // State.
    _activeElement:HTMLElement|null = null
    _isActive = false
    _isAnimated = true
    _isBuilt = false
    _isHideShow = false
    _isStatic = false
    _timerForHide:number|undefined
    _timerForShow:number|undefined
    _closable:boolean = true
    _showIcon:boolean = true
    _noClick:boolean = false

    // =======================
    // Lifecycle: constructor.
    // =======================

    constructor () {
        super()
        this._bind()
    }

    // for TS, inheritance
    render () {
        const contentNodes = Array.from(this.childNodes)
        return this._buildModal(contentNodes)
    }

    // ============================
    // Helper: build modal structure.
    // ============================

    _buildModal (contentNodes:Node[]):void {
        // Create focus trap
        const createFocusTrap = () => {
            const trap = document.createElement('span')
            trap.classList.add('modal-focus-trap')
            trap.tabIndex = 0
            return trap
        }

        // Create scroll container
        const scroll = document.createElement('div')
        scroll.classList.add('modal-scroll')
        this._modalScroll = scroll

        // Create overlay
        const overlay = document.createElement('div')
        overlay.classList.add('modal-overlay')
        this._modalOverlay = overlay

        // Create dialog
        const dialog = document.createElement('dialog')
        dialog.setAttribute('aria-modal', 'true')
        dialog.classList.add('modal-dialog')
        dialog.tabIndex = -1
        this._modal = dialog

        // Create close button if closable and icon should be shown
        if (this._closable && this._showIcon) {
            const closeBtn = document.createElement('button')
            closeBtn.classList.add('modal-close')
            closeBtn.type = 'button'
            closeBtn.innerHTML = '&times;'
            dialog.appendChild(closeBtn)
            this._buttonClose = closeBtn
        }

        // Create content wrapper
        const content = document.createElement('div')
        content.classList.add('modal-content')
        this._modalContent = content

        // Move content nodes into the content wrapper
        contentNodes.forEach(node => {
            content.appendChild(node)
        })

        dialog.appendChild(content)

        // Create focus traps
        this._focusTrap1 = createFocusTrap()
        this._focusTrap2 = createFocusTrap()

        // Assemble structure
        overlay.appendChild(dialog)
        scroll.appendChild(this._focusTrap1)
        scroll.appendChild(overlay)
        scroll.appendChild(this._focusTrap2)

        // Add to component
        this.appendChild(scroll)
    }

    // ============================
    // Lifecycle: watch attributes.
    // ============================

    static get observedAttributes () {
        return [ACTIVE, ANIMATED, ARIA_DESCRIBEDBY, CLOSE, STATIC]
    }

    // ==============================
    // Lifecycle: attributes changed.
    // ==============================

    async attributeChangedCallback (
        name:string,
        oldValue:string,
        newValue:string
    ) {
        // Different old/new values?
        if (oldValue !== newValue) {
            // Changed [active="…"] value?
            if (name === ACTIVE) {
                this._setActiveFlag()
            }

            // Changed [animated="…"] value?
            if (name === ANIMATED) {
                this._setAnimationFlag()
            }

            // Changed [aria-describedby="…"] value?
            if (name === ARIA_DESCRIBEDBY) {
                this._setModalDescription()
            }

            // Changed [close="…"] value?
            if (name === CLOSE) {
                this._setCloseTitle()
            }

            // Changed [static="…"] value?
            if (name === STATIC) {
                this._setStaticFlag()
            }
        }
    }

    // ===========================
    // Lifecycle: component mount.
    // ===========================

    connectedCallback () {
        // Build modal structure once.
        if (!this._isBuilt) {
            this._closable = this.getAttribute('closable') !== 'false'
            this._showIcon = !this.hasAttribute(NO_ICON)
            this._noClick = this.hasAttribute(NOCLICK)

            // Get heading for aria-label.
            this._heading = this.querySelector('h1, h2, h3, h4, h5, h6')

            // Collect all child nodes.
            const contentNodes = Array.from(this.childNodes)

            // Build the modal structure.
            this._buildModal(contentNodes)

            // Set animation flag.
            this._setAnimationFlag()

            // Set close title.
            this._setCloseTitle()

            // Set modal label.
            this._setModalLabel()

            // Set modal description.
            this._setModalDescription()

            // Set static flag.
            this._setStaticFlag()

            // Set active flag.
            this._setActiveFlag()

            this._isBuilt = true
        }

        this._addEvents()
    }

    // =============================
    // Lifecycle: component unmount.
    // =============================

    disconnectedCallback () {
        this._removeEvents()
    }

    // ============================
    // Helper: bind `this` context.
    // ============================

    _bind () {
        const propertyNames = Object.getOwnPropertyNames(
            Object.getPrototypeOf(this)
        ) as (keyof ModalWindow)[]

        propertyNames.forEach((name) => {
            // Bind functions.
            if (typeof this[name] === 'function') {
                // @ts-expect-error bind
                this[name] = this[name].bind(this)
            }
        })
    }

    // ===================
    // Helper: add events.
    // ===================

    _addEvents () {
        // Prevent doubles.
        this._removeEvents()

        document.addEventListener(FOCUSIN, this._handleFocusIn)
        document.addEventListener(KEYDOWN, this._handleKeyDown)

        if (this._buttonClose) {
            this._buttonClose.addEventListener('click',
                this._handleClickClose)
        }
        if (this._modalOverlay) {
            this._modalOverlay.addEventListener('click',
                this._handleClickOverlay)
        }
    }

    // ======================
    // Helper: remove events.
    // ======================

    _removeEvents () {
        document.removeEventListener(FOCUSIN, this._handleFocusIn)
        document.removeEventListener(KEYDOWN, this._handleKeyDown)

        if (this._buttonClose) {
            this._buttonClose.removeEventListener(
                'click',
                this._handleClickClose
            )
        }
        if (this._modalOverlay) {
            this._modalOverlay.removeEventListener(
                'click',
                this._handleClickOverlay
            )
        }
    }

    // ===========================
    // Helper: set animation flag.
    // ===========================

    _setAnimationFlag () {
        this._isAnimated = this.getAttribute(ANIMATED) !== FALSE
    }

    // ========================
    // Helper: add close title.
    // ========================

    _setCloseTitle () {
        // Get title.
        const title = this.getAttribute(CLOSE) || CLOSE_TITLE

        // Set title.
        if (this._buttonClose) {
            this._buttonClose.title = title
            this._buttonClose.setAttribute(ARIA_LABEL, title)
        }
    }

    // ========================
    // Helper: add modal label.
    // ========================

    _setModalLabel () {
        // Set later.
        let label = MODAL_LABEL_FALLBACK

        // Heading exists?
        if (this._heading) {
            // Get text.
            label = this._heading.textContent || label
            label = label.trim().replace(SPACE_REGEX, SPACE)
        }

        // Set label.
        if (this._modal) {
            this._modal.setAttribute(ARIA_LABEL, label)
        }
    }

    // ==============================
    // Helper: set modal description.
    // ==============================

    _setModalDescription () {
        if (!this._modal) return

        const describedBy = this.getAttribute(ARIA_DESCRIBEDBY)

        if (describedBy) {
            this._modal.setAttribute(ARIA_DESCRIBEDBY, describedBy)
        } else {
            this._modal.removeAttribute(ARIA_DESCRIBEDBY)
        }
    }

    // ========================
    // Helper: set active flag.
    // ========================

    _setActiveFlag () {
        // Get flag.
        const isActive = this.getAttribute(ACTIVE) === TRUE

        // Set flag.
        this._isActive = isActive

        // Set display.
        this._toggleModalDisplay(() => {
            // Focus modal?
            if (this._isActive) {
                this._focusModal()
            }
        })
    }

    // ========================
    // Helper: set static flag.
    // ========================

    _setStaticFlag () {
        this._isStatic = this.getAttribute(STATIC) === TRUE
    }

    // ======================
    // Helper: focus element.
    // ======================

    _focusElement (element: HTMLElement) {
        window.requestAnimationFrame(() => {
            if (typeof element.focus === 'function') {
                element.focus()
            }
        })
    }

    // ====================
    // Helper: focus modal.
    // ====================

    _focusModal () {
        window.requestAnimationFrame(() => {
            if (this._modal) {
                this._modal.focus()
            }
            if (this._modalScroll) {
                this._modalScroll.scrollTo(0, 0)
            }
        })
    }

    // =============================
    // Helper: detect outside modal.
    // =============================

    _isOutsideModal (element?: HTMLElement) {
        // Early exit.
        if (!this._isActive || !element || !this._modal) {
            return false
        }

        // Has element?
        const hasElement = this.contains(element) || this._modal.contains(element)

        // Get boolean.
        const bool = !hasElement

        // Expose boolean.
        return bool
    }

    // ===========================
    // Helper: detect motion pref.
    // ===========================

    _isMotionOkay () {
        // Get pref.
        const { matches } = window.matchMedia(PREFERS_REDUCED_MOTION)

        // Expose boolean.
        return this._isAnimated && !matches
    }

    // =====================
    // Helper: toggle modal.
    // =====================

    _toggleModalDisplay (callback: () => void) {
        if (!this._modalScroll) return

        // @ts-expect-error boolean
        this.setAttribute(ACTIVE, this._isActive)

        // Get booleans.
        const isModalVisible = this._modalScroll.classList.contains(CLASS_VISIBLE)
        const isMotionOkay = this._isMotionOkay()

        // Get delay.
        const delay = isMotionOkay ? ANIMATION_DURATION : 0

        // Get active element.
        const activeElement = document.activeElement as HTMLElement

        // Cache active element?
        if (this._isActive && activeElement) {
            this._activeElement = activeElement
        }

        // =============
        // Modal active?
        // =============

        if (this._isActive) {
            // Show modal.
            this._modalScroll.classList.add(CLASS_VISIBLE)

            // Lock body scrolling.
            lockBodyScrolling(document.body)

            // Set flag.
            if (isMotionOkay) {
                this._isHideShow = true
                this._modalScroll.classList.add(CLASS_SHOW)
            }

            // Fire callback.
            callback()

            // Await CSS animation.
            this._timerForShow = window.setTimeout(() => {
                // Clear.
                clearTimeout(this._timerForShow)

                // Remove flag.
                this._isHideShow = false
                this._modalScroll?.classList.remove(CLASS_SHOW)
            }, delay)
        } else if (isModalVisible) {
            // Set flag.
            if (isMotionOkay) {
                this._isHideShow = true
                this._modalScroll.classList.add(CLASS_HIDE)
            }

            // Fire callback?
            callback()

            // Await CSS animation.
            this._timerForHide = window.setTimeout(() => {
                // Clear.
                clearTimeout(this._timerForHide)

                // Remove flag.
                this._isHideShow = false
                this._modalScroll?.classList.remove(CLASS_HIDE)

                // Hide modal.
                this._modalScroll?.classList.remove(CLASS_VISIBLE)

                // Unlock body scrolling.
                unlockBodyScrolling(document.body)

                // Delay.
            }, delay)
        }
    }

    // =====================
    // Event: overlay click.
    // =====================

    _handleClickOverlay (event: MouseEvent) {
        if (this._isHideShow || this._isStatic || this._noClick) return
        if (!this._closable) return

        // Get layer.
        const target = event.target as HTMLElement

        // Outside modal? (clicked directly on overlay, not dialog)
        if (target === this._modalOverlay) {
            this.close()
        }
    }

    // ====================
    // Event: close button click.
    // ====================

    _handleClickClose () {
        this.close()
    }

    // =========================
    // Event: focus in document.
    // =========================

    _handleFocusIn () {
        if (!this._isActive || !this._modal) return

        const activeElement = document.activeElement as HTMLElement

        // Get booleans.
        const isFocusTrap1 = activeElement === this._focusTrap1
        const isFocusTrap2 = activeElement === this._focusTrap2

        // Get focusable elements in modal.
        const focusList = Array.from(
            this._modal.querySelectorAll(FOCUSABLE_SELECTORS)
        ) as HTMLElement[]

        // Get first & last items.
        const focusItemFirst = focusList[0]
        const focusItemLast = focusList[focusList.length - 1]

        // Focus trap: above?
        if (isFocusTrap1 && focusItemLast) {
            this._focusElement(focusItemLast)

        // Focus trap: below?
        } else if (isFocusTrap2 && focusItemFirst) {
            this._focusElement(focusItemFirst)

        // Outside modal?
        } else if (this._isOutsideModal(activeElement)) {
            this._focusModal()
        }
    }

    // =================
    // Event: key press.
    // =================

    _handleKeyDown ({ key }:KeyboardEvent) {
        if (!this._isActive) return

        key = key.toLowerCase()

        // Escape key?
        if (
            key === ESCAPE &&
            !this._isHideShow &&
            !this._isStatic &&
            this._closable
        ) {
            this.close()
        }

        // Tab key?
        if (key === TAB) {
            this._handleFocusIn()
        }
    }

    // =================
    // Public: open modal.
    // =================

    open () {
        this._isActive = true
        this._toggleModalDisplay(() => {
            this._focusModal()
        })
    }

    // =================
    // Public: close modal.
    // =================

    close () {
        this._isActive = false
        this._toggleModalDisplay(() => {
            if (this._activeElement) {
                this._focusElement(this._activeElement)
            }
        })
        this.emit('close')
    }
}

define(ModalWindow.TAG, ModalWindow)
