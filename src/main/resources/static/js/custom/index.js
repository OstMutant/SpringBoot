// DOM Elements
var $loadButton, $tableBody, $startId, $endId;

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

// DOM Ready
$(document).ready(function() {
  // Initialize DOM elements
  $loadButton = $('#loadButton');
  $tableBody = $('tbody');
  $startId = $('#startId');
  $endId = $('#endId');

  // Event Handlers
  $loadButton.on('click', loadUsers);

  // Listener for custom event
  document.addEventListener('userAdded', function(event) {
    loadUsers();
    console.log('New user added:', event.detail);
  });
});
