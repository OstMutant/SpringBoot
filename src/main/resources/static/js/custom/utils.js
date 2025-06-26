(function() {
  // Global configuration object. Exposed to window.GlobalConfig.
  window.GlobalConfig = {
    userApiBaseUrl: '/users', // Base URL for user API
    advertisementApiBaseUrl: '/advertisements', // Base URL for advertisement API
    pagination: {
      pageSize: 10 // Default page size for tables
    },
    defaultSort: {
      field: 'id', // Default sort field
      direction: 'asc' // Default sort direction
    }
  };

  // Event bus for custom events. Exposed to window.EventBus.
  window.EventBus = {
    _events: {},
    on: function(event, callback) {
      if (!this._events[event]) {
        this._events[event] = [];
      }
      this._events[event].push(callback);
    },
    emit: function(event, data) {
      if (this._events[event]) {
        this._events[event].forEach(callback => callback(data));
      }
    }
  };

  // API service for interacting with backend endpoints. Exposed to window.Api.
  window.Api = {
    // Fetches a single user by ID.
    fetchUser: async function(userId) {
      const response = await fetch(`${window.GlobalConfig.userApiBaseUrl}/${userId}`);
      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`);
      }
      return response.json();
    },
    // Saves a user (creates or updates).
    saveUser: async function(user, userIdToEdit = null) {
      const method = userIdToEdit ? 'PUT' : 'POST';
      const url = userIdToEdit ? `${window.GlobalConfig.userApiBaseUrl}/${userIdToEdit}` : window.GlobalConfig.userApiBaseUrl;
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(user)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error saving user: ${response.statusText}`);
      }
      return response.json();
    },
    // Deletes a user by ID.
    deleteUser: async function(userId) {
      const response = await fetch(`${window.GlobalConfig.userApiBaseUrl}/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Error deleting user: ${response.statusText}`);
      }
      return response.status === 204 ? null : response.text();
    },

    // Fetches a single advertisement by ID.
    fetchAdvertisement: async function(adId) {
      const response = await fetch(`${window.GlobalConfig.advertisementApiBaseUrl}/${adId}`);
      if (!response.ok) {
        throw new Error(`Error fetching advertisement: ${response.statusText}`);
      }
      return response.json();
    },
    // Saves an advertisement (creates or updates).
    saveAdvertisement: async function(ad, adIdToEdit = null) {
      const method = adIdToEdit ? 'PUT' : 'POST';
      const url = adIdToEdit ? `${window.GlobalConfig.advertisementApiBaseUrl}/${adIdToEdit}` : window.GlobalConfig.advertisementApiBaseUrl;
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(ad)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error saving advertisement: ${response.statusText}`);
      }
      return response.json();
    },
    // Deletes an advertisement by ID.
    deleteAdvertisement: async function(adId) {
      const response = await fetch(`${window.GlobalConfig.advertisementApiBaseUrl}/${adId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Error deleting advertisement: ${response.statusText}`);
      }
      return response.status === 204 ? null : response.text();
    },

    // Generic fetch for lists with filters, pagination, and sorting using Oboe.js streaming.
    fetchList: function(baseUrl, filters, currentPage, pageSize, sortField, sortDirection) {
      const params = new URLSearchParams();
      if (filters) {
        for (const key in filters) {
          if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
          }
        }
      }
      params.append('page', currentPage);
      params.append('size', pageSize);
      if (sortField) {
        params.append('sort', `${sortField},${sortDirection}`);
      }

      const url = `${baseUrl}?${params.toString()}`;

      if (typeof oboe === 'undefined') {
        console.error('Oboe.js is not loaded or available globally. Cannot perform streaming fetch.');
        throw new Error('Oboe.js is not loaded. Cannot perform streaming API call.');
      }

      return oboe({
        url: url,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
    }
  };

  // Shows user feedback using SweetAlert2 (if available). Exposed to window.showUserFeedback.
  window.showUserFeedback = function(message, type = 'info') {
    if (typeof Swal !== 'undefined') { // Check if Swal is loaded
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: type,
        title: message
      });
    } else {
      console.log(`Feedback (${type}): ${message}`); // Fallback for no Swal
    }
  };

  // Shows a confirmation modal using SweetAlert2 (if available). Exposed to window.showConfirmationModal.
  window.showConfirmationModal = function(message, onConfirm) {
    if (typeof Swal !== 'undefined') { // Check if Swal is loaded
      Swal.fire({
        title: 'Are you sure?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, proceed!'
      }).then((result) => {
        if (result.isConfirmed) {
          onConfirm();
        }
      });
    } else {
      console.log(`Confirmation: ${message}`); // Fallback for no Swal
      if (confirm(message)) {
        onConfirm();
      }
    }
  };

  // Sets up date range validation for two input fields. Exposed to window.setupDateRangeValidation.
  window.setupDateRangeValidation = function($startInput, $endInput) {
    $startInput.on('change', function() {
      const startDate = $(this).val();
      if (startDate) {
        $endInput.attr('min', startDate);
      } else {
        $endInput.removeAttr('min');
      }
    });

    $endInput.on('change', function() {
      const endDate = $(this).val();
      if (endDate) {
        $startInput.attr('max', endDate);
      } else {
        $startInput.removeAttr('max');
      }
    });
  };

  /**
   * Base class for table rendering logic, handling pagination information and controls.
   * Exposed to window.BaseTableRenderer.
   */
  window.BaseTableRenderer = class BaseTableRenderer {
    constructor($paginationInfo, $paginationList, pageSize) {
      this.$paginationInfo = $paginationInfo;
      this.$paginationList = $paginationList;
      this.pageSize = pageSize;
    }

  /**
   * Updates pagination information text.
   * @param {number} totalItems - Total number of items.
   * @param {number} currentPage - Current page index.
   * @param {number} totalPages - Total number of pages.
   */
    updatePaginationInfo(totalItems, currentPage, totalPages) {
      if (totalItems === 0) {
        this.$paginationInfo.text('No items found.');
      } else {
        const startItem = currentPage * this.pageSize + 1;
        const endItem = Math.min(startItem + this.pageSize - 1, totalItems);
        this.$paginationInfo.text(`Items ${startItem}-${endItem} of ${totalItems} (Page ${currentPage + 1} of ${totalPages})`);
      }
    }

  /**
   * Renders pagination controls dynamically.
   * @param {number} totalItems - Total number of items.
   * @param {number} currentPage - Current page index.
   * @param {number} totalPages - Total number of pages.
   * @param {function} onPageChange - Callback function for page change.
   */
    renderPaginationControls(totalItems, currentPage, totalPages, onPageChange) {
      this.$paginationList.empty(); // Clear existing pagination
      if (totalPages <= 1) {
        return; // No pagination needed for 1 or fewer pages
      }

      const maxPagesToShow = 5; // Max number of page buttons to display
      let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

      // Adjust startPage if we're at the end
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }

      // Previous button
      this.$paginationList.append(`
          <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
              <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
              </a>
          </li>
      `);

      // Page numbers
      for (let i = startPage; i <= endPage; i++) {
        this.$paginationList.append(`
              <li class="page-item ${i === currentPage ? 'active' : ''}">
                  <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
              </li>
          `);
      }

      // Next button
      this.$paginationList.append(`
          <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
              <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
              </a>
          </li>
      `);

      // Attach click handlers to new pagination links
      this.$paginationList.find('.page-link').on('click', function(event) {
        event.preventDefault();
        const page = $(this).data('page');
        if (page >= 0 && page < totalPages) {
          onPageChange(page);
        }
      });
    }
  };

  // Input validation utility. Exposed to window.InputValidator.
  window.InputValidator = {
    validateName: function(name, showErrorCallback, $inputElement, $errorElement) {
      if (!name) {
        $inputElement.addClass('is-invalid');
        $errorElement.text('Name cannot be empty.').show();
        showErrorCallback('Name cannot be empty.', 'danger');
        return false;
      }
      if (name.length > 255) {
        $inputElement.addClass('is-invalid');
        $errorElement.text('Name cannot exceed 255 characters.').show();
        showErrorCallback('Name cannot exceed 255 characters.', 'danger');
        return false;
      }
      this.hideError($inputElement, $errorElement);
      return true;
    },
    validateAdvertisementTitle: function(title, showErrorCallback, $inputElement, $errorElement) {
      if (!title) {
        $inputElement.addClass('is-invalid');
        $errorElement.text('Title cannot be empty.').show();
        showErrorCallback('Title cannot be empty.', 'danger');
        return false;
      }
      if (title.length > 255) {
        $inputElement.addClass('is-invalid');
        $errorElement.text('Title cannot exceed 255 characters.').show();
        showErrorCallback('Title cannot exceed 255 characters.', 'danger');
        return false;
      }
      this.hideError($inputElement, $errorElement);
      return true;
    },
    validateUserFilters: function(filters, showErrorCallback) {
      // Add specific validation logic for user filters if needed
      return true; // For now, assume all user filters are valid
    },
    validateAdvertisementFilters: function(filters, showErrorCallback) {
      // Add specific validation logic for advertisement filters if needed
      return true; // For now, assume all advertisement filters are valid
    },
    hideError: function($inputElement, $errorElement) {
      $inputElement.removeClass('is-invalid');
      $errorElement.hide();
    }
  };


  // Manages filter values and states. Exposed to window.Filters.
  window.Filters = (function() {
    // User filter elements
    const $startId = $('#startId');
    const $endId = $('#endId');
    const $filterName = $('#filterName');
    const $filterCreatedAtStart = $('#filterCreatedAtStart');
    const $filterCreatedAtEnd = $('#filterCreatedAtEnd');
    const $filterUpdatedAtStart = $('#filterUpdatedAtStart');
    const $filterUpdatedAtEnd = $('#filterUpdatedAtEnd');

    // Advertisement filter elements
    const $adStartId = $('#adStartId');
    const $adEndId = $('#adEndId');
    const $filterTitle = $('#filterTitle');
    const $filterCategory = $('#filterCategory');
    const $filterLocation = $('#filterAdLocation'); // Corrected ID from `filterLocation`
    const $filterStatus = $('#filterAdStatus'); // Corrected ID from `filterStatus`

    return {
      getUserFilterValues: function() {
        return {
          startId: $startId.val() || null,
          endId: $endId.val() || null,
          name: $filterName.val().trim() || null,
          createdAtStart: $filterCreatedAtStart.val() || null,
          createdAtEnd: $filterCreatedAtEnd.val() || null,
          updatedAtStart: $filterUpdatedAtStart.val() || null,
          updatedAtEnd: $filterUpdatedAtEnd.val() || null
        };
      },

      clearUserFilterFields: function() {
        $startId.val('');
        $endId.val('');
        $filterName.val('');
        $filterCreatedAtStart.val('');
        $filterCreatedAtEnd.val('');
        $filterUpdatedAtStart.val('');
        $filterUpdatedAtEnd.val('');
        $startId.removeAttr('max');
        $endId.removeAttr('min');
        $filterCreatedAtStart.removeAttr('max');
        $filterCreatedAtEnd.removeAttr('min');
        $filterUpdatedAtStart.removeAttr('max');
        $filterUpdatedAtEnd.removeAttr('min');
      },

      hasActiveUserFilters: function() {
        const filters = this.getUserFilterValues();
        return Object.keys(filters).some(key => filters[key] !== null && filters[key] !== '');
      },

      getAdvertisementFilterValues: function() {
        const filters = {
          startId: $adStartId.val() || null,
          endId: $adEndId.val() || null,
          title: $filterTitle.val().trim() || null,
          category: $filterCategory.val().trim() || null,
          location: $filterLocation.val().trim() || null,
          status: $filterStatus.val().trim() || null, // Get value from filter status dropdown
          createdAtStart: $('#filterAdCreatedAtStart').val() || null,
          createdAtEnd: $('#filterAdCreatedAtEnd').val() || null,
          updatedAtStart: $('#filterAdUpdatedAtStart').val() || null,
          updatedAtEnd: $('#filterAdUpdatedAtEnd').val() || null
        };
        return filters;
      },

      clearAdvertisementFilterFields: function() {
        $adStartId.val('');
        $adEndId.val('');
        $filterTitle.val('');
        $filterCategory.val('');
        $filterLocation.val('');
        $filterStatus.val('ACTIVE'); // Reset status to default ACTIVE
        $('#filterAdCreatedAtStart').val('');
        $('#filterAdCreatedAtEnd').val('');
        $('#filterAdUpdatedAtStart').val('');
        $('#filterAdUpdatedAtEnd').val('');
        $adStartId.removeAttr('max');
        $adEndId.removeAttr('min');
        $('#filterAdCreatedAtStart').removeAttr('max');
        $('#filterAdCreatedAtEnd').removeAttr('min');
        $('#filterAdUpdatedAtStart').removeAttr('max');
        $('#filterAdUpdatedAtEnd').removeAttr('min');
      },

      hasActiveAdvertisementFilters: function() {
        const filters = this.getAdvertisementFilterValues();
        // Check all filter fields except status if it's the default 'ACTIVE'
        return Object.keys(filters).some(key => {
          if (key === 'status') {
            return filters[key] !== null && filters[key] !== '' && filters[key] !== 'ACTIVE';
          }
          return filters[key] !== null && filters[key] !== '';
        });
      }
    };
  })();
})();
