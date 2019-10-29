const indexController = {

    async main() {
        const localVideoElement = document.getElementById('local-video');

        try {
            localVideoElement.srcObject = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
        } catch (error) {
            this._showError(error);
        }
    },

    _showError(error) {
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.style.display = 'block';
        errorMessageElement.textContent = error;

        console.error(error);
    }

};

indexController.main();