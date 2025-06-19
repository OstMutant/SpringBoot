(function() {
  // Private variables
  let $saveButton, $modalName, $modalNameError, $userModalLabel, userIdToEdit;
  let userModalInstance;

  // Function to open the modal for adding a user
  const openModalForAdd = () => {
    $userModalLabel.text('Add User');
    $modalName.val('');
    userIdToEdit = null;
  };

  // Function to open the modal for editing a user
  const openModalForEdit = async (userId) => {
    try {
      const response = await fetch(`/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const user = await response.json();

      userIdToEdit = userId;
      $userModalLabel.text('Edit User');
      $modalName.val(user.name);

      if (userModalInstance) {
        userModalInstance.show();
      } else {
        $('#userModal').modal('show');
      }
    } catch (error) {
      console.error('Failed to fetch user for edit:', error);
      // Use global showUserFeedback for API errors
      window.showUserFeedback('Failed to load user data for editing. Please try again later.', 'danger');
    }
  };

  // Function to show validation error
  const showError = (message) => {
    // This showError is for local validation messages, not general API errors
    // Use window.showUserFeedback for general errors
    window.showUserFeedback(message, 'danger');
  };

  // Function to hide validation error
  const hideError = (inputElement, errorElement) => {
    inputElement.removeClass('is-invalid');
    errorElement.hide();
  };

  // Function to save (add or update) a user
  const saveUser = async () => {
    const userName = $modalName.val().trim();

    if (!userName) {
      showError('Name cannot be empty.'); // Use local showError for validation
      return;
    }

    hideError($modalName, $modalNameError);

    const user = {
      name: userName
    };
    let url = '/users';
    let method = 'POST';

    if (userIdToEdit) {
      // Edit user
      url = `/users/${userIdToEdit}`;
      method = 'PUT';
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
      }

      const responseData = await response.json();

      if (userModalInstance) {
        userModalInstance.hide();
      } else {
        $('#userModal').modal('hide');
      }

      // Trigger custom events
      if (userIdToEdit) {
        $(document).trigger('userUpdated', responseData);
        window.showUserFeedback('User updated successfully!', 'success'); // Use global showUserFeedback
      } else {
        $(document).trigger('userAdded', responseData);
        window.showUserFeedback('User added successfully!', 'success'); // Use global showUserFeedback
      }
    } catch (error) {
      console.error('Failed to save user: ', error);
      window.showUserFeedback('Failed to save user. Please try again later.', 'danger'); // Use global showUserFeedback
    }
  };

  // Initialize DOM elements and event listeners when the document is ready
  $(document).ready(() => {
    $saveButton = $('#saveButton');
    $modalName = $('#modalName');
    $modalNameError = $('#modalNameError');
    $userModalLabel = $('#userModalLabel');
    userIdToEdit = null;

    const userModalElement = document.getElementById('userModal');
    if (userModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      userModalInstance = new bootstrap.Modal(userModalElement);

      userModalElement.addEventListener('hidden.bs.modal', () => {
        if (document.activeElement && userModalElement.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        setTimeout(() => {
          $('#triggerButton').focus();
        }, 0);
      });

    } else {
      console.warn("Bootstrap Modal not found or element not ready. Falling back to jQuery .modal().");
    }

    $saveButton.on('click', saveUser);

    $(document).on('click', '.edit-button', function() {
      const userId = $(this).data('id');
      openModalForEdit(userId);
    });

    $('#triggerButton').on('click', openModalForAdd);

    $modalName.on('input', () => {
      if ($modalName.val().trim()) {
        hideError($modalName, $modalNameError);
      } else {
        // Keep this local as it applies directly to the input field
        $modalName.addClass('is-invalid');
        $modalNameError.text('Name cannot be empty.').show();
      }
    });
  });

  // Expose public functions to the global scope (window) if other scripts need to access them
  window.openModalForAdd = openModalForAdd;
  window.openModalForEdit = openModalForEdit;
})();
