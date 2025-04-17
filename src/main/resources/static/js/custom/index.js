// DOM Elements
let $loadButton, $tableBody, $startId, $endId;

// Functions
function startLoading() {
  $loadButton.text('Loading...').prop('disabled', true);
  $tableBody.empty();
}

function stopLoading() {
  $loadButton.text('Load').prop('disabled', false);
}

function showError(message) {
  alert(message);
}

function validateInput(startId, endId) {
  if (startId !== null && isNaN(startId)) {
    showError('Start ID must be a number!');
    return false;
  }
  if (endId !== null && isNaN(endId)) {
    showError('End ID must be a number!');
    return false;
  }
  if (startId !== null && endId !== null && startId > endId) {
    showError('Start ID cannot be greater than End ID!');
    return false;
  }
  return true;
}

function createRowHtml(value) {
  return `
    <tr id="user-row-${value.id}">
      <td>${value.id}</td>
      <td>${value.name}</td>
      <td>${new Date(value.createdAt).toLocaleString()}</td>
      <td>${new Date(value.updatedAt).toLocaleString()}</td>
      <td>
        <button class="btn btn-primary edit-button" data-id="${value.id}">Edit</button>
        <button class="btn btn-danger delete-button" data-id="${value.id}">Delete</button>
      </td>
    </tr>
  `;
}

function loadUsers() {
  startLoading();

  const startId = $startId.val() ? parseInt($startId.val()) : null;
  const endId = $endId.val() ? parseInt($endId.val()) : null;

  if (!validateInput(startId, endId)) {
    stopLoading();
    return;
  }

  const filter = { startId, endId };

  oboe({
    url: '/users/filter',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filter),
  })
    .start(() => startLoading())
    .node('!', (record) => {
    if (record.type === 'data') {
      $tableBody.append(createRowHtml(record.value));
    } else if (record.type === 'done') {
      stopLoading();
      console.log('End of stream reached');
    }
    return oboe.drop;
  })
    .fail((error) => {
    console.error('Stream failed:', error);
    showError('Failed to load users. Please try again later.');
    stopLoading();
  });
}

function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    $.ajax({
      url: `/users/${userId}`,
      method: 'DELETE',
      success: (response) => {
        loadUsers();
        alert('User deleted successfully');
      },
      error: (error) => {
        console.error('Failed to delete user:', error.responseText);
        showError('Failed to delete user. Please try again later.');
      },
    });
  }
}

// DOM Ready
$(document).ready(() => {
  // Initialize DOM elements
  $loadButton = $('#loadButton');
  $tableBody = $('tbody');
  $startId = $('#startId');
  $endId = $('#endId');

  // Event Handlers
  $loadButton.on('click', loadUsers);

  // Listener for custom event
  document.addEventListener('userAdded', (event) => {
    loadUsers();
    console.log('New user added:', event.detail);
  });

  // Delegate click event for dynamically added edit buttons
  $(document).on('click', '.edit-button', function () {
    const userId = $(this).data('id');
    openModalForEdit(userId);
  });

  // Delegate click event for dynamically added delete buttons
  $(document).on('click', '.delete-button', function () {
    const userId = $(this).data('id');
    deleteUser(userId);
  });
});
