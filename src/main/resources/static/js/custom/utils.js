(function() {
  // Centralized configuration for utilities (e.g., for feedback duration)
  const UtilsConfig = {
    feedbackDuration: 5000, // Milliseconds for toast messages auto-dismissal
    apiBaseUrl: '/users', // Base URL for user API endpoints, duplicated from user_list.js Config for shared API calls
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

  /**
   * API service module for user-related operations.
   */
  const Api = {
    UtilsConfig: UtilsConfig, // Expose UtilsConfig as a property of Api
    /**
     * Fetches a single user by ID.
     * @param {number} userId - The ID of the user to fetch.
     * @returns {Promise<Object>} - A promise that resolves with the user data.
     * @throws {Error} - If the network request fails or response is not OK.
     */
    fetchUser: async (userId) => {
      const response = await fetch(`${UtilsConfig.apiBaseUrl}/${userId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user (ID: ${userId}): ${response.status} - ${errorText}`);
      }
      return response.json();
    },

    /**
     * Saves (creates or updates) a user.
     * @param {Object} user - The user object to save.
     * @param {number|null} userId - The ID of the user if updating, null if creating.
     * @returns {Promise<Object>} - A promise that resolves with the saved user data.
     * @throws {Error} - If the network request fails or response is not OK.
     */
    saveUser: async (user, userId) => {
      let url = UtilsConfig.apiBaseUrl;
      let method = 'POST';

      if (userId) {
        url = `${UtilsConfig.apiBaseUrl}/${userId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save user: ${response.status} - ${errorText}`);
      }
      return response.json();
    },

    /**
     * Deletes a user by ID.
     * @param {number} userId - The ID of the user to delete.
     * @returns {Promise<void>} - A promise that resolves when the user is deleted.
     * @throws {Error} - If the network request fails or response is not OK.
     */
    deleteUser: async (userId) => {
      const response = await fetch(`${UtilsConfig.apiBaseUrl}/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete user (ID: ${userId}): ${response.status} - ${errorText}`);
      }
      // No content expected for delete success
    },

    /**
     * Fetches a list of users with pagination and filtering.
     * @param {Object} params - Query parameters for fetching users.
     * @param {number} page - Current page number.
     * @param {number} pageSize - Number of items per page.
     * @param {string} sortField - Field to sort by.
     * @param {string} sortDirection - Sort direction ('asc' or 'desc').
     * @returns {Promise<Object>} - A promise that resolves with user data and pagination metadata.
     * Note: This currently does not handle streaming from oboe.js.
     * This is a placeholder for a non-streaming fetch approach.
     * @throws {Error} - If the network request fails or response is not OK.
     */
    fetchUsers: async (queryParams) => {
      const params = new URLSearchParams(queryParams);
      const url = `${UtilsConfig.apiBaseUrl}?${params.toString()}`;

      // NOTE: This fetchUsers implementation is for a non-streaming API.
      // Your current loadUsers in user_list.js uses oboe.js for streaming.
      // This part would require significant changes to loadUsers to use fetch stream API,
      // or to switch the backend to return full JSON.
      // For now, this serves as a general fetchUsers example.
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }
      return response.json(); // Assuming the API returns full JSON for non-streaming.
    }
  };


  // Expose public utility functions and the Api module to the global scope (window)
  window.showUserFeedback = showUserFeedback;
  window.showConfirmationModal = showConfirmationModal;
  window.Api = Api; // Expose the API service globally
})();
