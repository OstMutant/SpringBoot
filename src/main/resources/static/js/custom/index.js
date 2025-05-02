// index.js
// DOM Elements
let $loadButton, $tableBody, $startId, $endId;
let $paginationInfo, $paginationList;

let currentPage = 0;
const pageSize = 10;
let totalItems = 0;
let totalPages = 0;

function updatePaginationInfo() {
  if (totalItems === 0) {
    $paginationInfo.text('No items found.');
  } else {
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min(startItem + pageSize - 1, totalItems);
    $paginationInfo.text(`Items ${startItem}-${endItem} of ${totalItems} (Page ${currentPage + 1} of ${totalPages})`);
  }
}

function renderPaginationControls() {
  $paginationList.empty();

  if (totalPages <= 1) {
    updatePaginationInfo();
    return;
  }

  const prevDisabled = currentPage === 0 ? 'disabled' : '';
  $paginationList.append(`
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span> <span class="sr-only">Previous</span>
            </a>
        </li>
    `);

  for (let i = 0; i < totalPages; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    $paginationList.append(`
            <li class="page-item ${activeClass}">
                <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
            </li>
        `);
  }

  const nextDisabled = currentPage >= totalPages - 1 ? 'disabled' : '';
  $paginationList.append(`
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span> <span class="sr-only">Next</span>
            </a>
        </li>
    `);

  updatePaginationInfo();
}

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
function loadUsers(page = 0) {
  currentPage = page;
  startLoading(); // Includes clearing the table

  const startId = $startId.val() ? parseInt($startId.val()) : null;
  const endId = $endId.val() ? parseInt($endId.val()) : null;

  if (!validateInput(startId, endId)) {
    stopLoading();
    renderPaginationControls();
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

  params.append('page', currentPage); // Send the requested 0-indexed page number
  params.append('size', pageSize);

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
      totalItems = record.value.totalItems;
      totalPages = Math.ceil(totalItems / pageSize);
      currentPage = record.value.currentPage;
      renderPaginationControls();

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
    totalItems = 0;
    totalPages = 0;
    currentPage = 0;
    renderPaginationControls();
  });
}

function goToPage(page) {
  if (page >= 0 && page < totalPages && page !== currentPage) {
    loadUsers(page);
  } else {
    console.log(`Attempted to go to current or invalid page: ${page}. Current: ${currentPage}, Total Pages: ${totalPages}`);
  }
}

// Function to delete a user (kept as is)
function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    $.ajax({
      url: `/users/${userId}`,
      method: 'DELETE',
      success: (response) => {
        // Reload users after deletion
        loadUsers(currentPage);
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
  $paginationInfo = $('#paginationInfo');
  $paginationList = $('#paginationList');

  $paginationList.on('click', '.page-link', function(event) {
    event.preventDefault();

    const $clickedLink = $(this);
    const $parentItem = $clickedLink.closest('.page-item');

    if (!$parentItem.hasClass('disabled') && !$parentItem.hasClass('active')) {
      const targetPage = parseInt($clickedLink.data('page'));
      goToPage(targetPage);
    }
  });

  // Event Handlers
  $loadButton.on('click', () => {
    loadUsers(0);
  });

  // Listener for custom event (kept as is)
  // Note: User addition currently calls loadUsers, which is fine for now.
  $(document).on('userAdded', function(event, newUser) {
    loadUsers(currentPage);
    console.log('New user added (jQuery event), reloading users:', newUser);
  });

  $(document).on('userUpdated', function(event, updatedUser) {
    console.log('User updated (jQuery event), checking if row needs update:', updatedUser);
    const $rowToUpdate = $(`#user-row-${updatedUser.id}`);
    if ($rowToUpdate.length) {
      $rowToUpdate.replaceWith(createRowHtml(updatedUser));
      console.log('User row updated on current page:', updatedUser.id);
    } else {
      console.log('User updated, but row not found on current page.');
    }
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
