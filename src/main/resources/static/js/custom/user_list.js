(function() {
  // DOM Elements
  let $loadButton, $tableBody, $startId, $endId;
  let $paginationInfo, $paginationList;
  let $tableHeaders;

  // Filter elements
  let $filterName, $filterCreatedAtStart, $filterCreatedAtEnd, $filterUpdatedAtStart, $filterUpdatedAtEnd;

  // Clear filters button
  let $clearFiltersButton;

  let currentPage = 0;
  const pageSize = 10;
  let totalItems = 0;
  let totalPages = 0;

  // Sorting state variables
  let currentSortField = 'createdAt';
  let currentSortDirection = 'desc';

  // Updates pagination information text
  const updatePaginationInfo = () => {
    if (totalItems === 0) {
      $paginationInfo.text('No items found.');
    } else {
      const startItem = currentPage * pageSize + 1;
      const endItem = Math.min(startItem + pageSize - 1, totalItems);
      $paginationInfo.text(`Items ${startItem}-${endItem} of ${totalItems} (Page ${currentPage + 1} of ${totalPages})`);
    }
  };

  // Renders pagination controls dynamically
  const renderPaginationControls = () => {
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
  };

  // Sets loading state for the load button
  const startLoading = () => {
    $loadButton.text('Loading...').prop('disabled', true);
  };

  // Resets load button state
  const stopLoading = () => {
    $loadButton.text('Load').prop('disabled', false);
  };

  // Displays a user feedback message using Bootstrap alert
  const showUserFeedback = (message, type = 'danger') => {
    const alertId = `alert-${Date.now()}`;
    const alertHtml = `
      <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show fixed-top mx-auto mt-3" role="alert" style="max-width: 500px; z-index: 2000;">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    $('body').append(alertHtml);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      // Use Bootstrap's alert close method if available, otherwise just remove
      const alertElement = $(`#${alertId}`);
      if (alertElement.length && alertElement.alert) {
        alertElement.alert('close');
      } else {
        alertElement.remove();
      }
    }, 5000);
  };

  // Displays an error message using the custom UI feedback
  const showError = (message) => {
    showUserFeedback(message, 'danger');
  };

  // Displays a confirmation modal with custom message and callback
  const showConfirmationModal = (message, callback) => {
    const modalId = `confirmModal-${Date.now()}`;
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-xl shadow-lg">
            <div class="modal-header bg-gray-100 border-b border-gray-200">
              <h5 class="modal-title" id="${modalId}Label">Confirm Action</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-6 text-center">
              <p class="text-lg text-gray-700">${message}</p>
            </div>
            <div class="modal-footer justify-content-center border-t border-gray-200 bg-gray-100 p-4">
              <button type="button" class="btn btn-secondary rounded-lg px-4 py-2" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary rounded-lg px-4 py-2" id="confirmOkBtn-${modalId}">OK</button>
            </div>
          </div>
        </div>
      </div>
    `;

    $('body').append(modalHtml);
    const $confirmModal = $(`#${modalId}`);
    const confirmModalInstance = new bootstrap.Modal($confirmModal[0]);

    $(`#confirmOkBtn-${modalId}`).on('click', () => {
      callback();
      confirmModalInstance.hide();
    });

    $confirmModal.on('hidden.bs.modal', () => {
      $confirmModal.remove(); // Clean up modal from DOM after it's hidden
    });

    confirmModalInstance.show();
  };


  // Validates filter input fields
  const validateInput = (startId, endId, createdAtStart, createdAtEnd, updatedAtStart, updatedAtEnd) => {
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
  };

  /**
   * Creates an HTML table row string for a given user object,
   * including external SVG icons for Edit and Delete buttons, and wrapping
   * content in inner divs for better vertical centering with flexbox.
   * @param {object} value - The user object containing id, name, createdAt, updatedAt.
   * @returns {string} - The HTML string for a table row.
   */
  const createRowHtml = (value) => {
    const createdAt = value.createdAt ? new Date(value.createdAt).toLocaleString() : 'N/A';
    const updatedAt = value.updatedAt ? new Date(value.updatedAt).toLocaleString() : 'N/A';

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
  };

  /**
   * Updates the visual sort indicators in the table headers.
   * Uses different SVG icons for ascending, descending, and unsorted states.
   */
  const updateSortIndicators = () => {
    $tableHeaders.each(function() {
      const $header = $(this);
      const sortField = $header.data('sort-field');
      let $sortIconContainer = $header.find('.sort-icon');

      if ($sortIconContainer.length === 0) {
        $header.append('<span class="sort-icon"></span>');
        $sortIconContainer = $header.find('.sort-icon');
      }

      $sortIconContainer.empty();

      let iconPath;
      let iconAlt;
      let imgClass = '';

      if (sortField === currentSortField) {
        if (currentSortDirection === 'asc') {
          iconPath = '/icons/sort-asc.svg';
          iconAlt = 'Ascending sort icon';
        } else {
          iconPath = '/icons/sort-desc.svg';
          iconAlt = 'Descending sort icon';
        }
      } else {
        $header.removeClass('active-sort-column');
        iconPath = '/icons/sort-none.svg';
        iconAlt = 'Unsorted icon';
        imgClass = 'sort-icon-muted';
      }

      $sortIconContainer.html(`<img src="${iconPath}" alt="${iconAlt}" width="16" height="16" class="${imgClass}">`);
    });
  };


  // Loads users from the server using Oboe.js
  const loadUsers = (page = 0) => {
    currentPage = page;
    startLoading();

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
      updateSortIndicators();
      $('#loading-row').remove();
      return;
    }

    let url = '/users';
    const params = new URLSearchParams();

    if (startId !== null) {
      params.append('startId', startId);
    }
    if (endId !== null) {
      params.append('endId', endId);
    }

    if (filterName) {
      params.append('nameFilter', filterName);
    }

    if (filterCreatedAtStart) {
      params.append('createdAtStart', filterCreatedAtStart);
    }
    if (filterCreatedAtEnd) {
      params.append('createdAtEnd', filterCreatedAtEnd);
    }

    if (filterUpdatedAtStart) {
      params.append('updatedAtStart', filterUpdatedAtStart);
    }
    if (filterUpdatedAtEnd) {
      params.append('updatedAtEnd', filterUpdatedAtEnd);
    }

    if (currentSortField) {
      params.append('sort', `${currentSortField},${currentSortDirection}`);
    }


    params.append('page', currentPage);
    params.append('size', pageSize);

    if (params.toString()) {
      url += '?' + params.toString();
    }

    oboe({
      url: url,
      method: 'GET'
    })
      .start(() => {
      console.log('Oboe stream started for /users');
    })
      .node('!', (record) => {
      if (record.type === 'data') {
        $('#loading-row').remove();
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
      return oboe.drop;
    })
      .done(() => {
      stopLoading();
      updateSortIndicators();
      console.log('Oboe stream completed.');
      if ($('#loading-row').length) {
        $('#loading-row').remove();
      }
      if (totalItems === 0) {
        $tableBody.empty();
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
      updateSortIndicators();
      $('#loading-row').remove();
      $tableBody.empty();
    });
  };

  /**
   * Clears all filter input fields and reloads the user list.
   * Only proceeds if at least one filter field has a value.
   */
  const clearFilters = () => {
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
      return;
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

    loadUsers(0);
  };

  // Navigates to a specific page
  const goToPage = (page) => {
    if (page >= 0 && page < totalPages && page !== currentPage) {
      loadUsers(page);
    } else {
      console.log(`Attempted to go to current or invalid page: ${page}. Current: ${currentPage}, Total Pages: ${totalPages}`);
    }
  };

  // Function to delete a user
  const deleteUser = async (userId) => {
    showConfirmationModal('Are you sure you want to delete this user?', async () => {
      try {
        const response = await fetch(`/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }

        loadUsers(currentPage);
        showUserFeedback('User deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete user:', error);
        showError('Failed to delete user. Please try again later.');
      }
    });
  };

  // Initialize DOM elements and event handlers when the document is ready
  $(document).ready(() => {
    // Initialize DOM elements
    $loadButton = $('#loadButton');
    $tableBody = $('tbody');
    $startId = $('#startId');
    $endId = $('#endId');
    $paginationInfo = $('#paginationInfo');
    $paginationList = $('#paginationList');
    $tableHeaders = $('th[data-sort-field]');

    // Initialize new filter elements
    $filterName = $('#filterName');
    $filterCreatedAtStart = $('#filterCreatedAtStart');
    $filterCreatedAtEnd = $('#filterCreatedAtEnd');
    $filterUpdatedAtStart = $('#filterUpdatedAtStart');
    $filterUpdatedAtEnd = $('#filterUpdatedAtEnd');
    $clearFiltersButton = $('#clearFiltersButton');

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
      loadUsers(0);
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
    $(document).on('userAdded userUpdated', (event, data) => {
      console.log(`Event ${event.type} triggered with data:`, data);
      loadUsers(currentPage);
    });

    // Delegate click event for dynamically added edit buttons
    $(document).on('click', '.edit-button', function() {
      const userId = $(this).data('id');
      // Call the globally exposed function from modal.js
      if (typeof openModalForEdit === 'function') {
        openModalForEdit(userId);
      } else {
        console.error('openModalForEdit function not found. Ensure modal.js is loaded and exposes openModalForEdit globally.');
      }
    });

    // Delegate click event for dynamically added delete buttons
    $(document).on('click', '.delete-button', (e) => {
      const userId = $(e.currentTarget).data('id');
      deleteUser(userId);
    });

    // Click handler for table headers to enable sorting
    $('thead').on('click', 'th[data-sort-field]', function() {
      const $header = $(this);
      const field = $header.data('sort-field');

      if (field === currentSortField) {
        currentSortDirection = (currentSortDirection === 'asc') ? 'desc' : 'asc';
      } else {
        currentSortField = field;
        currentSortDirection = 'asc';
      }

      loadUsers(0);
    });

    // Initial update of sort indicators
    updateSortIndicators();
  });
})();
