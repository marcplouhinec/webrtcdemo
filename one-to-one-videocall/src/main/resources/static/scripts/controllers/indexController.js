import usersPanelController from './usersPanelController.js';

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
        const isMobileDevice = this._showPreviousPanelButton.style.display !== 'none';

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
        usersPanelController.init();

        /*


        const createSessionButton = document.getElementById('create-session');
        const enterSessionButton = document.getElementById('enter-session');

        createSessionButton.addEventListener('click', async () => {
            createSessionButton.disabled = true;
            enterSessionButton.disabled = true;

            const sessionId = await videoCallService.createSession();
            this._showSessionId(sessionId);

            // TODO open a web socket to the server
        });

        enterSessionButton.addEventListener('click', async () => {
            createSessionButton.disabled = true;
            enterSessionButton.disabled = true;

            const rawSessionId = window.prompt('Please enter a session ID');
            if (!rawSessionId) {
                createSessionButton.disabled = false;
                enterSessionButton.disabled = false;
                return;
            }

            const sessionId = parseInt(rawSessionId);
            if (isNaN(sessionId)) {
                createSessionButton.disabled = false;
                enterSessionButton.disabled = false;
                alert('Error: invalid session ID.');
                return;
            }

            const success = await videoCallService.joinSession(sessionId);
            if (!success) {
                createSessionButton.disabled = false;
                enterSessionButton.disabled = false;
                alert('Error: unable to join the session.');
                return;
            }

            // TODO open the local video and initiate the RTC peer connection
        });

         */
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
    },

    /**
     * @return {Promise<MediaStream>}
     * @private
     */
    async _openLocalVideo() {
        const localVideoElement = document.getElementById('local-video');

        try {
            return localVideoElement.srcObject = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
        } catch (error) {
            console.log(error);
            alert('Error: unable to open the local video.');
        }
    },

    /**
     * @param {Number} sessionId
     * @private
     */
    _showSessionId(sessionId) {
        const sessionIdElement = document.getElementById('session-id');
        sessionIdElement.style.display = 'block';
        sessionIdElement.textContent = 'Please send the following session ID to your friend: ' + sessionId;
    }

};

export default indexController;