(function() {
  // Access BaseTableRenderer from window (assuming utils.js is loaded first)
  const BaseTableRenderer = window.BaseTableRenderer;

  /**
   * Class responsible for rendering the user table and pagination controls.
   */
  class UserTableRenderer extends BaseTableRenderer { // Extend BaseTableRenderer
    constructor($tableBody, $paginationInfo, $paginationList, $tableHeaders, pageSize) {
      super($paginationInfo, $paginationList, pageSize); // Call parent constructor
      this.$tableBody = $tableBody;
      this.$tableHeaders = $tableHeaders;
    }

    /**
     * Creates an HTML table row string for a given user object.
     * @param {object} value - The user object.
     * @returns {string} - The HTML string for a table row.
     */
    createRowHtml(value) {
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
    }

    /**
     * Updates the visual sort indicators in the table headers.
     * @param {string} currentSortField - The field currently being sorted.
     * @param {string} currentSortDirection - The current sort direction ('asc' or 'desc').
     */
    updateSortIndicators(currentSortField, currentSortDirection) {
      this.$tableHeaders.each((index, header) => {
        const $header = $(header);
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
    }

    /**
     * Clears the table body.
     */
    clearTableBody() {
      this.$tableBody.empty();
    }

    /**
     * Displays a loading row in the table.
     */
    showLoadingRow() {
      this.$tableBody.append(`
        <tr id="loading-row">
            <td colspan="5" class="text-center py-4 text-muted">Loading users...</td>
        </tr>
      `);
    }

    /**
     * Appends a new row to the table body.
     * @param {string} html - The HTML string for a table row.
     */
    appendRow(html) {
      this.$tableBody.append(html);
    }

    /**
     * Removes the loading row from the table.
     */
    removeLoadingRow() {
      $('#loading-row').remove();
    }

    /**
     * Sets the loading state of the table.
     * @param {boolean} isLoading - True to show loading, false to hide.
     */
    setLoadingState(isLoading) {
      if (isLoading) {
        this.clearTableBody();
        this.showLoadingRow();
      } else {
        this.removeLoadingRow();
      }
    }
  }


  class UserListTable {
    constructor() {
      this.$loadButton = $('#loadButton');
      this.$tableBody = $('#tableBody'); // Now uses specific ID for user table body
      this.$startId = $('#startId');
      this.$endId = $('#endId');
      this.$paginationInfo = $('#paginationInfo');
      this.$paginationList = $('#paginationList');
      // Corrected selector: Find table headers within the specific user table tbody's closest table
      this.$tableHeaders = $('#tableBody').closest('table').find('th[data-sort-field]');
      // Corrected selector: Find the thead relative to the specific user table tbody
      this.$tableHead = $('#tableBody').closest('table').find('thead');

      this.$filterName = $('#filterName');
      this.$filterCreatedAtStart = $('#filterCreatedAtStart');
      this.$filterCreatedAtEnd = $('#filterCreatedAtEnd');
      this.$filterUpdatedAtStart = $('#filterUpdatedAtStart');
      this.$filterUpdatedAtEnd = $('#filterUpdatedAtEnd');
      this.$clearFiltersButton = $('#clearFiltersButton');

      this.currentPage = 0;
      this.totalItems = 0;
      this.totalPages = 0;
      this.currentSortField = window.GlobalConfig.defaultSort.field;
      this.currentSortDirection = window.GlobalConfig.defaultSort.direction;

      this.renderer = new UserTableRenderer(
        this.$tableBody,
        this.$paginationInfo,
        this.$paginationList,
        this.$tableHeaders,
        window.GlobalConfig.pagination.pageSize
      );

      // Instantiate UserFilterService instead of generic FilterService
      // Using window.Filters directly as it's an IIFE that returns an object, not a constructor
      this.filterService = window.Filters;

      // NEW: Property to hold the current Oboe.js request
      this.currentOboeRequest = null;

      this.$loadButton.on('click', this.loadUsers.bind(this, 0));
      this.$clearFiltersButton.on('click', this.clearFilters.bind(this));
      this.$paginationList.on('click', '.page-link', (event) => {
        event.preventDefault();
        const $clickedLink = $(event.currentTarget);
        const $parentItem = $clickedLink.closest('.page-item');
        if (!$parentItem.hasClass('disabled') && !$parentItem.hasClass('active')) {
          const targetPage = parseInt($clickedLink.data('page'));
          // Pass this.loadUsers as a callback for page change
          this.renderer.renderPaginationControls(this.totalItems, targetPage, this.totalPages, this.loadUsers.bind(this));
          this.loadUsers(targetPage);
        }
      });

      window.EventBus.on('user:added', this.handleUserUpdateEvent.bind(this));
      window.EventBus.on('user:updated', this.handleUserUpdateEvent.bind(this));


      this.$tableBody.on('click', '.edit-button', this.handleEditButtonClick.bind(this));
      this.$tableBody.on('click', '.delete-button', this.handleDeleteButtonClick.bind(this));
      // Attaching the sort handler to the specific table's thead
      this.$tableHead.on('click', 'th[data-sort-field]', this.handleSortHeaderClick.bind(this));


      window.setupDateRangeValidation(this.$filterCreatedAtStart, this.$filterCreatedAtEnd);
      window.setupDateRangeValidation(this.$filterUpdatedAtStart, this.$filterUpdatedAtEnd);

      this.renderer.updateSortIndicators(this.currentSortField, this.currentSortDirection);

      // Bootstrap tab event listeners
      const settingsTabTriggerEl = document.querySelector('#settings-tab');
      if (settingsTabTriggerEl) {
        settingsTabTriggerEl.addEventListener('shown.bs.tab', event => {
          console.log('Settings tab shown, loading users...');
          this.loadUsers(0); // Load users when settings tab becomes active
        });
        settingsTabTriggerEl.addEventListener('hidden.bs.tab', event => {
          console.log('Settings tab hidden, clearing user table...');
          this.renderer.clearTableBody(); // Clear table when settings tab becomes inactive
          this.$paginationInfo.empty(); // Clear pagination info
        });
      }

      // Initial load if settings tab is already active on page load
      if ($('#settings-tab').hasClass('active')) {
        console.log('Settings tab is initially active, loading users...');
        this.loadUsers(0);
      }
    }

    // Sets loading state for the load button
    startLoading() {
      this.$loadButton.text('Loading...').prop('disabled', true);
    }

    // Resets load button state
    stopLoading() {
      this.$loadButton.text('Load').prop('disabled', false);
    }

    // Displays an error message using the custom UI feedback from utils.js
    showError(message) {
      window.showUserFeedback(message, 'danger');
    }

    // Loads users from the server using Oboe.js
    loadUsers(page = 0) {
      this.currentPage = page;
      this.startLoading();

      this.renderer.setLoadingState(true);

      const filterValues = this.filterService.getUserFilterValues();

      if (!window.InputValidator.validateUserFilters(filterValues, this.showError)) {
        this.stopLoading();
        this.renderer.renderPaginationControls(this.totalItems, this.currentPage, this.totalPages, this.loadUsers.bind(this));
        this.renderer.updateSortIndicators(this.currentSortField, this.currentSortDirection);
        this.renderer.setLoadingState(false);
        return;
      }

      // Convert date strings from input[type="date"] to ISO 8601 Instant format (e.g., "YYYY-MM-DDTHH:mm:ss.SSSZ")
      const formattedFilterValues = { ...filterValues };
      if (formattedFilterValues.createdAtStart) {
        formattedFilterValues.createdAtStart = new Date(formattedFilterValues.createdAtStart + 'T00:00:00.000Z').toISOString();
      }
      if (formattedFilterValues.createdAtEnd) {
        formattedFilterValues.createdAtEnd = new Date(formattedFilterValues.createdAtEnd + 'T23:59:59.999Z').toISOString();
      }
      if (formattedFilterValues.updatedAtStart) {
        formattedFilterValues.updatedAtStart = new Date(formattedFilterValues.updatedAtStart + 'T00:00:00.000Z').toISOString();
      }
      if (formattedFilterValues.updatedAtEnd) {
        formattedFilterValues.updatedAtEnd = new Date(formattedFilterValues.updatedAtEnd + 'T23:59:59.999Z').toISOString();
      }


      const queryParams = {
        page: this.currentPage,
        size: window.GlobalConfig.pagination.pageSize,
        sort: `${this.currentSortField},${this.currentSortDirection}`
      };

      if (formattedFilterValues.startId !== null) queryParams.startId = formattedFilterValues.startId;
      if (formattedFilterValues.endId !== null) queryParams.endId = formattedFilterValues.endId;
      if (formattedFilterValues.name) queryParams.nameFilter = formattedFilterValues.name; // Use 'name' from filters and map to 'nameFilter'
      if (formattedFilterValues.createdAtStart) queryParams.createdAtStart = formattedFilterValues.createdAtStart;
      if (formattedFilterValues.createdAtEnd) queryParams.createdAtEnd = formattedFilterValues.createdAtEnd;
      if (formattedFilterValues.updatedAtStart) queryParams.updatedAtStart = formattedFilterValues.updatedAtStart;
      if (formattedFilterValues.updatedAtEnd) queryParams.updatedAtEnd = formattedFilterValues.updatedAtEnd;

      const url = `${window.GlobalConfig.userApiBaseUrl}?${new URLSearchParams(queryParams).toString()}`; // Use userApiBaseUrl


      // NEW: Abort any previous active request to prevent duplicates
      if (this.currentOboeRequest) {
        this.currentOboeRequest.abort();
        console.log('Aborted previous Oboe request for /users');
      }

      this.currentOboeRequest = oboe({
        url: url,
        method: 'GET'
      })
        .start(() => {
        console.log('Oboe stream started for /users');
      })
        .node('!', (record) => {
        if (record.type === 'data') {
          if ($('#loading-row').length) {
            this.renderer.removeLoadingRow();
          }
          this.renderer.appendRow(this.renderer.createRowHtml(record.value));
        } else if (record.type === 'pagination_metadata') {
          this.totalItems = record.value.totalItems;
          this.totalPages = Math.ceil(this.totalItems / window.GlobalConfig.pagination.pageSize);
          this.currentPage = record.value.currentPage;
          // IMPORTANT: Call updatePaginationInfo here when pagination metadata is received
          this.renderer.updatePaginationInfo(this.totalItems, this.currentPage, this.totalPages);
          this.renderer.renderPaginationControls(this.totalItems, this.currentPage, this.totalPages, this.loadUsers.bind(this));

          console.log('Received Pagination Metadata:', record.value);
        } else if (record.type === 'done') {
          console.log('End of stream reached');
        }
        return oboe.drop;
      })
        .done(() => {
        this.stopLoading();
        this.renderer.updateSortIndicators(this.currentSortField, this.currentSortDirection);
        console.log('Oboe stream completed.');
        this.renderer.setLoadingState(false);
        if (this.totalItems === 0) {
          this.renderer.clearTableBody();
          this.renderer.appendRow('<tr><td colspan="5" class="text-center">No users found.</td></tr>');
        }
        // NEW: Clear the reference to the current Oboe request
        this.currentOboeRequest = null;
      })
        .fail((error) => {
        console.error('Stream failed:', error);
        let errorMessage = 'Failed to load users. Please try again later.';

        if (error && typeof error.statusCode === 'number') {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            errorMessage = `Failed to load users. Client error (Status: ${error.statusCode}).`;
            if (error.json && error.json.message) {
              errorMessage += ` Details: ${error.json.message}`;
            } else if (error.thrown) {
              errorMessage += ` Details: ${error.thrown.message || error.thrown}`;
            }
          } else if (error.statusCode >= 500 && error.statusCode < 600) {
            errorMessage = `Failed to load users. Server error (Status: ${error.statusCode}).`;
          } else {
            errorMessage = `Failed to load users. Unexpected status: ${error.statusCode}.`;
          }
        } else {
          errorMessage = 'Failed to load users. Please check your internet connection or the server status.';
        }

        this.showError(errorMessage);
        this.stopLoading();
        this.totalItems = 0;
        this.totalPages = 0;
        this.currentPage = 0;
        this.renderer.updatePaginationInfo(this.totalItems, this.currentPage, this.totalPages); // Ensure info is cleared/reset on error
        this.renderer.renderPaginationControls(this.totalItems, this.currentPage, this.totalPages, this.loadUsers.bind(this));
        this.renderer.updateSortIndicators(this.currentSortField, this.currentSortDirection);
        this.renderer.setLoadingState(false);
        this.renderer.clearTableBody();
        this.renderer.appendRow('<tr><td colspan="5" class="text-center">Error loading users.</td></tr>');
        // NEW: Clear the reference to the current Oboe request
        this.currentOboeRequest = null;
      });
    }

    clearFilters() {
      // Call clearUserFilterFields on Filters object
      if (!this.filterService.hasActiveUserFilters()) {
        console.log('No active filters to clear.');
        return;
      }

      this.filterService.clearUserFilterFields();
      this.loadUsers(0);
    }

    handlePaginationClick(event) {
      event.preventDefault();

      const $clickedLink = $(event.currentTarget);
      const $parentItem = $clickedLink.closest('.page-item');

      if (!$parentItem.hasClass('disabled') && !$parentItem.hasClass('active')) {
        const targetPage = parseInt($clickedLink.data('page'));
        this.goToPage(targetPage);
      }
    }

    // Navigates to a specific page
    goToPage(page) {
      if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
        this.loadUsers(page);
      } else {
        console.log(`Attempted to go to current or invalid page: ${page}. Current: ${this.currentPage}, Total Pages: ${this.totalPages}`);
      }
    }

    handleEditButtonClick(event) {
      const userId = $(event.currentTarget).data('id');
      if (typeof window.openModalForEdit === 'function') {
        window.openModalForEdit(userId, event.currentTarget); // Pass native DOM element
      } else {
        console.error('openModalForEdit function not found. Ensure modal.js is loaded and exposes openModalForEdit globally.');
      }
    }

    async handleDeleteButtonClick(event) {
      const userId = $(event.currentTarget).data('id');
      window.showConfirmationModal('Are you sure you want to delete this user?', async () => {
        try {
          await window.Api.deleteUser(userId);

          this.loadUsers(this.currentPage);
          window.showUserFeedback('User deleted successfully', 'success');
        } catch (error) {
          console.error('Failed to delete user:', error);
          this.showError('Failed to delete user. Please try again later.');
        }
      });
    }

    handleSortHeaderClick(event) {
      const $header = $(event.currentTarget);
      const field = $header.data('sort-field');

      if (field === this.currentSortField) {
        this.currentSortDirection = (this.currentSortDirection === 'asc') ? 'desc' : 'asc';
      } else {
        this.currentSortField = field;
        this.currentSortDirection = 'asc';
      }

      this.loadUsers(0);
    }

    handleUserUpdateEvent(data) {
      // Log to verify if this event handler is triggered
      console.log(`User data changed (via EventBus):`, data);
      this.loadUsers(this.currentPage);
    }
  }

  $(document).ready(() => {
    // Check if the userList fragment is present on the page
    if ($('#userList').length) {
      new UserListTable();
    }
  });
})();
