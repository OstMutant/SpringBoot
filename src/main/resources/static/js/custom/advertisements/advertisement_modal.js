(function() {
  class AdvertisementModal {
    constructor() {
      // DOM elements for advertisement modal
      this.$saveButton = $('#saveAdButton'); // Save button for advertisement
      this.$modalLabel = $('#adModalLabel'); // Label of the ad modal (Add Ad / Edit Ad)
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

        // Event listener for when the modal is fully hidden
        adModalElement.addEventListener('hidden.bs.modal', () => {
          // Blur the active element within the modal before hiding it, if any
          if (document.activeElement && adModalElement.contains(document.activeElement)) {
            document.activeElement.blur();
          }

          // Restore scroll position and re-enable scrolling on HTML/Body
          document.documentElement.style.overflow = ''; // Re-enable scroll on html
          document.body.style.overflow = ''; // Re-enable scroll on body (for consistency)
          $('body').removeClass('modal-open'); // Bootstrap's class for open modal
          $('body').removeClass('modal-open-no-scroll'); // Custom class if used

          window.scrollTo(0, this.scrollPosition); // Restore the scroll position

          // OPTIONAL: Fallback cleanup for modal backdrops if Bootstrap fails to remove them
          // This should ideally not be needed, but can be a safety net
          setTimeout(() => {
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => {
              if (backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
              }
            });
            console.log('Safety check: Explicitly removed any lingering modal backdrops.');
          }, 150); // Small delay to let Bootstrap handle its own cleanup first

          // Return focus to the element that opened the modal, preventing scroll
          try {
            let elementToFocus = null;
            if (this.lastFocusedElement) {
              // Ensure it's a native DOM element if it's a jQuery object
              elementToFocus = this.lastFocusedElement instanceof jQuery ? this.lastFocusedElement[0] : this.lastFocusedElement;
            } else {
              elementToFocus = $('#addAdButton')[0]; // Fallback to addAdButton's native DOM element
            }

            if (elementToFocus && typeof elementToFocus.focus === 'function') {
              console.log('Attempting to return focus to:', elementToFocus);
              elementToFocus.focus({ preventScroll: true });
            } else {
              console.warn("Could not return focus to any element after modal close or element is not focusable.");
            }
          } catch (e) {
            console.error("Error attempting to return focus after modal close:", e);
          } finally {
            this.lastFocusedElement = null; // Always clear the stored element
          }
        });

        // Event listener for when the modal is shown
        adModalElement.addEventListener('shown.bs.modal', () => {
          // Store current scroll position before modal is shown
          this.scrollPosition = window.scrollY;
          // Disable scrolling on HTML and Body
          document.documentElement.style.overflow = 'hidden'; // Disable scroll on html
          document.body.style.overflow = 'hidden'; // Disable scroll on body (for consistency)
          $('body').addClass('modal-open'); // Bootstrap's class for open modal
          $('body').addClass('modal-open-no-scroll'); // Add a class for custom CSS control

          // REMOVED: Aggressive removal of backdrops here. Bootstrap will create one.
          // The old code:
          // const existingBackdrops = document.querySelectorAll('.modal-backdrop');
          // existingBackdrops.forEach(backdrop => {
          //     if (backdrop.parentNode) {
          //         backdrop.parentNode.removeChild(backdrop);
          //     }
          // });
          // console.log('Removed old modal backdrops before showing new modal.');


          // Ensure focus is explicitly on the modal container
          adModalElement.focus();
        });

      } else {
        console.warn("Bootstrap Modal not found or element not ready for advertisement modal. Falling back to jQuery .modal().");
      }

      // Attach event listeners for modal controls
      this.$saveButton.on('click', this.saveAdvertisement.bind(this));
      this.$title.on('input', this.handleTitleInput.bind(this)); // Basic validation on input
      // Add other input change handlers for validation if necessary

      // Handle click on any data-bs-dismiss="modal" button within this specific modal (e.g., Close, Cancel)
      $(adModalElement).on('click', '[data-bs-dismiss="modal"]', (event) => {
        // Ensure the event originated from a button inside THIS specific modal
        if ($(event.currentTarget).closest(adModalElement).length) {
          // Explicitly blur the active element (the clicked button)
          if (document.activeElement) {
            document.activeElement.blur();
          }
          // Bootstrap's data-bs-dismiss="modal" will handle the hide() call
        }
      });
    }

    /**
     * Opens the modal for adding a new advertisement.
     * @param {HTMLElement} triggeringElement - The DOM element that triggered opening the modal.
     */
    openModalForAdd(triggeringElement) {
      this.$modalLabel.text('Add Advertisement'); // Update modal title
      // Clear all form fields
      this.$title.val('');
      this.$description.val('');
      this.$category.val('');
      this.$location.val('');
      this.$contactInfo.val('');
      this.$imageUrls.val('');
      this.$status.val('ACTIVE'); // Default status
      this.$userId.val(''); // Clear userId, or pre-fill if authenticated user
      this.$adIdToEdit = null;

      // Hide any previous validation errors
      window.InputValidator.hideError(this.$title, this.$titleError);
      // Hide errors for other fields here

      this.lastFocusedElement = triggeringElement; // Store the triggering element
      this.adModalInstance.show(); // Show the modal
    }

    /**
     * Opens the modal for editing an existing advertisement.
     * @param {number} adId - The ID of the advertisement to edit.
     * @param {HTMLElement} triggeringElement - The DOM element that triggered opening the modal.
     */
    async openModalForEdit(adId, triggeringElement) {
      try {
        const advertisement = await window.Api.fetchAdvertisement(adId);

        this.$adIdToEdit = adId;
        this.$modalLabel.text('Edit Advertisement'); // Update modal title

        // Populate form fields with existing advertisement data
        this.$title.val(advertisement.title);
        this.$description.val(advertisement.description || '');
        this.$category.val(advertisement.category || '');
        this.$location.val(advertisement.location || '');
        this.$contactInfo.val(advertisement.contactInfo || '');
        this.$imageUrls.val(advertisement.imageUrls || '');
        this.$status.val(advertisement.status || 'ACTIVE');
        this.$userId.val(advertisement.userId || ''); // Populate userId if exists

        // Hide any previous validation errors
        window.InputValidator.hideError(this.$title, this.$titleError);
        // Hide errors for other fields here

        this.lastFocusedElement = triggeringElement; // Store the triggering element
        this.adModalInstance.show(); // Show the modal
      } catch (error) {
        console.error('Failed to fetch advertisement for edit:', error);
        window.showUserFeedback('Failed to load advertisement data for editing. Please try again later.', 'danger');
      }
    }

    /**
     * Handles input changes in the title field for validation feedback.
     */
    handleTitleInput() {
      const title = this.$title.val().trim();
      window.InputValidator.validateAdvertisementTitle(title, window.showUserFeedback, this.$title, this.$titleError);
    }

    /**
     * Saves (adds or updates) an advertisement.
     */
    async saveAdvertisement() {
      const title = this.$title.val().trim();
      const description = this.$description.val().trim();
      const category = this.$category.val().trim();
      const location = this.$location.val().trim();
      const contactInfo = this.$contactInfo.val().trim();
      const imageUrls = this.$imageUrls.val().trim();
      const status = this.$status.val().trim();
      const userId = this.$userId.val() ? parseInt(this.$userId.val()) : null;

      // Perform client-side validation
      const isTitleValid = window.InputValidator.validateAdvertisementTitle(title, window.showUserFeedback, this.$title, this.$titleError);
      // Add validation for other fields as needed
      // For simplicity, we'll only validate title here for now

      if (!isTitleValid) {
        return; // Stop if validation fails
      }

      const advertisement = {
        title: title,
        description: description,
        category: category,
        location: location,
        contactInfo: contactInfo,
        imageUrls: imageUrls,
        status: status,
        userId: userId
      };

      try {
        const responseData = await window.Api.saveAdvertisement(advertisement, this.$adIdToEdit);

        // Explicitly blur the save button before hiding the modal to prevent focus retention issues.
        if (document.activeElement) {
          document.activeElement.blur();
        }

        this.adModalInstance.hide(); // Hide the modal

        if (this.$adIdToEdit) {
          window.EventBus.emit('advertisement:updated', responseData);
          window.showUserFeedback('Advertisement updated successfully!', 'success');
        } else {
          window.EventBus.emit('advertisement:added', responseData);
          window.showUserFeedback('Advertisement added successfully!', 'success');
        }
      } catch (error) {
        console.error('Failed to save advertisement: ', error);
        window.showUserFeedback('Failed to save advertisement. Please try again later.', 'danger');
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

    // Removed the duplicate event listener for .edit-button from here.
    // This is now handled solely by advertisement_list.js
    // $(document).on('click', '.edit-button', function() {
    //   const adId = $(this).data('id');
    //   advertisementModal.openModalForEdit(adId, this);
    // });

    // Expose public methods globally if other modules need to access them
    window.openAdModalForAdd = advertisementModal.openModalForAdd.bind(advertisementModal);
    window.openAdModalForEdit = advertisementModal.openModalForEdit.bind(advertisementModal);
  });
})();
