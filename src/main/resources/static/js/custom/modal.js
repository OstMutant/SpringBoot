(function() {
  // Private variables
  let $saveButton, $modalName, $modalNameError, $userModalLabel, userIdToEdit;
  let userModalInstance;

  // Function to open the modal for adding a user
  const openModalForAdd = () => {
    $userModalLabel.text('Add User');
    $modalName.val('');
    userIdToEdit = null;
    // The #triggerButton (in HTML) already has data-bs-toggle="modal" and data-bs-target="#userModal",
    // so Bootstrap handles showing the modal when clicked. This function only prepares its content.
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

      // Always use the Bootstrap instance to show the modal
      if (userModalInstance) {
        userModalInstance.show();
      } else {
        // Fallback for unexpected cases
        $('#userModal').modal('show');
      }
    } catch (error) {
      console.error('Failed to fetch user for edit:', error);
      // Optionally show a user-friendly error message
    }
  };

  // Function to show validation error
  const showError = (inputElement, errorElement, message) => {
    inputElement.addClass('is-invalid');
    errorElement.text(message).show();
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
      showError($modalName, $modalNameError, 'Name cannot be empty.');
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

      const responseData = await response.json(); // Assuming success returns JSON

      if (userModalInstance) {
        userModalInstance.hide();
      } else {
        $('#userModal').modal('hide');
      }

      // Trigger custom events
      if (userIdToEdit) {
        $(document).trigger('userUpdated', responseData);
      } else {
        $(document).trigger('userAdded', responseData);
      }
    } catch (error) {
      console.error('Failed to save user: ', error);
      // Show user-friendly error message
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

      // Add event listener for when the modal is fully hidden
      userModalElement.addEventListener('hidden.bs.modal', () => {
        // Ensure no element within the modal retains focus before moving it
        if (document.activeElement && userModalElement.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        // Return focus to the button that likely opened the modal after a short delay
        // This helps with accessibility, ensuring focus is not lost in a hidden element
        setTimeout(() => {
          $('#triggerButton').focus();
        }, 0); // 0ms delay ensures this runs at the end of the current call stack
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
        showError($modalName, $modalNameError, 'Name cannot be empty.');
      }
    });
  });

  // Expose public functions to the global scope (window) if other scripts need to access them
  window.openModalForAdd = openModalForAdd;
  window.openModalForEdit = openModalForEdit;
})();
