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

    // Corrected: Dispose the Bootstrap modal instance before removing the DOM element
    $confirmModal.on('hidden.bs.modal', () => {
      confirmModalInstance.dispose(); // Dispose Bootstrap instance
      $confirmModal.remove(); // Clean up modal from DOM after it's hidden
    });

    confirmModalInstance.show();
  };

  /**
   * Event Bus for decoupling communication between modules.
   */
  class EventBus {
    constructor() {
      this.listeners = {};
    }

    /**
     * Subscribes to an event.
     * @param {string} event - The name of the event.
     * @param {function} callback - The callback function to execute when the event is emitted.
     */
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }

    /**
     * Unsubscribes from an event.
     * @param {string} event - The name of the event.
     * @param {function} callback - The callback function to remove.
     */
    off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(
        (listener) => listener !== callback
      );
    }

    /**
     * Emits an event with optional data.
     * @param {string} event - The name of the event to emit.
     * @param {*} data - Optional data to pass to the listeners.
     */
    emit(event, data) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }

  /**
   * InputValidator class for validating various input fields and displaying validation feedback.
   */
  class InputValidator {
    /**
     * Validates filter input fields.
     * @param {object} filters - An object containing filter values.
     * @param {function} showErrorCallback - Callback function to display an error message (e.g., a toast).
     * @returns {boolean} - True if all inputs are valid, false otherwise.
     */
    validateUserFilters(filters, showErrorCallback) {
      const {
        startId,
        endId,
        createdAtStart,
        createdAtEnd,
        updatedAtStart,
        updatedAtEnd
      } = filters;

      if (startId !== null && isNaN(startId)) {
        showErrorCallback('Start ID must be a number!');
        return false;
      }
      if (endId !== null && isNaN(endId)) {
        showErrorCallback('End ID must be a number!');
        return false;
      }
      if (startId !== null && endId !== null && startId > endId) {
        showErrorCallback('Start ID cannot be greater than End ID!');
        return false;
      }

      let dateCreatedAtStart = null;
      if (createdAtStart) {
        dateCreatedAtStart = new Date(createdAtStart);
        if (isNaN(dateCreatedAtStart.getTime())) {
          showErrorCallback('Invalid Created At Start date format!');
          return false;
        }
      }
      let dateCreatedAtEnd = null;
      if (createdAtEnd) {
        dateCreatedAtEnd = new Date(createdAtEnd);
        if (isNaN(dateCreatedAtEnd.getTime())) {
          showErrorCallback('Invalid Created At End date format!');
          return false;
        }
      }
      if (dateCreatedAtStart && dateCreatedAtEnd && dateCreatedAtStart > dateCreatedAtEnd) {
        showErrorCallback('Created At Start date cannot be after Created At End date!');
        return false;
      }

      let dateUpdatedAtStart = null;
      if (updatedAtStart) {
        dateUpdatedAtStart = new Date(updatedAtStart);
        if (isNaN(dateUpdatedAtStart.getTime())) {
          showErrorCallback('Invalid Updated At Start date format!');
          return false;
        }
      }
      let dateUpdatedAtEnd = null;
      if (updatedAtEnd) {
        dateUpdatedAtEnd = new Date(updatedAtEnd);
        if (isNaN(dateUpdatedAtEnd.getTime())) {
          showErrorCallback('Invalid Updated At End date format!');
          return false;
        }
      }
      if (dateUpdatedAtStart && dateUpdatedAtEnd && dateUpdatedAtStart > dateUpdatedAtEnd) {
        showErrorCallback('Updated At Start date cannot be after Updated At End date!');
        return false;
      }
      return true;
    }

    /**
     * Validates a name string.
     * @param {string} name - The name string to validate.
     * @param {function} showErrorCallback - Callback function to display an error message (e.g., for general feedback).
     * @param {object} [$inputElement=null] - Optional: jQuery element of the input field to apply visual feedback.
     * @param {object} [$errorElement=null] - Optional: jQuery element of the error message container for the input.
     * @returns {boolean} - True if the name is valid, false otherwise.
     */
    validateName(name, showErrorCallback, $inputElement = null, $errorElement = null) {
      if (!name || name.trim() === '') {
        const message = 'Name cannot be empty.';
        if ($inputElement && $errorElement) {
          this.showInputError($inputElement, $errorElement, message);
        } else {
          showErrorCallback(message); // Fallback to general error display
        }
        return false;
      }
      if ($inputElement && $errorElement) {
        this.hideError($inputElement, $errorElement);
      }
      return true;
    }

    /**
     * Shows a validation error directly on the input field and its error message element.
     * @param {object} $inputElement - jQuery element of the input field.
     * @param {object} $errorElement - jQuery element of the error message container.
     * @param {string} message - The error message to display.
     */
    showInputError($inputElement, $errorElement, message) {
      $inputElement.addClass('is-invalid');
      $errorElement.text(message).show();
    }

    /**
     * Hides a validation error on the input field and its error message element.
     * @param {object} $inputElement - jQuery element of the input field.
     * @param {object} $errorElement - jQuery element of the error message container.
     */
    hideError($inputElement, $errorElement) {
      $inputElement.removeClass('is-invalid');
      $errorElement.hide();
    }
  }

  /**
   * FilterService class for collecting and managing filter values from DOM.
   */
  class FilterService {
    constructor($startId, $endId, $filterName, $filterCreatedAtStart, $filterCreatedAtEnd, $filterUpdatedAtStart, $filterUpdatedAtEnd) {
      this.$startId = $startId;
      this.$endId = $endId;
      this.$filterName = $filterName;
      this.$filterCreatedAtStart = $filterCreatedAtStart;
      this.$filterCreatedAtEnd = $filterCreatedAtEnd;
      this.$filterUpdatedAtStart = $filterUpdatedAtStart;
      this.$filterUpdatedAtEnd = $filterUpdatedAtEnd;
    }

    /**
     * Gets all current filter values from the DOM.
     * @returns {object} - An object containing all filter values.
     */
    getFilterValues() {
      return {
        startId: this.$startId.val() ? parseInt(this.$startId.val()) : null,
        endId: this.$endId.val() ? parseInt(this.$endId.val()) : null,
        nameFilter: this.$filterName.val(),
        createdAtStart: this.$filterCreatedAtStart.val(),
        createdAtEnd: this.$filterCreatedAtEnd.val(),
        updatedAtStart: this.$filterUpdatedAtStart.val(),
        updatedAtEnd: this.$filterUpdatedAtEnd.val(),
      };
    }

    /**
     * Clears all filter input fields.
     */
    clearFilterFields() {
      this.$startId.val('');
      this.$endId.val('');
      this.$filterName.val('');
      this.$filterCreatedAtStart.val('');
      this.$filterCreatedAtEnd.val('');
      this.$filterUpdatedAtStart.val('');
      this.$filterUpdatedAtEnd.val('');

      this.$filterCreatedAtStart.removeAttr('max');
      this.$filterCreatedAtEnd.removeAttr('min');
      this.$filterUpdatedAtStart.removeAttr('max');
      this.$filterUpdatedAtEnd.removeAttr('min');
    }

    /**
     * Checks if any filter fields currently have values.
     * @returns {boolean} - True if any filter field has a value, false otherwise.
     */
    hasActiveFilters() {
      return (
      this.$startId.val() !== '' ||
      this.$endId.val() !== '' ||
      this.$filterName.val() !== '' ||
      this.$filterCreatedAtStart.val() !== '' ||
      this.$filterCreatedAtEnd.val() !== '' ||
      this.$filterUpdatedAtStart.val() !== '' ||
      this.$filterUpdatedAtEnd.val() !== ''
      );
    }
  }


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
  window.EventBus = new EventBus(); // Expose the EventBus globally
  window.InputValidator = new InputValidator(); // Expose InputValidator globally
  window.FilterService = FilterService; // Expose FilterService constructor globally
})();
