(function() {
  class AdvertisementModal {
    constructor() {
      // DOM elements for advertisement modal
      this.$saveButton = $('#saveAdButton'); // Save button for advertisement
      this.$modalLabel = $('#adModalTitle'); // Label of the ad modal (Add Ad / Edit Ad)
      this.$adIdToEdit = null; // Stores ID of ad being edited
      this.lastFocusedElement = null; // Stores the element that opened the modal
      this.scrollPosition = 0; // Stores scroll position before modal opens

      // Advertisement-specific form fields (inputs inside the modal)
      this.$title = $('#modalAdTitle'); // Input field for advertisement title
      this.$description = $('#modalAdDescription');
      this.$category = $('#modalAdCategory');
      this.$location = $('#modalAdLocation');
      this.$contactInfo = $('#modalAdContactInfo');
      this.$imageUrls = $('#modalAdImageUrls');
      this.$status = $('#modalAdStatus');
      this.$userId = $('#modalAdUserId'); // Assuming user ID is manually entered or selected for now

      // Error message elements for validation
      this.$titleError = $('#modalAdTitleError');
      // Add more error elements for other fields if needed

      // Get the modal DOM element
      const adModalElement = document.getElementById('adModal');

      // Initialize Bootstrap Modal instance
      if (adModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        this.adModalInstance = new bootstrap.Modal(adModalElement);

        adModalElement.addEventListener('hidden.bs.modal', () => {
          // Blur the active element within the modal before hiding it, if any
          if (document.activeElement && adModalElement.contains(document.activeElement)) {
            document.activeElement.blur();
          }

          // Restore scroll position and re-enable scrolling on HTML/Body
          document.documentElement.style.overflow = ''; // Re-enable scroll on html
          document.body.style.overflow = ''; // Re-enable scroll on body (for consistency)
          window.scrollTo(0, this.scrollPosition); // Restore the scroll position

          // Return focus to the element that opened the modal, preventing scroll
          if (this.lastFocusedElement) {
            this.lastFocusedElement.focus({ preventScroll: true });
            this.lastFocusedElement = null; // Clear the stored element
          }
        });
      }

      this.$saveButton.on('click', this.handleSaveAdvertisement.bind(this));

      // Set focus to the first input field when the modal is shown
      $(adModalElement).on('shown.bs.modal', () => {
        this.$title.focus();
      });
    }

    /**
     * Opens the advertisement modal for adding a new advertisement.
     * @param {HTMLElement} [triggeringElement=null] - The DOM element that triggered the modal opening.
     */
    openModalForAdd(triggeringElement = null) {
      this.$adIdToEdit = null; // Ensure ID is null for add mode
      this.$modalLabel.text('Add Advertisement'); // Set modal title
      this.resetForm(); // Clear form fields
      this.lastFocusedElement = triggeringElement; // Store the triggering element
      this.saveScrollAndDisableScroll(); // Save scroll and disable body scroll
      this.adModalInstance.show(); // Show the modal
    }

    /**
     * Opens the advertisement modal for editing an existing advertisement.
     * @param {number} adId - The ID of the advertisement to edit.
     * @param {HTMLElement} [triggeringElement=null] - The DOM element that triggered the modal opening.
     */
    async openModalForEdit(adId, triggeringElement = null) {
      this.$adIdToEdit = adId; // Store the ID of the advertisement being edited
      this.$modalLabel.text('Edit Advertisement'); // Set modal title
      this.resetForm(); // Clear form fields before populating
      this.lastFocusedElement = triggeringElement; // Store the triggering element
      this.saveScrollAndDisableScroll(); // Save scroll and disable body scroll

      try {
        const ad = await window.Api.fetchAdvertisement(adId); // Fetch advertisement data using global Api
        this.populateForm(ad); // Populate form fields with fetched data
        this.adModalInstance.show(); // Show the modal
      } catch (error) {
        console.error('Failed to fetch advertisement for editing: ', error);
        window.showUserFeedback('Failed to load advertisement data. Please try again later.', 'danger');
        this.adModalInstance.hide(); // Hide modal if data fetch fails
      }
    }

    /**
     * Resets the form fields to their default empty or initial values.
     */
    resetForm() {
      this.$title.val('');
      this.$description.val('');
      this.$category.val('');
      this.$location.val('');
      this.$contactInfo.val('');
      this.$imageUrls.val('');
      this.$status.val('ACTIVE'); // Default status
      this.$userId.val('');

      window.InputValidator.hideError(this.$title, this.$titleError); // Use InputValidator to hide error
      // Reset other error messages if applicable
    }

    /**
     * Populates the form fields with data from an advertisement object.
     * @param {Object} ad - The advertisement object to populate the form with.
     */
    populateForm(ad) {
      this.$title.val(ad.title);
      this.$description.val(ad.description);
      this.$category.val(ad.category);
      this.$location.val(ad.location);
      this.$contactInfo.val(ad.contactInfo);
      // Ensure imageUrls is treated as an array from the backend (if it's a string, split it)
      this.$imageUrls.val(Array.isArray(ad.imageUrls) ? ad.imageUrls.join(',') : ad.imageUrls || '');
      this.$status.val(ad.status);
      this.$userId.val(ad.userId);
    }

    /**
     * Saves the current scroll position and disables body scrolling.
     */
    saveScrollAndDisableScroll() {
      this.scrollPosition = window.scrollY || document.documentElement.scrollTop;
      document.documentElement.style.overflow = 'hidden'; // Disable scroll on html
      document.body.style.overflow = 'hidden'; // Disable scroll on body (for consistency)
    }

    /**
     * Handles the save button click event, saving or updating an advertisement.
     */
    async handleSaveAdvertisement() {
      const title = this.$title.val();
      if (!window.InputValidator.validateAdvertisementTitle(title, window.showUserFeedback, this.$title, this.$titleError)) {
        return; // Stop if form is not valid
      }

      const adData = {
        title: title.trim(),
        description: this.$description.val().trim(),
        category: this.$category.val().trim(),
        location: this.$location.val().trim(),
        contactInfo: this.$contactInfo.val().trim(),
        imageUrls: this.$imageUrls.val().split(',').map(url => url.trim()).filter(url => url), // Split and trim image URLs
        status: this.$status.val(),
        userId: this.$userId.val() ? parseInt(this.$userId.val()) : null // Ensure userId is a number
      };

      try {
        const responseData = await window.Api.saveAdvertisement(adData, this.$adIdToEdit); // Use window.Api
        // Blur the active element before hiding modal to prevent focus issues on re-render
        if (document.activeElement) {
          document.activeElement.blur();
        }

        this.adModalInstance.hide(); // Hide the modal

        if (this.$adIdToEdit) {
          window.EventBus.emit('advertisement:updated', responseData); // Use window.EventBus
          window.showUserFeedback('Advertisement updated successfully!', 'success'); // Use window.showUserFeedback
        } else {
          window.EventBus.emit('advertisement:added', responseData); // Use window.EventBus
          window.showUserFeedback('Advertisement added successfully!', 'success'); // Use window.showUserFeedback
        }
      } catch (error) {
        console.error('Failed to save advertisement: ', error);
        window.showUserFeedback('Failed to save advertisement. Please try again later.', 'danger'); // Use window.showUserFeedback
      }
    }
  }

  // Initialize the AdvertisementModal component when the the DOM is ready
  $(document).ready(() => {
    const advertisementModal = new AdvertisementModal();

    // Attach event listener for the "Add Advertisement" button
    $('#addAdButton').on('click', function() {
      advertisementModal.openModalForAdd(this); // Pass 'this' as the triggering element
    });

    // Expose public methods globally if other modules need to access them
    window.openAdModalForAdd = advertisementModal.openModalForAdd.bind(advertisementModal);
    window.openAdModalForEdit = advertisementModal.openModalForEdit.bind(advertisementModal);
  });
})();
