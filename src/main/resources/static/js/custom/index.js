// index.js
// DOM Elements
let $loadButton, $tableBody, $startId, $endId;

// Functions
function startLoading() {
  $loadButton.text('Loading...').prop('disabled', true);
  $tableBody.empty(); // Clear existing table data before loading
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

// loadUsers function using oboe targeting GET /users
function loadUsers() {
  startLoading(); // Includes clearing the table

  const startId = $startId.val() ? parseInt($startId.val()) : null;
  const endId = $endId.val() ? parseInt($endId.val()) : null;

  if (!validateInput(startId, endId)) {
    stopLoading();
    return;
  }

  let url = '/users'; // Target the GET /users endpoint
  const params = new URLSearchParams(); // Use URLSearchParams to build query string

  // Add filter parameters if they exist
  if (startId !== null) {
    params.append('startId', startId);
  }
  if (endId !== null) {
    params.append('endId', endId);
  }

  // Append parameters to the URL if they exist
  if (params.toString()) {
    url += '?' + params.toString();
  }

  oboe({
    url: url, // The constructed URL with parameters
    method: 'GET' // Use GET method
  })
    .start(() => {
    console.log('Oboe stream started for /users');
  })
    .node('!', (record) => {
    if (record.type === 'data') {
      $tableBody.append(createRowHtml(record.value));
    } else if (record.type === 'pagination_metadata') {
      console.log('Received Pagination Metadata:', record.value);
    } else if (record.type === 'done') {
      console.log('End of stream reached');
    }
    return oboe.drop; // Continue dropping processed records
  })
    .done(() => {
    stopLoading();
    console.log('Oboe stream completed.');
  })
    .fail((error) => {
    console.error('Stream failed:', error);
    showError('Failed to load users. Please try again later.');
    stopLoading();
  });
}

// Function to delete a user (kept as is)
function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    $.ajax({
      url: `/users/${userId}`,
      method: 'DELETE',
      success: (response) => {
        // Reload users after deletion
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

  // Listener for custom event (kept as is)
  // Note: User addition currently calls loadUsers, which is fine for now.
  document.addEventListener('userAdded', (event) => {
    loadUsers();
    console.log('New user added:', event.detail);
  });

  // Delegate click event for dynamically added edit buttons (kept as is)
  $(document).on('click', '.edit-button', function () {
    const userId = $(this).data('id');
    openModalForEdit(userId); // Assuming openModalForEdit is defined in modal.js
  });

  // Delegate click event for dynamically added delete buttons (kept as is)
  $(document).on('click', '.delete-button', function () {
    const userId = $(this).data('id');
    deleteUser(userId);
  });
});

// Assuming createRowHtml, startLoading, stopLoading, showError, validateInput
// are defined or included elsewhere, and that openModalForEdit is in modal.js
