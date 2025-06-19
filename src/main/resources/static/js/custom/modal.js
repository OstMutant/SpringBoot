(function() {
  // Define the UserModal class
  class UserModal {
    constructor() {
      // Initialize DOM elements
      this.$saveButton = $('#saveButton');
      this.$modalName = $('#modalName');
      this.$modalNameError = $('#modalNameError');
      this.$userModalLabel = $('#userModalLabel');
      this.userIdToEdit = null;

      // Get the modal DOM element
      const userModalElement = document.getElementById('userModal');

      // Initialize Bootstrap Modal instance
      if (userModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        this.userModalInstance = new bootstrap.Modal(userModalElement);

        // Add event listener for when the modal is fully hidden
        userModalElement.addEventListener('hidden.bs.modal', () => {
          // Ensure no element within the modal retains focus before moving it
          if (document.activeElement && userModalElement.contains(document.activeElement)) {
            document.activeElement.blur();
          }
          // Return focus to the button that likely opened the modal after a short delay
          setTimeout(() => {
            $('#triggerButton').focus();
          }, 0);
        });

      } else {
        console.warn("Bootstrap Modal not found or element not ready. Falling back to jQuery .modal().");
      }

      // Attach event listeners
      this.$saveButton.on('click', this.saveUser.bind(this)); // Bind 'this' to the class instance
      this.$modalName.on('input', this.handleNameInput.bind(this)); // Bind 'this'
    }

    // Opens the modal for adding a new user
    openModalForAdd() {
      this.$userModalLabel.text('Add User');
      this.$modalName.val('');
      this.userIdToEdit = null;
      this.hideError(this.$modalName, this.$modalNameError); // Clear any previous errors
      // The #triggerButton (in HTML) already has data-bs-toggle="modal" and data-bs-target="#userModal",
      // so Bootstrap handles showing the modal when clicked. This function only prepares its content.
    }

    // Opens the modal for editing an existing user
    async openModalForEdit(userId) {
      try {
        // Use the global Api service to fetch user data
        const user = await window.Api.fetchUser(userId);

        this.userIdToEdit = userId;
        this.$userModalLabel.text('Edit User');
        this.$modalName.val(user.name);
        this.hideError(this.$modalName, this.$modalNameError); // Clear any previous errors

        // Always use the Bootstrap instance to show the modal
        if (this.userModalInstance) {
          this.userModalInstance.show();
        } else {
          // Fallback for unexpected cases
          $('#userModal').modal('show');
        }
      } catch (error) {
        console.error('Failed to fetch user for edit:', error);
        // Use global showUserFeedback for API errors
        window.showUserFeedback('Failed to load user data for editing. Please try again later.', 'danger');
      }
    }

    // Shows a validation error directly on the input field
    showInputError(inputElement, errorElement, message) {
      inputElement.addClass('is-invalid');
      errorElement.text(message).show();
    }

    // Hides a validation error on the input field
    hideError(inputElement, errorElement) {
      inputElement.removeClass('is-invalid');
      errorElement.hide();
    }

    // Handles input changes in the name field for validation feedback
    handleNameInput() {
      if (this.$modalName.val().trim()) {
        this.hideError(this.$modalName, this.$modalNameError);
      } else {
        // Keep this local as it applies directly to the input field
        this.$modalName.addClass('is-invalid');
        this.$modalNameError.text('Name cannot be empty.').show();
      }
    }

    // Saves (adds or updates) a user
    async saveUser() {
      const userName = this.$modalName.val().trim();

      if (!userName) {
        this.showInputError(this.$modalName, this.$modalNameError, 'Name cannot be empty.');
        return;
      }

      this.hideError(this.$modalName, this.$modalNameError);

      const user = {
        name: userName
      };

      try {
        // Use the global Api service to save user data
        const responseData = await window.Api.saveUser(user, this.userIdToEdit);

        if (this.userModalInstance) {
          this.userModalInstance.hide();
        } else {
          $('#userModal').modal('hide');
        }

        // Emit custom event using EventBus
        if (this.userIdToEdit) {
          window.EventBus.emit('user:updated', responseData); // Emit event for user update
          window.showUserFeedback('User updated successfully!', 'success');
        } else {
          window.EventBus.emit('user:added', responseData); // Emit event for user added
          window.showUserFeedback('User added successfully!', 'success');
        }
      } catch (error) {
        console.error('Failed to save user: ', error);
        window.showUserFeedback('Failed to save user. Please try again later.', 'danger');
      }
    }
  }

  // Initialize the UserModal component when the document is ready
  $(document).ready(() => {
    const userModal = new UserModal();

    // Attach event listeners for external triggers
    $(document).on('click', '.edit-button', function() {
      const userId = $(this).data('id');
      userModal.openModalForEdit(userId);
    });

    $('#triggerButton').on('click', () => userModal.openModalForAdd());

    // Expose public methods globally if other modules (like user_list.js) need to access them
    // This maintains compatibility with how user_list.js currently calls openModalForEdit
    window.openModalForAdd = userModal.openModalForAdd.bind(userModal);
    window.openModalForEdit = userModal.openModalForEdit.bind(userModal);
  });
})();
