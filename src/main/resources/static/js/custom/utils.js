(function() {
  // Global configuration object
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

  // Event bus for custom events
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

  // API service for interacting with backend endpoints
  window.Api = {
    // User API calls
    fetchUser: async function(userId) {
      const response = await fetch(`${window.GlobalConfig.userApiBaseUrl}/${userId}`);
      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`);
      }
      return response.json();
    },
    saveUser: async function(user, userIdToEdit = null) {
      const method = userIdToEdit ? 'PUT' : 'POST';
      const url = userIdToEdit ? `${window.GlobalConfig.userApiBaseUrl}/${userIdToEdit}` : window.GlobalConfig.userApiBaseUrl;
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error saving user: ${response.statusText} - ${errorText}`);
      }
      return response.json();
    },
    deleteUser: async function(userId) {
      const response = await fetch(`${window.GlobalConfig.userApiBaseUrl}/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting user: ${response.statusText}`);
      }
      // No content returned for delete, so no response.json()
    },

    // Advertisement API calls
    fetchAdvertisement: async function(adId) {
      const response = await fetch(`${window.GlobalConfig.advertisementApiBaseUrl}/${adId}`);
      if (!response.ok) {
        throw new Error(`Error fetching advertisement: ${response.statusText}`);
      }
      return response.json();
    },
    saveAdvertisement: async function(advertisement, adIdToEdit = null) {
      const method = adIdToEdit ? 'PUT' : 'POST';
      const url = adIdToEdit ? `${window.GlobalConfig.advertisementApiBaseUrl}/${adIdToEdit}` : window.GlobalConfig.advertisementApiBaseUrl;
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(advertisement),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error saving advertisement: ${response.statusText} - ${errorText}`);
      }
      return response.json();
    },
    deleteAdvertisement: async function(adId) {
      const response = await fetch(`${window.GlobalConfig.advertisementApiBaseUrl}/${adId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting advertisement: ${response.statusText}`);
      }
      // No content returned for delete, so no response.json()
    }
  };

  // Utility for displaying user feedback (toasts, alerts, etc.)
  window.showUserFeedback = function(message, type = 'info', duration = 3000) {
    // Basic implementation: replace with a proper toast or notification system
    const feedbackDiv = $(`
      <div class="alert alert-${type} alert-dismissible fade show fixed-top-right m-3" role="alert" style="z-index: 1050; max-width: 300px;">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    $('body').append(feedbackDiv);
    setTimeout(() => {
      feedbackDiv.alert('close');
    }, duration);
  };

  // Input validation utility
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

  // Filter service for users
  window.UserFilterService = function($startId, $endId, $filterName, $filterCreatedAtStart, $filterCreatedAtEnd, $filterUpdatedAtStart, $filterUpdatedAtEnd) {
    this.getFilterValues = function() {
      return {
        startId: $startId.val() ? parseInt($startId.val()) : null,
        endId: $endId.val() ? parseInt($endId.val()) : null,
        nameFilter: $filterName.val().trim() || null,
        createdAtStart: $filterCreatedAtStart.val() || null,
        createdAtEnd: $filterCreatedAtEnd.val() || null,
        updatedAtStart: $filterUpdatedAtStart.val() || null,
        updatedAtEnd: $filterUpdatedAtEnd.val() || null
      };
    };

    this.clearFilterFields = function() {
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
    };

    this.hasActiveFilter = function() {
      const filters = this.getFilterValues();
      return Object.values(filters).some(value => value !== null && value !== '');
    };
  };

  // Filter service for advertisements
  window.AdvertisementFilterService = function($startId, $endId, $filterTitle, $filterCategory, $filterLocation, $filterStatus, $filterCreatedAtStart, $filterCreatedAtEnd, $filterUpdatedAtStart, $filterUpdatedAtEnd) {
    this.getAdvertisementFilterValues = function() {
      return {
        startId: $startId.val() ? parseInt($startId.val()) : null,
        endId: $endId.val() ? parseInt($endId.val()) : null,
        titleFilter: $filterTitle.val().trim() || null,
        categoryFilter: $filterCategory.val().trim() || null,
        locationFilter: $filterLocation.val().trim() || null,
        statusFilter: $filterStatus.val().trim() || null,
        createdAtStart: $filterCreatedAtStart.val() || null,
        createdAtEnd: $filterCreatedAtEnd.val() || null,
        updatedAtStart: $filterUpdatedAtStart.val() || null,
        updatedAtEnd: $filterUpdatedAtEnd.val() || null
      };
    };

    this.clearAdvertisementFilterFields = function() {
      $startId.val('');
      $endId.val('');
      $filterTitle.val('');
      $filterCategory.val('');
      $filterLocation.val('');
      $filterStatus.val('ACTIVE'); // Reset status to default
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
    };

    this.hasActiveAdvertisementFilters = function() {
      const filters = this.getAdvertisementFilterValues();
      // Check all filter fields except status if it's the default 'ACTIVE'
      return Object.keys(filters).some(key => {
        if (key === 'statusFilter') {
          return filters[key] !== null && filters[key] !== '' && filters[key] !== 'ACTIVE';
        }
        return filters[key] !== null && filters[key] !== '';
      });
    };
  };
})();
