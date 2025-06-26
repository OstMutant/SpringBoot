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
          }
        });
      }

      this.$saveButton.on('click', this.handleSaveUser.bind(this));

      // Set focus to the first input field when the modal is shown
      $(userModalElement).on('shown.bs.modal', () => {
        this.$modalName.focus();
      });
    }

    /**
     * Opens the user modal for adding a new user.
     */
    openModalForAdd() {
      this.userIdToEdit = null; // Ensure ID is null for add mode
      this.$userModalLabel.text('Add User'); // Set modal title
      this.$modalName.val(''); // Clear form field
      window.InputValidator.hideError(this.$modalName, this.$modalNameError); // Use InputValidator to hide error

      this.saveScrollAndDisableScroll(); // Save scroll and disable body scroll
      this.userModalInstance.show(); // Show the modal
    }

    /**
     * Opens the user modal for editing an existing user.
     * @param {number} userId - The ID of the user to edit.
     * @param {HTMLElement} [triggeringElement=null] - The DOM element that triggered the modal opening.
     */
    async openModalForEdit(userId, triggeringElement = null) {
      this.userIdToEdit = userId; // Store the ID of the user being edited
      this.$userModalLabel.text('Edit User'); // Set modal title
      window.InputValidator.hideError(this.$modalName, this.$modalNameError); // Use InputValidator to hide error

      // Store the element that triggered the modal
      this.lastFocusedElement = triggeringElement;

      this.saveScrollAndDisableScroll(); // Save scroll and disable body scroll

      try {
        const user = await window.Api.fetchUser(userId); // Fetch user data using global Api
        this.$modalName.val(user.name); // Populate form field
        this.userModalInstance.show(); // Show the modal
      } catch (error) {
        console.error('Failed to fetch user for editing: ', error);
        window.showUserFeedback('Failed to load user data. Please try again later.', 'danger');
        this.userModalInstance.hide(); // Hide modal if data fetch fails
      }
    }

    /**
     * Saves the current scroll position and disables body scrolling.
     */
    saveScrollAndDisableScroll() {
      this.scrollPosition = window.scrollY || document.documentElement.scrollTop;
      document.documentElement.style.overflow = 'hidden'; // Disable scroll on html
      document.body.style.overflow = 'hidden'; // Disable scroll on body (for consistency)
    }

    /**
     * Handles saving the user (add or edit).
     */
    async handleSaveUser() {
      const name = this.$modalName.val();
      if (!window.InputValidator.validateName(name, window.showUserFeedback, this.$modalName, this.$modalNameError)) {
        return; // Stop if form is not valid
      }

      const userData = {
        name: name.trim()
      };

      try {
        const responseData = await window.Api.saveUser(userData, this.userIdToEdit); // Use window.Api

        // Blur the active element within the modal before hiding it, if any
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
