import usersPanelController from './usersPanelController.js';
import conferencePanelController from './conferencePanelController.js';

const indexController = {

    /** @type {HTMLCollectionOf<HTMLElement>} */
    _contentPanelElements: null,
    /** @type {HTMLButtonElement} */
    _showPreviousPanelButton: null,
    /** @type {HTMLButtonElement} */
    _showNextPanelButton: null,

    _activeContentPanelIndex: 0,

    init() {
        // Handle panel navigation on mobile
        this._showPreviousPanelButton = document.getElementById('show-previous-panel');
        this._showNextPanelButton = document.getElementById('show-next-panel');
        this._contentPanelElements = document.getElementsByClassName('content-panel');
        const isMobileDevice = window.getComputedStyle(this._showPreviousPanelButton, null)
            .getPropertyValue('display') !== 'none';

        if (isMobileDevice) {
            this._displayActiveContentPanel();

            this._showPreviousPanelButton.addEventListener('click', () => {
                this._activeContentPanelIndex--;
                this._displayActiveContentPanel();
            });

            this._showNextPanelButton.addEventListener('click', () => {
                this._activeContentPanelIndex++;
                this._displayActiveContentPanel();
            });
        }

        // Initialize other controllers
        conferencePanelController.init();
        usersPanelController.init();
    },

    _displayActiveContentPanel() {
        // Only display the active content element
        for (let i = 0; i < this._contentPanelElements.length; i++) {
            const isActive = i === this._activeContentPanelIndex;
            this._contentPanelElements[i].style.display = isActive ? 'flex' : 'none';
        }

        // Update the navigation buttons
        this._showPreviousPanelButton.style.opacity = '0';
        this._showNextPanelButton.style.opacity = '0';

        if (this._activeContentPanelIndex > 0) {
            this._showPreviousPanelButton.style.opacity = '1';

            const previousElement = this._contentPanelElements[this._activeContentPanelIndex - 1];
            const previousName = previousElement.getAttribute('data-nav-name');
            this._showPreviousPanelButton.textContent = '< ' + previousName;
        }
        if (this._activeContentPanelIndex < this._contentPanelElements.length - 1) {
            this._showNextPanelButton.style.opacity = '1';

            const nextElement = this._contentPanelElements[this._activeContentPanelIndex + 1];
            const nextName = nextElement.getAttribute('data-nav-name');
            this._showNextPanelButton.textContent = nextName + ' >';
        }
    }

};

export default indexController;