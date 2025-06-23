(function() {
  /**
   * Class responsible for rendering the advertisement table and pagination controls.
   */
  class AdvertisementTableRenderer {
    constructor($tableBody, $paginationInfo, $paginationList, $tableHeaders, pageSize) {
      this.$tableBody = $tableBody;
      this.$paginationInfo = $paginationInfo;
      this.$paginationList = $paginationList;
      this.$tableHeaders = $tableHeaders;
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
     */
    renderPaginationControls(totalItems, currentPage, totalPages) {
      this.$paginationList.empty();

      if (totalPages <= 1) {
        this.updatePaginationInfo(totalItems, currentPage, totalPages);
        return;
      }

      const prevDisabled = currentPage === 0 ? 'disabled' : '';
      this.$paginationList.append(`
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span> <span class="sr-only">Previous</span>
            </a>
        </li>
      `);

      for (let i = 0; i < totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        this.$paginationList.append(`
          <li class="page-item ${activeClass}">
              <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
          </li>
        `);
      }

      const nextDisabled = currentPage >= totalPages - 1 ? 'disabled' : '';
      this.$paginationList.append(`
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span> <span class="sr-only">Next</span>
            </a>
        </li>
      `);

      this.updatePaginationInfo(totalItems, currentPage, totalPages);
    }

    /**
     * Creates an HTML table row string for a given advertisement object.
     * @param {object} value - The advertisement object.
     * @returns {string} - The HTML string for a table row.
     */
    createRowHtml(value) {
      const createdAt = value.createdAt ? new Date(value.createdAt).toLocaleString() : 'N/A';
      const updatedAt = value.updatedAt ? new Date(value.updatedAt).toLocaleString() : 'N/A';

      const sanitizedTitle = $('<div>').text(value.title).html();
      const sanitizedCategory = $('<div>').text(value.category).html();
      const sanitizedLocation = $('<div>').text(value.location).html();
      const sanitizedStatus = $('<div>').text(value.status).html();

      return `
        <tr id="ad-row-${value.id}">
          <td><div class="td-content">${value.id}</div></td>
          <td><div class="td-content td-name-content">${sanitizedTitle}</div></td>
          <td><div class="td-content">${sanitizedCategory}</div></td>
          <td><div class="td-content">${sanitizedLocation}</div></td>
          <td><div class="td-content">${sanitizedStatus}</div></td>
          <td><div class="td-content">${createdAt}</div></td>
          <td><div class="td-content">${updatedAt}</div></td>
          <td>
            <div class="td-content td-actions-content">
              <button class="btn btn-primary edit-button" data-id="${value.id}" title="Edit Advertisement">
                <img src="/icons/icon-pencil.svg" alt="Edit" width="16" height="16">
              </button>
              <button class="btn btn-danger delete-button" data-id="${value.id}" title="Delete Advertisement">
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
            <td colspan="8" class="text-center py-4 text-muted">Loading advertisements...</td>
        </tr>
      `);
    }

    /**
     * Appends a new row to the table body.
     * @param {string} html - The HTML string for the table row.
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


  class AdvertisementListTable {
    constructor() {
      this.$loadButton = $('#loadAdsButton');
      this.$tableBody = $('#adTableBody'); // Specific ID for advertisement table body
      this.$startId = $('#adStartId'); // Specific ID for advertisement filter
      this.$endId = $('#adEndId'); // Specific ID for advertisement filter
      this.$paginationInfo = $('#adPaginationInfo'); // Specific ID for advertisement pagination
      this.$paginationList = $('#adPaginationList'); // Specific ID for advertisement pagination
      // Corrected selector: Find table headers within the specific advertisement table
      this.$tableHeaders = $('#adTableBody').closest('table').find('th[data-sort-field]');
      this.$tableHead = $('#adTableBody').closest('table').find('thead'); // Find thead relative to adTableBody

      this.$filterTitle = $('#filterTitle'); // Specific ID for advertisement filter
      this.$filterCategory = $('#filterCategory'); // Specific ID for advertisement filter
      this.$filterLocation = $('#filterLocation'); // Specific ID for advertisement filter
      this.$filterStatus = $('#filterStatus'); // Specific ID for advertisement filter
      this.$filterCreatedAtStart = $('#filterAdCreatedAtStart'); // Specific ID for advertisement filter
      this.$filterCreatedAtEnd = $('#filterAdCreatedAtEnd'); // Specific ID for advertisement filter
      this.$filterUpdatedAtStart = $('#filterAdUpdatedAtStart'); // Specific ID for advertisement filter
      this.$filterUpdatedAtEnd = $('#filterAdUpdatedAtEnd'); // Specific ID for advertisement filter
      this.$clearFiltersButton = $('#clearAdsFiltersButton'); // Specific ID for advertisement filter

      this.currentPage = 0;
      this.totalItems = 0;
      this.totalPages = 0;
      this.currentSortField = window.GlobalConfig.defaultSort.field; // Using global config
      this.currentSortDirection = window.GlobalConfig.defaultSort.direction; // Using global config

      this.renderer = new AdvertisementTableRenderer(
        this.$tableBody,
        this.$paginationInfo,
        this.$paginationList,
        this.$tableHeaders,
        window.GlobalConfig.pagination.pageSize
      );

      // Instantiate AdvertisementFilterService with all advertisement-specific filter elements
      this.filterService = new window.AdvertisementFilterService(
        this.$startId,
        this.$endId,
        this.$filterTitle,
        this.$filterCategory,
        this.$filterLocation,
        this.$filterStatus,
        this.$filterCreatedAtStart,
        this.$filterCreatedAtEnd,
        this.$filterUpdatedAtStart,
        this.$filterUpdatedAtEnd
      );

      // NO initial loadAdvertisements(0) call here anymore.
      // Loading will be triggered by Bootstrap tab 'shown.bs.tab' event or explicit button click.


      this.$loadButton.on('click', this.loadAdvertisements.bind(this, 0));
      this.$clearFiltersButton.on('click', this.clearFilters.bind(this));
      this.$paginationList.on('click', '.page-link', this.handlePaginationClick.bind(this));

      // Listen to custom events for advertisement updates (e.g., from modal)
      window.EventBus.on('advertisement:added', this.handleAdvertisementUpdateEvent.bind(this));
      window.EventBus.on('advertisement:updated', this.handleAdvertisementUpdateEvent.bind(this));


      // Changed event listeners to use the generic 'edit-button' and 'delete-button' classes
      this.$tableBody.on('click', '.edit-button', this.handleEditButtonClick.bind(this));
      this.$tableBody.on('click', '.delete-button', this.handleDeleteButtonClick.bind(this));
      // Attaching the sort handler to the specific table's thead
      this.$tableHead.on('click', 'th[data-sort-field]', this.handleSortHeaderClick.bind(this));


      // Date filter change handlers
      this.$filterCreatedAtStart.on('change', this.handleDateFilterChange.bind(this, this.$filterCreatedAtStart, this.$filterCreatedAtEnd, 'max', 'min'));
      this.$filterCreatedAtEnd.on('change', this.handleDateFilterChange.bind(this, this.$filterCreatedAtEnd, this.$filterCreatedAtStart, 'min', 'max'));
      this.$filterUpdatedAtStart.on('change', this.handleDateFilterChange.bind(this, this.$filterUpdatedAtStart, this.$filterUpdatedAtEnd, 'max', 'min'));
      this.$filterUpdatedAtEnd.on('change', this.handleDateFilterChange.bind(this, this.$filterUpdatedAtEnd, this.$filterUpdatedAtStart, 'min', 'max'));

      this.renderer.updateSortIndicators(this.currentSortField, this.currentSortDirection);

      // Bootstrap tab event listeners
      const mainTabTriggerEl = document.querySelector('#main-tab');
      if (mainTabTriggerEl) {
        mainTabTriggerEl.addEventListener('shown.bs.tab', event => {
          console.log('Main tab shown, loading advertisements...');
          this.loadAdvertisements(0); // Load advertisements when main tab becomes active
        });
        mainTabTriggerEl.addEventListener('hidden.bs.tab', event => {
          console.log('Main tab hidden, clearing advertisement table...');
          this.renderer.clearTableBody(); // Clear table when main tab becomes inactive
          this.$paginationInfo.empty(); // Clear pagination info
        });
      }

      // Initial load if main tab is already active on page load
      if ($('#main-tab').hasClass('active')) {
        console.log('Main tab is initially active, loading advertisements...');
        this.loadAdvertisements(0);
      }
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

    // Sets loading state for the load button
    startLoading() {
      this.$loadButton.text('Loading...').prop('disabled', true);
    }

    // Resets load button state
    stopLoading() {
      this.$loadButton.text('Load Ads').prop('disabled', false);
    }

    // Displays an error message using the custom UI feedback from utils.js
    showError(message) {
      window.showUserFeedback(message, 'danger');
    }

    // Loads advertisements from the server using Oboe.js
    loadAdvertisements(page = 0) {
      this.currentPage = page;
      this.startLoading();

      this.renderer.setLoadingState(true);

      const filterValues = this.filterService.getAdvertisementFilterValues(); // Correctly call method on AdvertisementFilterService

      if (!window.InputValidator.validateAdvertisementFilters(filterValues, this.showError)) { // New validation method
        this.stopLoading();
        this.renderer.renderPaginationControls(this.totalItems, this.currentPage, this.totalPages);
        this.renderer.updateSortIndicators(this.currentSortField, this.currentSortDirection);
        this.renderer.setLoadingState(false);
        return;
      }

      // Convert date strings from input[type="date"] to ISO 8601 Instant format
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
      if (formattedFilterValues.titleFilter) queryParams.titleFilter = formattedFilterValues.titleFilter;
      if (formattedFilterValues.categoryFilter) queryParams.categoryFilter = formattedFilterValues.categoryFilter;
      if (formattedFilterValues.locationFilter) queryParams.locationFilter = formattedFilterValues.locationFilter;
      if (formattedFilterValues.statusFilter) queryParams.statusFilter = formattedFilterValues.statusFilter;
      if (formattedFilterValues.createdAtStart) queryParams.createdAtStart = formattedFilterValues.createdAtStart;
      if (formattedFilterValues.createdAtEnd) queryParams.createdAtEnd = formattedFilterValues.createdAtEnd;
      if (formattedFilterValues.updatedAtStart) queryParams.updatedAtStart = formattedFilterValues.updatedAtStart;
      if (formattedFilterValues.updatedAtEnd) queryParams.updatedAtEnd = formattedFilterValues.updatedAtEnd;


      const url = `${window.GlobalConfig.advertisementApiBaseUrl}?${new URLSearchParams(queryParams).toString()}`; // New API base URL for ads

      console.log('Fetching advertisements URL:', url); // Log the URL being fetched

      oboe({
        url: url,
        method: 'GET'
      })
        .start(() => {
        console.log('Oboe stream started for /advertisements');
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
          this.renderer.renderPaginationControls(this.totalItems, this.currentPage, this.totalPages);

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
        }
      })
        .fail((error) => {
        console.error('Stream failed:', error);
        let errorMessage = 'Failed to load advertisements. Please try again later.';

        if (error && typeof error.statusCode === 'number') {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            errorMessage = `Failed to load advertisements. Client error (Status: ${error.statusCode}).`;
            if (error.json && error.json.message) {
              errorMessage += ` Details: ${error.json.message}`;
            } else if (error.thrown) {
              errorMessage += ` Details: ${error.thrown.message || error.thrown}`;
            }
          } else if (error.statusCode >= 500 && error.statusCode < 600) {
            errorMessage = `Failed to load advertisements. Server error (Status: ${error.statusCode}).`;
          } else {
            errorMessage = `Failed to load advertisements. Unexpected status: ${error.statusCode}.`;
          }
        } else {
          errorMessage = 'Failed to load advertisements. Please check your internet connection or the server status.';
        }

        this.showError(errorMessage);
        this.stopLoading();
        this.totalItems = 0;
        this.totalPages = 0;
        this.currentPage = 0;
        this.renderer.renderPaginationControls(this.totalItems, this.currentPage, this.totalPages);
        this.renderer.updateSortIndicators(this.currentSortField, this.currentSortDirection);
        this.renderer.setLoadingState(false);
        this.renderer.clearTableBody();
      });
    }

    /**
     * Clears all filter input fields and reloads the advertisement list.
     */
    clearFilters() {
      // Correctly call hasActiveAdvertisementFilters on AdvertisementFilterService instance
      if (!this.filterService.hasActiveAdvertisementFilters()) {
        console.log('No active advertisement filters to clear.');
        return;
      }

      // Correctly call clearAdvertisementFilterFields on AdvertisementFilterService instance
      this.filterService.clearAdvertisementFilterFields();
      this.loadAdvertisements(0);
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
        this.loadAdvertisements(page);
      } else {
        console.log(`Attempted to go to current or invalid page: ${page}. Current: ${this.currentPage}, Total Pages: ${this.totalPages}`);
      }
    }

    // Handles click on edit button
    handleEditButtonClick(event) {
      const adId = $(event.currentTarget).data('id');
      // openModalForEdit is a global function from the modal.js, we need a new one for ads
      if (typeof window.openAdModalForEdit === 'function') { // New function name
        window.openAdModalForEdit(adId, event.currentTarget); // Pass the native DOM element
      } else {
        console.error('openAdModalForEdit function not found. Ensure ad_modal.js is loaded and exposes openAdModalForEdit globally.');
      }
    }

    // Handles click on delete button
    async handleDeleteButtonClick(event) {
      const adId = $(event.currentTarget).data('id');
      window.showConfirmationModal('Are you sure you want to delete this advertisement?', async () => {
        try {
          await window.Api.deleteAdvertisement(adId); // New API method

          this.loadAdvertisements(this.currentPage);
          window.showUserFeedback('Advertisement deleted successfully', 'success');
        } catch (error) {
          console.error('Failed to delete advertisement:', error);
          this.showError('Failed to delete advertisement. Please try again later.');
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

      this.loadAdvertisements(0);
    }

    // Handles advertisement added/updated events to reload the table
    handleAdvertisementUpdateEvent(data) {
      console.log(`Advertisement data changed (via EventBus):`, data);
      this.loadAdvertisements(this.currentPage);
    }
  }

  // Initialize the AdvertisementListTable component when the document is ready
  $(document).ready(() => {
    new AdvertisementListTable();
  });
})();
