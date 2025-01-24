$(document).ready(function() {
  // DOM Elements
  var $loadButton = $('#loadButton');
  var $addButton = $('#addButton');
  var $tableBody = $('tbody');
  var $startId = $('#startId');
  var $endId = $('#endId');
  var $name = $('#name');
  var $nameError = $('#nameError');

  // Functions
  function startLoading() {
    $loadButton.text('Loading...').prop('disabled', true);
    $tableBody.empty();
  }

  function stopLoading() {
    $loadButton.text('Load').prop('disabled', false);
  }

  function loadUsers() {
    startLoading();
    var filter = {
      startId: $startId.val() ? parseInt($startId.val()) : null,
      endId: $endId.val() ? parseInt($endId.val()) : null
    };

    oboe({
      url: '/users/filter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filter)
    })
      .start(function() {
      startLoading();
    })
      .node('!', function(record) {
      if (record.type == 'data') {
        var value = record.value;
        $('tbody').append('<tr><td>' + value.id + '</td><td>' + value.name + '</td><td>' + value.createdAt.toLocaleString() + '</td><td>' + value.updatedAt.toLocaleString() + '</td></tr>');
      } else if (record.type == 'done') {
        stopLoading();
        console.log('End of stream reached');
      }
      return oboe.drop;
    })
      .fail(function(error) {
      console.error('Stream failed: ', error);
      stopLoading();
    });
  }

  function addUser() {
    var userName = $name.val().trim();

    if (!userName) {
      $name.addClass('is-invalid');
      $nameError.show();
      return;
    }

    $name.removeClass('is-invalid');
    $nameError.hide();

    var newUser = {
      name: userName
    };

    $.ajax({
      url: '/users',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(newUser),
      success: function(response) {
        $name.val('');
        loadUsers(); // Reload the table after adding a new user
      },
      error: function(error) {
        console.error('Failed to add user: ', error.responseText);
      }
    });
  }

  // Event Handlers
  $loadButton.on('click', loadUsers);
  $addButton.on('click', addUser);

  $name.on('input', function() {
    if ($name.val().trim()) {
      $name.removeClass('is-invalid');
      $nameError.hide();
    } else {
      $name.addClass('is-invalid');
      $nameError.show();
    }
  });
});
