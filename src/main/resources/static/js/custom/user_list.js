// user_list.js
// DOM Elements
let $loadButton, $tableBody, $startId, $endId;
let $paginationInfo, $paginationList;
let $tableHeaders; // Reference to table headers

// Filter elements
let $filterName, $filterCreatedAtStart, $filterCreatedAtEnd, $filterUpdatedAtStart, $filterUpdatedAtEnd;

// New clear filters button
let $clearFiltersButton;

let currentPage = 0;
const pageSize = 10;
let totalItems = 0;
let totalPages = 0;

// Sorting state variables
// Default sort: 'createdAt' descending, as per user request
let currentSortField = 'createdAt';
let currentSortDirection = 'desc';

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
}

function stopLoading() {
  $loadButton.text('Load').prop('disabled', false);
}

function showError(message) {
  alert(message); // Keep alert for other validation types or unexpected issues
}

function validateInput(startId, endId, createdAtStart, createdAtEnd, updatedAtStart, updatedAtEnd) {
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
  // The interactive min/max attributes on date inputs already handle most date range validation visually.
  // This server-side validation here acts as a fallback for manually typed invalid dates.
  let dateCreatedAtStart = null;
  if (createdAtStart) {
    dateCreatedAtStart = new Date(createdAtStart);
    if (isNaN(dateCreatedAtStart.getTime())) {
      showError('Invalid Created At Start date format!');
      return false;
    }
  }
  let dateCreatedAtEnd = null;
  if (createdAtEnd) {
    dateCreatedAtEnd = new Date(createdAtEnd);
    if (isNaN(dateCreatedAtEnd.getTime())) {
      showError('Invalid Created At End date format!');
      return false;
    }
  }
  if (dateCreatedAtStart && dateCreatedAtEnd && dateCreatedAtStart > dateCreatedAtEnd) {
    showError('Created At Start date cannot be after Created At End date!');
    return false;
  }

  let dateUpdatedAtStart = null;
  if (updatedAtStart) {
    dateUpdatedAtStart = new Date(updatedAtStart);
    if (isNaN(dateUpdatedAtStart.getTime())) {
      showError('Invalid Updated At Start date format!');
      return false;
    }
  }
  let dateUpdatedAtEnd = null;
  if (updatedAtEnd) {
    dateUpdatedAtEnd = new Date(updatedAtEnd);
    if (isNaN(dateUpdatedAtEnd.getTime())) {
      showError('Invalid Updated At End date format!');
      return false;
    }
  }
  if (dateUpdatedAtStart && dateUpdatedAtEnd && dateUpdatedAtStart > dateUpdatedAtEnd) {
    showError('Updated At Start date cannot be after Updated At End date!');
    return false;
  }
  return true;
}

/**
 * Creates an HTML table row string for a given user object,
 * including external SVG icons for Edit and Delete buttons, and wrapping
 * content in inner divs for better vertical centering with flexbox.
 * @param {object} value - The user object containing id, name, createdAt, updatedAt.
 * @returns {string} - The HTML string for a table row.
 */
function createRowHtml(value) {
  // Ensure dates are valid before formatting
  const createdAt = value.createdAt ? new Date(value.createdAt).toLocaleString() : 'N/A';
  const updatedAt = value.updatedAt ? new Date(value.updatedAt).toLocaleString() : 'N/A';

  // Safely escape user.name to prevent XSS
  const sanitizedName = $('<div>').text(value.name).html();

  return `
    <tr id="user-row-${value.id}">
      <td><div class="td-content">${value.id}</div></td>
      <td><div class="td-content td-name-content">${sanitizedName}</div></td>
      <td><div class="td-content">${createdAt}</div></td>
      <td><div class="td-content">${updatedAt}</div></td>
      <td>
        <div class="td-content td-actions-content">
          <button class="btn btn-primary edit-button me-2" data-id="${value.id}" title="Edit User">
            <img src="/icons/icon-pencil.svg" alt="Edit" width="16" height="16">
          </button>
          <button class="btn btn-danger delete-button" data-id="${value.id}" title="Delete User">
            <img src="/icons/icon-trash.svg" alt="Delete" width="16" height="16">
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Updates the visual sort indicators in the table headers.
 * Uses different SVG icons for ascending, descending, and unsorted states.
 */
function updateSortIndicators() {
  $tableHeaders.each(function() {
    const $header = $(this);
    const sortField = $header.data('sort-field');
    let $sortIconContainer = $header.find('.sort-icon'); // The span that holds the img

    // Ensure the span.sort-icon exists
    if ($sortIconContainer.length === 0) {
      $header.append('<span class="sort-icon"></span>');
      $sortIconContainer = $header.find('.sort-icon');
    }

    // Clear previous img and its classes
    $sortIconContainer.empty();

    let iconPath;
    let iconAlt;
    let imgClass = ''; // Class for muted state for unsorted icon

    if (sortField === currentSortField) {
      // No active-sort-column class on header as per user request
      if (currentSortDirection === 'asc') {
        iconPath = '/icons/sort-asc.svg'; // Path to the new ascending icon
        iconAlt = 'Ascending sort icon';
      } else {
        iconPath = '/icons/sort-desc.svg'; // Path to the new descending icon
        iconAlt = 'Descending sort icon';
      }
    } else {
      // Remove any active styling from headers not currently sorted
      $header.removeClass('active-sort-column'); // Ensure header itself is not highlighted
      iconPath = '/icons/sort-none.svg'; // Path to the unsorted icon
      iconAlt = 'Unsorted icon';
      imgClass = 'sort-icon-muted'; // Apply a class to mute the unsorted icon if desired
    }

    // Append the img tag with the correct path and class
    $sortIconContainer.html(`<img src="${iconPath}" alt="${iconAlt}" width="16" height="16" class="${imgClass}">`);
  });
}


// loadUsers function using oboe targeting GET /users
function loadUsers(page = 0) {
  currentPage = page;
  startLoading(); // Only changes button state, does not clear table initially

  // Clear table immediately and show loading row to prevent twitching
  $tableBody.empty();
  $tableBody.append(`
      <tr id="loading-row">
          <td colspan="5" class="text-center py-4 text-muted">Loading users...</td>
      </tr>
  `);


  const startId = $startId.val() ? parseInt($startId.val()) : null;
  const endId = $endId.val() ? parseInt($endId.val()) : null;
  const filterName = $filterName.val();
  const filterCreatedAtStart = $filterCreatedAtStart.val();
  const filterCreatedAtEnd = $filterCreatedAtEnd.val();
  const filterUpdatedAtStart = $filterUpdatedAtStart.val();
  const filterUpdatedAtEnd = $filterUpdatedAtEnd.val();


  if (!validateInput(startId, endId, filterCreatedAtStart, filterCreatedAtEnd, filterUpdatedAtStart, filterUpdatedAtEnd)) {
    stopLoading();
    renderPaginationControls();
    updateSortIndicators(); // Ensure indicators are updated even if validation fails
    $('#loading-row').remove(); // Remove loading indicator on validation fail
    return;
  }

  let url = '/users'; // Target the GET /users endpoint
  const params = new URLSearchParams(); // Use URLSearchParams to build query string

  // Add ID filter parameters
  if (startId !== null) {
    params.append('startId', startId);
  }
  if (endId !== null) {
    params.append('endId', endId);
  }

  // Add Name filter parameter (for partial matching)
  if (filterName) {
    params.append('nameFilter', filterName);
  }

  // Add Created At date range filters
  if (filterCreatedAtStart) {
    params.append('createdAtStart', filterCreatedAtStart);
  }
  if (filterCreatedAtEnd) {
    params.append('createdAtEnd', filterCreatedAtEnd);
  }

  // Add Updated At date range filters
  if (filterUpdatedAtStart) {
    params.append('updatedAtStart', filterUpdatedAtStart);
  }
  if (filterUpdatedAtEnd) {
    params.append('updatedAtEnd', filterUpdatedAtEnd);
  }

  // Add sort parameter based on current sort state
  if (currentSortField) {
    params.append('sort', `${currentSortField},${currentSortDirection}`);
  }


  params.append('page', currentPage); // Send the requested 0-indexed page number
  params.append('size', pageSize);

  // Append parameters to the URL if they exists
  if (params.toString()) {
    url += '?' + params.toString();
  }

  oboe({
    url: url, // The constructed URL with parameters
    method: 'GET' // Use GET method
  })
    .start(() => {
    console.log('Oboe stream started for /users');
    // Table is already cleared and loading row added
  })
    .node('!', (record) => {
    if (record.type === 'data') {
      $('#loading-row').remove(); // Remove loading row as soon as first data record arrives
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
    updateSortIndicators(); // Update sort icons and active column after data is loaded
    console.log('Oboe stream completed.');
    // If no data records were ever received, ensure loading row is removed
    if ($('#loading-row').length) { // Check if loading row still exists
      $('#loading-row').remove();
    }
    // If table is still empty (e.g., no results), ensure pagination info is correct
    if (totalItems === 0) {
      $tableBody.empty(); // Ensure it's truly empty if no items were found
    }
  })
    .fail((error) => {
    console.error('Stream failed:', error);
    showError('Failed to load users. Please try again later.');
    stopLoading();
    totalItems = 0;
    totalPages = 0;
    currentPage = 0;
    renderPaginationControls();
    updateSortIndicators(); // Also update indicators on failure
    $('#loading-row').remove(); // Remove loading indicator on failure
    $tableBody.empty(); // Ensure table is empty on failure
  });
}

/**
 * Clears all filter input fields and reloads the user list.
 * Only proceeds if at least one filter field has a value.
 */
function clearFilters() {
  const hasActiveFilters =
  $startId.val() !== '' ||
  $endId.val() !== '' ||
  $filterName.val() !== '' ||
  $filterCreatedAtStart.val() !== '' ||
  $filterCreatedAtEnd.val() !== '' ||
  $filterUpdatedAtStart.val() !== '' ||
  $filterUpdatedAtEnd.val() !== '';

  if (!hasActiveFilters) {
    console.log('No active filters to clear.');
    return; // Do nothing if no filters are set
  }

  $startId.val('');
  $endId.val('');
  $filterName.val('');
  $filterCreatedAtStart.val('');
  $filterCreatedAtEnd.val('');
  $filterUpdatedAtStart.val('');
  $filterUpdatedAtEnd.val('');

  // Clear min/max attributes for date inputs
  $filterCreatedAtStart.removeAttr('max');
  $filterCreatedAtEnd.removeAttr('min');
  $filterUpdatedAtStart.removeAttr('max');
  $filterUpdatedAtEnd.removeAttr('min');

  loadUsers(0); // Reload table from the first page without filters
}


function goToPage(page) {
  if (page >= 0 && page < totalPages && page !== currentPage) {
    loadUsers(page);
  } else {
    console.log(`Attempted to go to current or invalid page: ${page}. Current: ${currentPage}, Total Pages: ${totalPages}`);
  }
}

// Function to delete a user
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
  $tableHeaders = $('th[data-sort-field]'); // Select sortable headers

  // Initialize new filter elements
  $filterName = $('#filterName');
  $filterCreatedAtStart = $('#filterCreatedAtStart');
  $filterCreatedAtEnd = $('#filterCreatedAtEnd');
  $filterUpdatedAtStart = $('#filterUpdatedAtStart');
  $filterUpdatedAtEnd = $('#filterUpdatedAtEnd');
  $clearFiltersButton = $('#clearFiltersButton'); // Initialize clear filters button


  // Initial load users with default sorting
  loadUsers(0);

  // Pagination click handler
  $paginationList.on('click', '.page-link', function(event) {
    event.preventDefault();

    const $clickedLink = $(this);
    const $parentItem = $clickedLink.closest('.page-item');

    if (!$parentItem.hasClass('disabled') && !$parentItem.hasClass('active')) {
      const targetPage = parseInt($clickedLink.data('page'));
      goToPage(targetPage);
    }
  });

  // Event Handlers for buttons (Load, Add, Edit, Delete)
  $loadButton.on('click', () => {
    loadUsers(0); // Reload from first page on Load button click
  });

  // Event handler for Clear Filters button
  $clearFiltersButton.on('click', () => {
    clearFilters();
  });

  // Add change event listeners for interactive date validation
  $filterCreatedAtStart.on('change', function() {
    const startDate = $(this).val();
    if (startDate) {
      $filterCreatedAtEnd.attr('min', startDate);
    } else {
      $filterCreatedAtEnd.removeAttr('min');
    }
  });

  $filterCreatedAtEnd.on('change', function() {
    const endDate = $(this).val();
    if (endDate) {
      $filterCreatedAtStart.attr('max', endDate);
    } else {
      $filterCreatedAtStart.removeAttr('max');
    }
  });

  $filterUpdatedAtStart.on('change', function() {
    const startDate = $(this).val();
    if (startDate) {
      $filterUpdatedAtEnd.attr('min', startDate);
    } else {
      $filterUpdatedAtEnd.removeAttr('min');
    }
  });

  $filterUpdatedAtEnd.on('change', function() {
    const endDate = $(this).val();
    if (endDate) {
      $filterUpdatedAtStart.attr('max', endDate);
    } else {
      $filterUpdatedAtStart.removeAttr('max');
    }
  });


  // Listener for custom event (userAdded, userUpdated)
  $(document).on('userAdded userUpdated', function(event, data) {
    console.log(`Event ${event.type} triggered with data:`, data);
    loadUsers(currentPage); // Reload the current page to ensure sorted order is maintained
  });

  // Delegate click event for dynamically added edit buttons
  $(document).on('click', '.edit-button', function () {
    const userId = $(this).data('id');
    // Assuming openModalForEdit is defined globally by modal.js
    if (typeof openModalForEdit === 'function') { // Added check for function existence
      openModalForEdit(userId);
    } else {
      console.error('openModalForEdit function not found. Ensure modal.js is loaded.');
    }
  });

  // Delegate click event for dynamically added delete buttons
  $(document).on('click', '.delete-button', function () {
    const userId = $(this).data('id');
    deleteUser(userId);
  });

  // Click handler for table headers to enable sorting
  $('thead').on('click', 'th[data-sort-field]', function() {
    const $header = $(this);
    const field = $header.data('sort-field');

    if (field === currentSortField) {
      // If clicking the same column, toggle direction
      currentSortDirection = (currentSortDirection === 'asc') ? 'desc' : 'asc';
    } else {
      // If clicking a new column, set it as current and default to 'asc'
      currentSortField = field;
      currentSortDirection = 'asc'; // You can change this to 'desc' if preferred for new columns
    }

    loadUsers(0); // Reload data with new sorting, starting from the first page
  });

  // Initial update of sort indicators
  updateSortIndicators();
});
