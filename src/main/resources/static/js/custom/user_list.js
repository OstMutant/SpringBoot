(function() {
  // Centralized configuration module
  const Config = {
    pagination: {
      pageSize: 10,
    },
    // apiBaseUrl is now centralized in UtilsConfig (in utils.js), used by window.Api
    defaultSort: {
      field: 'createdAt',
      direction: 'desc'
    }
  };

  class UserListTable {
    constructor() {
      // Initialize DOM elements
      this.$loadButton = $('#loadButton');
      this.$tableBody = $('tbody');
      this.$startId = $('#startId');
      this.$endId = $('#endId');
      this.$paginationInfo = $('#paginationInfo');
      this.$paginationList = $('#paginationList');
      this.$tableHeaders = $('th[data-sort-field]');

      // Initialize new filter elements
      this.$filterName = $('#filterName');
      this.$filterCreatedAtStart = $('#filterCreatedAtStart');
      this.$filterCreatedAtEnd = $('#filterCreatedAtEnd');
      this.$filterUpdatedAtStart = $('#filterUpdatedAtStart');
      this.$filterUpdatedAtEnd = $('#filterUpdatedAtEnd');
      this.$clearFiltersButton = $('#clearFiltersButton');

      // State variables
      this.currentPage = 0;
      this.totalItems = 0;
      this.totalPages = 0;
      this.currentSortField = Config.defaultSort.field;
      this.currentSortDirection = Config.defaultSort.direction;

      // Initial load users with default sorting
      this.loadUsers(0);

      // Attach event listeners
      this.$loadButton.on('click', this.loadUsers.bind(this, 0));
      this.$clearFiltersButton.on('click', this.clearFilters.bind(this));
      this.$paginationList.on('click', '.page-link', this.handlePaginationClick.bind(this));
      $(document).on('userAdded userUpdated', this.handleUserUpdateEvent.bind(this)); // This binding caused the error
      $(document).on('click', '.edit-button', this.handleEditButtonClick.bind(this));
      $(document).on('click', '.delete-button', this.handleDeleteButtonClick.bind(this));
      $('thead').on('click', 'th[data-sort-field]', this.handleSortHeaderClick.bind(this));

      // Add change event listeners for interactive date validation
      this.$filterCreatedAtStart.on('change', this.handleDateFilterChange.bind(this, this.$filterCreatedAtStart, this.$filterCreatedAtEnd, 'max', 'min'));
      this.$filterCreatedAtEnd.on('change', this.handleDateFilterChange.bind(this, this.$filterCreatedAtEnd, this.$filterCreatedAtStart, 'min', 'max'));
      this.$filterUpdatedAtStart.on('change', this.handleDateFilterChange.bind(this, this.$filterUpdatedAtStart, this.$filterUpdatedAtEnd, 'max', 'min'));
      this.$filterUpdatedAtEnd.on('change', this.handleDateFilterChange.bind(this, this.$filterUpdatedAtEnd, this.$filterUpdatedAtStart, 'min', 'max'));

      this.updateSortIndicators();
    }

    // Handles changes in date filter inputs to set min/max attributes
    handleDateFilterChange($changedInput, $targetInput, changedAttr, targetAttr) {
      const value = $changedInput.val();
      if (value) {
        $targetInput.attr(targetAttr, value);
      } else {
        $targetInput.removeAttr(targetAttr);
      }
    }


    // Updates pagination information text
    updatePaginationInfo() {
      if (this.totalItems === 0) {
        this.$paginationInfo.text('No items found.');
      } else {
        const startItem = this.currentPage * Config.pagination.pageSize + 1;
        const endItem = Math.min(startItem + Config.pagination.pageSize - 1, this.totalItems);
        this.$paginationInfo.text(`Items ${startItem}-${endItem} of ${this.totalItems} (Page ${this.currentPage + 1} of ${this.totalPages})`);
      }
    }

    // Renders pagination controls dynamically
    renderPaginationControls() {
      this.$paginationList.empty();

      if (this.totalPages <= 1) {
        this.updatePaginationInfo();
        return;
      }

      const prevDisabled = this.currentPage === 0 ? 'disabled' : '';
      this.$paginationList.append(`
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" data-page="${this.currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span> <span class="sr-only">Previous</span>
            </a>
        </li>
      `);

      for (let i = 0; i < this.totalPages; i++) {
        const activeClass = i === this.currentPage ? 'active' : '';
        this.$paginationList.append(`
          <li class="page-item ${activeClass}">
              <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
          </li>
        `);
      }

      const nextDisabled = this.currentPage >= this.totalPages - 1 ? 'disabled' : '';
      this.$paginationList.append(`
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" data-page="${this.currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span> <span class="sr-only">Next</span>
            </a>
        </li>
      `);

      this.updatePaginationInfo();
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

    // Validates filter input fields
    validateInput(startId, endId, createdAtStart, createdAtEnd, updatedAtStart, updatedAtEnd) {
      if (startId !== null && isNaN(startId)) {
        this.showError('Start ID must be a number!');
        return false;
      }
      if (endId !== null && isNaN(endId)) {
        this.showError('End ID must be a number!');
        return false;
      }
      if (startId !== null && endId !== null && startId > endId) {
        this.showError('Start ID cannot be greater than End ID!');
        return false;
      }

      let dateCreatedAtStart = null;
      if (createdAtStart) {
        dateCreatedAtStart = new Date(createdAtStart);
        if (isNaN(dateCreatedAtStart.getTime())) {
          this.showError('Invalid Created At Start date format!');
          return false;
        }
      }
      let dateCreatedAtEnd = null;
      if (createdAtEnd) {
        dateCreatedAtEnd = new Date(createdAtEnd);
        if (isNaN(dateCreatedAtEnd.getTime())) {
          this.showError('Invalid Created At End date format!');
          return false;
        }
      }
      if (dateCreatedAtStart && dateCreatedAtEnd && dateCreatedAtStart > dateCreatedAtEnd) {
        this.showError('Created At Start date cannot be after Created At End date!');
        return false;
      }

      let dateUpdatedAtStart = null;
      if (updatedAtStart) {
        dateUpdatedAtStart = new Date(updatedAtStart);
        if (isNaN(dateUpdatedAtStart.getTime())) {
          this.showError('Invalid Updated At Start date format!');
          return false;
        }
      }
      let dateUpdatedAtEnd = null;
      if (updatedAtEnd) {
        dateUpdatedAtEnd = new Date(updatedAtEnd);
        if (isNaN(dateUpdatedAtEnd.getTime())) {
          this.showError('Invalid Updated At End date format!');
          return false;
        }
      }
      if (dateUpdatedAtStart && dateUpdatedAtEnd && dateUpdatedAtStart > dateUpdatedAtEnd) {
        this.showError('Updated At Start date cannot be after Updated At End date!');
        return false;
      }
      return true;
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
     */
    updateSortIndicators() {
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

        if (sortField === this.currentSortField) {
          if (this.currentSortDirection === 'asc') {
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

    // Loads users from the server using Oboe.js
    loadUsers(page = 0) {
      this.currentPage = page;
      this.startLoading();

      this.$tableBody.empty();
      this.$tableBody.append(`
        <tr id="loading-row">
            <td colspan="5" class="text-center py-4 text-muted">Loading users...</td>
        </tr>
      `);

      const startId = this.$startId.val() ? parseInt(this.$startId.val()) : null;
      const endId = this.$endId.val() ? parseInt(this.$endId.val()) : null;
      const filterName = this.$filterName.val();
      const filterCreatedAtStart = this.$filterCreatedAtStart.val();
      const filterCreatedAtEnd = this.$filterCreatedAtEnd.val();
      const filterUpdatedAtStart = this.$filterUpdatedAtStart.val();
      const filterUpdatedAtEnd = this.$filterUpdatedAtEnd.val();


      if (!this.validateInput(startId, endId, filterCreatedAtStart, filterCreatedAtEnd, filterUpdatedAtStart,
        filterUpdatedAtEnd)) {
        this.stopLoading();
        this.renderPaginationControls();
        this.updateSortIndicators();
        $('#loading-row').remove();
        return;
      }

      // Prepare query parameters for the API call
      const queryParams = {
        page: this.currentPage,
        size: Config.pagination.pageSize,
        sort: `${this.currentSortField},${this.currentSortDirection}`
      };

      if (startId !== null) queryParams.startId = startId;
      if (endId !== null) queryParams.endId = endId;
      if (filterName) queryParams.nameFilter = filterName;
      if (filterCreatedAtStart) queryParams.createdAtStart = filterCreatedAtStart;
      if (filterCreatedAtEnd) queryParams.createdAtEnd = filterCreatedAtEnd;
      if (filterUpdatedAtStart) queryParams.updatedAtStart = filterUpdatedAtStart;
      if (filterUpdatedAtEnd) queryParams.updatedAtEnd = filterUpdatedAtEnd;

      // Corrected: Use window.Api.UtilsConfig.apiBaseUrl to get the base URL
      const url = `${window.Api.UtilsConfig.apiBaseUrl}?${new URLSearchParams(queryParams).toString()}`;

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
          this.$tableBody.append(this.createRowHtml(record.value));
        } else if (record.type === 'pagination_metadata') {
          this.totalItems = record.value.totalItems;
          this.totalPages = Math.ceil(this.totalItems / Config.pagination.pageSize);
          this.currentPage = record.value.currentPage;
          this.renderPaginationControls();

          console.log('Received Pagination Metadata:', record.value);
        } else if (record.type === 'done') {
          console.log('End of stream reached');
        }
        return oboe.drop;
      })
        .done(() => {
        this.stopLoading();
        this.updateSortIndicators();
        console.log('Oboe stream completed.');
        if ($('#loading-row').length) {
          $('#loading-row').remove();
        }
        if (this.totalItems === 0) {
          this.$tableBody.empty();
        }
      })
        .fail((error) => {
        console.error('Stream failed:', error);
        this.showError('Failed to load users. Please try again later.');
        this.stopLoading();
        this.totalItems = 0;
        this.totalPages = 0;
        this.currentPage = 0;
        this.renderPaginationControls();
        this.updateSortIndicators();
        $('#loading-row').remove();
        this.$tableBody.empty();
      });
    }

    /**
     * Clears all filter input fields and reloads the user list.
     */
    clearFilters() {
      const hasActiveFilters =
      this.$startId.val() !== '' ||
      this.$endId.val() !== '' ||
      this.$filterName.val() !== '' ||
      this.$filterCreatedAtStart.val() !== '' ||
      this.$filterCreatedAtEnd.val() !== '' ||
      this.$filterUpdatedAtStart.val() !== '' ||
      this.$filterUpdatedAtEnd.val() !== '';

      if (!hasActiveFilters) {
        console.log('No active filters to clear.');
        return;
      }

      this.$startId.val('');
      this.$endId.val('');
      this.$filterName.val('');
      this.$filterCreatedAtStart.val('');
      this.$filterCreatedAtEnd.val('');
      this.$filterUpdatedAtStart.val('');
      this.$filterUpdatedAtEnd.val('');

      // Clear min/max attributes for date inputs
      this.$filterCreatedAtStart.removeAttr('max');
      this.$filterCreatedAtEnd.removeAttr('min');
      this.$filterUpdatedAtStart.removeAttr('max');
      this.$filterUpdatedAtEnd.removeAttr('min');

      this.loadUsers(0);
    }

    // Handles pagination link clicks
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

    // Handles click on edit button
    handleEditButtonClick(event) {
      const userId = $(event.currentTarget).data('id');
      if (typeof window.openModalForEdit === 'function') {
        window.openModalForEdit(userId);
      } else {
        console.error('openModalForEdit function not found. Ensure modal.js is loaded and exposes openModalForEdit globally.');
      }
    }

    // Handles click on delete button
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

    // Handles click on sortable table headers
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

    // Handles user added/updated events to reload the table
    handleUserUpdateEvent(event, data) {
      console.log(`Event ${event.type} triggered with data:`, data);
      this.loadUsers(this.currentPage);
    }
  }

  // Initialize the UserListTable component when the document is ready
  $(document).ready(() => {
    new UserListTable();
  });
})();
