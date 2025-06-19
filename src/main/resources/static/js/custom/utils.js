(function() {
  // Centralized configuration for utilities (e.g., for feedback duration)
  const UtilsConfig = {
    feedbackDuration: 5000, // Milliseconds for toast messages auto-dismissal
  };

  /**
   * Displays a user feedback message using Bootstrap alert (toast-like).
   * @param {string} message - The message to display.
   * @param {string} type - The type of alert ('success', 'danger', 'info', 'warning').
   */
  const showUserFeedback = (message, type = 'danger') => {
    const alertId = `alert-${Date.now()}`;
    const alertHtml = `
      <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show fixed-top mx-auto mt-3" role="alert" style="max-width: 500px; z-index: 2000;">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    $('body').append(alertHtml);

    // Auto-dismiss after configured duration
    setTimeout(() => {
      const alertElement = $(`#${alertId}`);
      if (alertElement.length && alertElement.alert) {
        alertElement.alert('close');
      } else {
        alertElement.remove();
      }
    }, UtilsConfig.feedbackDuration);
  };

  /**
   * Displays a confirmation modal with a custom message and callback.
   * @param {string} message - The confirmation message to display.
   * @param {function} callback - The function to call if the user clicks 'OK'.
   */
  const showConfirmationModal = (message, callback) => {
    const modalId = `confirmModal-${Date.now()}`;
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-xl shadow-lg">
            <div class="modal-header bg-gray-100 border-b border-gray-200">
              <h5 class="modal-title" id="${modalId}Label">Confirm Action</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-6 text-center">
              <p class="text-lg text-gray-700">${message}</p>
            </div>
            <div class="modal-footer justify-content-center border-t border-gray-200 bg-gray-100 p-4">
              <button type="button" class="btn btn-secondary rounded-lg px-4 py-2" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary rounded-lg px-4 py-2" id="confirmOkBtn-${modalId}">OK</button>
            </div>
          </div>
        </div>
      </div>
    `;

    $('body').append(modalHtml);
    const $confirmModal = $(`#${modalId}`);
    const confirmModalInstance = new bootstrap.Modal($confirmModal[0]);

    $(`#confirmOkBtn-${modalId}`).on('click', () => {
      callback();
      confirmModalInstance.hide();
    });

    $confirmModal.on('hidden.bs.modal', () => {
      $confirmModal.remove(); // Clean up modal from DOM after it's hidden
    });

    confirmModalInstance.show();
  };

  // Expose public utility functions to the global scope (window)
  window.showUserFeedback = showUserFeedback;
  window.showConfirmationModal = showConfirmationModal;
})();
