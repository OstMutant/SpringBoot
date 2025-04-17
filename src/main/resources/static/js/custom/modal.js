var $saveButton, $modalName, $modalNameError, $userModalLabel, userIdToEdit;

function openModalForAdd() {
  $userModalLabel.text('Add User');
  $modalName.val('');
  userIdToEdit = null;
  $('#userModal').modal('show');
}

function openModalForEdit(userId) {
  $.get('/users/' + userId, function(user) {
    userIdToEdit = userId;
    $userModalLabel.text('Edit User');
    $modalName.val(user.name);
    $('#userModal').modal('show');
  });
}

$(document).ready(function() {
  $saveButton = $('#saveButton');
  $modalName = $('#modalName');
  $modalNameError = $('#modalNameError');
  $userModalLabel = $('#userModalLabel');
  userIdToEdit = null;

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
          $('#userModal').modal('hide');
          updateTableRow(userIdToEdit, response);
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
          $('#userModal').modal('hide');
          loadUsers();
        },
        error: function(error) {
          console.error('Failed to add user: ', error.responseText);
        }
      });
    }
  }

  function updateTableRow(userId, updatedUserData) {
    const $rowToUpdate = $(`#user-row-${userId}`);
    if ($rowToUpdate.length) {
      $rowToUpdate.find('td:nth-child(2)').text(updatedUserData.name);
      $rowToUpdate.find('td:nth-child(4)').text(new Date(updatedUserData.updatedAt).toLocaleString());
    } else {
      console.warn(`Row with ID ${userId} not found for update.`);
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
