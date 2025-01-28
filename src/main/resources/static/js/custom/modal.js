$(document).ready(function() {
  var $addButton = $('#addButton');
  var $modalName = $('#modalName');
  var $modalNameError = $('#modalNameError');

  function showError(inputElement, errorElement, message) {
    inputElement.addClass('is-invalid');
    errorElement.text(message).show();
  }

  function hideError(inputElement, errorElement) {
    inputElement.removeClass('is-invalid');
    errorElement.hide();
  }

  function addUser() {
    var userName = $modalName.val().trim();

    if (!userName) {
      showError($modalName, $modalNameError, 'Name cannot be empty.');
      return;
    }

    hideError($modalName, $modalNameError);

    var newUser = { name: userName };

    $.ajax({
      url: '/users',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(newUser),
      success: function(response) {
        $('#addUserModal').modal('hide');
        $modalName.val('');

        var event = new CustomEvent('userAdded', { detail: newUser });
        document.dispatchEvent(event);
      },
      error: function(error) {
        console.error('Failed to add user: ', error.responseText);
      }
    });
  }

  $addButton.on('click', addUser);

  $modalName.on('input', function() {
    if ($modalName.val().trim()) {
      hideError($modalName, $modalNameError);
    } else {
      showError($modalName, $modalNameError, 'Name cannot be empty.');
    }
  });

  // Event listener for dynamically added elements
  $(document).on('show.bs.modal', '.modal', function() {
    var modalId = $(this).attr('id');
    if (modalId) {
      $(this).find('input').first().focus(); // Set focus on the first input inside the modal
    }
  });
});
