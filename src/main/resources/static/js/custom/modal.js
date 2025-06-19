var $saveButton, $modalName, $modalNameError, $userModalLabel, userIdToEdit;
var userModalInstance;

function openModalForAdd() {
  $userModalLabel.text('Add User');
  $modalName.val('');
  userIdToEdit = null;
  // The #triggerButton (in HTML) already has data-bs-toggle="modal" and data-bs-target="#userModal",
  // so Bootstrap handles showing the modal when clicked. This function only prepares its content.
}

function openModalForEdit(userId) {
  $.get('/users/' + userId, function(user) {
    userIdToEdit = userId;
    $userModalLabel.text('Edit User');
    $modalName.val(user.name);
    // Always use the Bootstrap instance to show the modal
    if (userModalInstance) {
      userModalInstance.show();
    } else {
      // Fallback for unexpected cases (though ideally userModalInstance should always be available)
      $('#userModal').modal('show');
    }
  });
}

$(document).ready(function() {
  $saveButton = $('#saveButton');
  $modalName = $('#modalName');
  $modalNameError = $('#modalNameError');
  $userModalLabel = $('#userModalLabel');
  userIdToEdit = null;

  var userModalElement = document.getElementById('userModal');
  if (userModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    userModalInstance = new bootstrap.Modal(userModalElement);

    // Add event listener for when the modal is fully hidden
    userModalElement.addEventListener('hidden.bs.modal', function () {
      // Ensure no element within the modal retains focus before moving it
      if (document.activeElement && userModalElement.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      // Return focus to the button that likely opened the modal after a short delay
      // This helps with accessibility, ensuring focus is not lost in a hidden element
      setTimeout(function() {
        $('#triggerButton').focus();
      }, 0); // 0ms delay ensures this runs at the end of the current call stack
    });

  } else {
    console.warn("Bootstrap Modal not found or element not ready. Falling back to jQuery .modal().");
  }

  function showError(inputElement, errorElement, message) {
    inputElement.addClass('is-invalid');
    errorElement.text(message).show();
  }

  function hideError(inputElement, errorElement) {
    inputElement.removeClass('is-invalid');
    errorElement.hide();
  }

  function saveUser() {
    var userName = $modalName.val().trim();

    if (!userName) {
      showError($modalName, $modalNameError, 'Name cannot be empty.');
      return;
    }

    hideError($modalName, $modalNameError);

    var user = { name: userName };

    if (userIdToEdit) {
      // Edit user
      $.ajax({
        url: '/users/' + userIdToEdit,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(user),
        success: function(response) {
          // Always use the Bootstrap instance to hide the modal
          if (userModalInstance) {
            userModalInstance.hide();
          } else {
            $('#userModal').modal('hide');
          }
          $(document).trigger('userUpdated', response);
        },
        error: function(error) {
          console.error('Failed to update user: ', error.responseText);
        }
      });
    } else {
      // Add user
      $.ajax({
        url: '/users',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(user),
        success: function(response) {
          // Always use the Bootstrap instance to hide the modal
          if (userModalInstance) {
            userModalInstance.hide();
          } else {
            $('#userModal').modal('hide');
          }
          $(document).trigger('userAdded', response);
        },
        error: function(error) {
          console.error('Failed to add user: ', error.responseText);
        }
      });
    }
  }

  $saveButton.on('click', saveUser);

  $(document).on('click', '.edit-button', function() {
    var userId = $(this).data('id');
    openModalForEdit(userId);
  });

  $('#triggerButton').on('click', openModalForAdd);

  $modalName.on('input', function() {
    if ($modalName.val().trim()) {
      hideError($modalName, $modalNameError);
    } else {
      showError($modalName, $modalNameError, 'Name cannot be empty.');
    }
  });

});
