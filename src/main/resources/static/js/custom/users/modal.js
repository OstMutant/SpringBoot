(function() {
  class UserModal {
    constructor() {
      this.$saveButton = $('#saveButton');
      this.$modalName = $('#modalName');
      this.$modalNameError = $('#modalNameError');
      this.$userModalLabel = $('#userModalLabel');
      this.userIdToEdit = null;
      this.lastFocusedElement = null;
      this.scrollPosition = 0; // Variable to store scroll position

      const userModalElement = document.getElementById('userModal');

      if (userModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        this.userModalInstance = new bootstrap.Modal(userModalElement);

        userModalElement.addEventListener('hidden.bs.modal', () => {
          // Blur the active element within the modal before hiding it, if any
          if (document.activeElement && userModalElement.contains(document.activeElement)) {
            document.activeElement.blur();
          }

          // Restore scroll position and re-enable scrolling on HTML/Body
          document.documentElement.style.overflow = ''; // Re-enable scroll on html
          document.body.style.overflow = ''; // Re-enable scroll on body (for consistency)
          window.scrollTo(0, this.scrollPosition); // Restore the scroll position

          // Return focus to the element that opened the modal, preventing scroll
          if (this.lastFocusedElement) {
            this.lastFocusedElement.focus({ preventScroll: true });
            this.lastFocusedElement = null; // Clear the stored element
          } else {
            // Fallback to triggerButton, preventing scroll
            $('#triggerButton').focus({ preventScroll: true });
          }
        });

        userModalElement.addEventListener('shown.bs.modal', () => {
          // Store current scroll position before modal is shown
          this.scrollPosition = window.scrollY;
          // Disable scrolling on HTML and Body
          document.documentElement.style.overflow = 'hidden'; // Disable scroll on html
          document.body.style.overflow = 'hidden'; // Disable scroll on body (for consistency)

          // Ensure focus is explicitly on the modal container
          userModalElement.focus();
        });

        // Removed the custom 'focusin' event listener to avoid conflict with Bootstrap's a11y focus management
        // userModalElement.addEventListener('focusin', (event) => {
        //   if (!userModalElement.contains(event.target)) {
        //     userModalElement.focus();
        //   }
        // });

      } else {
        console.warn("Bootstrap Modal not found or element not ready. Falling back to jQuery .modal().");
      }

      this.$saveButton.on('click', this.saveUser.bind(this));
      this.$modalName.on('input', this.handleNameInput.bind(this));

      // Handle click on any data-bs-dismiss="modal" button within this specific modal (e.g., Close, Cancel)
      $(userModalElement).on('click', '[data-bs-dismiss="modal"]', (event) => {
        // Ensure the event originated from a button inside THIS specific modal
        if ($(event.currentTarget).closest(userModalElement).length) {
          // Explicitly blur the active element (the clicked button)
          if (document.activeElement) {
            document.activeElement.blur();
          }
          // Bootstrap's data-bs-dismiss="modal" will handle the hide() call
        }
      });
    }

    openModalForAdd() {
      this.$userModalLabel.text('Add User');
      this.$modalName.val('');
      this.userIdToEdit = null;
      window.InputValidator.hideError(this.$modalName, this.$modalNameError);
      this.lastFocusedElement = $('#triggerButton')[0]; // Store the Add User button as the last focused element
      this.userModalInstance.show(); // Explicitly show modal here
    }

    async openModalForEdit(userId, triggeringElement) {
      try {
        const user = await window.Api.fetchUser(userId);

        this.userIdToEdit = userId;
        this.$userModalLabel.text('Edit User');
        this.$modalName.val(user.name);
        window.InputValidator.hideError(this.$modalName, this.$modalNameError);
        this.lastFocusedElement = triggeringElement; // Store the specific edit button

        this.userModalInstance.show(); // Explicitly show modal here
      } catch (error) {
        console.error('Failed to fetch user for edit:', error);
        window.showUserFeedback('Failed to load user data for editing. Please try again later.', 'danger');
      }
    }

    handleNameInput() {
      const userName = this.$modalName.val().trim();
      window.InputValidator.validateName(userName, window.showUserFeedback, this.$modalName, this.$modalNameError);
    }

    async saveUser() {
      const userName = this.$modalName.val().trim();

      const isNameValid = window.InputValidator.validateName(userName, window.showUserFeedback, this.$modalName, this.$modalNameError);

      if (!isNameValid) {
        return;
      }

      const user = {
        name: userName
      };

      try {
        const responseData = await window.Api.saveUser(user, this.userIdToEdit);

        // Explicitly blur the save button before hiding the modal to prevent focus retention issues.
        if (document.activeElement) {
          document.activeElement.blur();
        }

        this.userModalInstance.hide(); // Explicitly hide modal here

        if (this.userIdToEdit) {
          window.EventBus.emit('user:updated', responseData);
          window.showUserFeedback('User updated successfully!', 'success');
        } else {
          window.EventBus.emit('user:added', responseData);
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
      // Pass the triggering element to openModalForEdit
      userModal.openModalForEdit(userId, this);
    });

    $('#triggerButton').on('click', () => userModal.openModalForAdd());

    // Expose public methods globally if other modules (like user_list.js) need to access them
    // This maintains compatibility with how user_list.js currently calls openModalForEdit
    window.openModalForAdd = userModal.openModalForAdd.bind(userModal);
    window.openModalForEdit = userModal.openModalForEdit.bind(userModal);
  });
})();
