/**
 * AITools - Contribute Form JavaScript
 * Handles form submission and validation for new tool contributions
 * @version 1.0.0
 * @date 2025-07-22
 */

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM Elements
    const elements = {
        form: document.getElementById('contribute-form'),
        toolCategory: document.getElementById('tool-category'),
        otherCategoryGroup: document.getElementById('other-category-group'),
        otherCategory: document.getElementById('other-category'),
        tagsInput: document.getElementById('tool-tags'),
        tagsPreview: document.getElementById('tags-preview'),
        imageUploadArea: document.getElementById('image-upload-area'),
        imageInput: document.getElementById('tool-image'),
        imagePreview: document.getElementById('image-preview'),
        previewImg: document.getElementById('preview-img'),
        removeImageBtn: document.getElementById('remove-image'),
        imageUrl: document.getElementById('image-url'),
        cancelBtn: document.getElementById('cancel-btn'),
        submitBtn: document.getElementById('submit-btn'),
        successMessage: document.getElementById('success-message'),
        submitAnotherBtn: document.getElementById('submit-another-btn')
    };
    
    // Setup event listeners
    setupEventListeners();
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Category selection change
        elements.toolCategory.addEventListener('change', handleCategoryChange);
        
        // Tags input
        elements.tagsInput.addEventListener('input', handleTagsInput);
        elements.tagsInput.addEventListener('keydown', handleTagsKeydown);
        
        // Image upload
        elements.imageUploadArea.addEventListener('click', () => elements.imageInput.click());
        elements.imageUploadArea.addEventListener('dragover', handleDragOver);
        elements.imageUploadArea.addEventListener('drop', handleDrop);
        elements.imageInput.addEventListener('change', handleImageSelect);
        elements.removeImageBtn.addEventListener('click', removeImage);
        
        // Form buttons
        elements.cancelBtn.addEventListener('click', () => window.location.href = 'list-tools.html');
        elements.form.addEventListener('submit', handleFormSubmit);
        elements.submitAnotherBtn.addEventListener('click', resetForm);
    }
    
    /**
     * Handle category change
     */
    function handleCategoryChange() {
        const category = elements.toolCategory.value;
        
        // Show "Other" category input if "Other" is selected
        if (category === 'Other') {
            elements.otherCategoryGroup.style.display = 'block';
            elements.otherCategory.setAttribute('required', 'required');
        } else {
            elements.otherCategoryGroup.style.display = 'none';
            elements.otherCategory.removeAttribute('required');
        }
    }
    
    /**
     * Handle tags input
     */
    function handleTagsInput() {
        // If the input ends with a comma, create a tag
        if (elements.tagsInput.value.endsWith(',')) {
            const tagText = elements.tagsInput.value.slice(0, -1).trim();
            if (tagText) {
                addTag(tagText);
                elements.tagsInput.value = '';
            }
        }
    }
    
    /**
     * Handle keydown in tags input
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleTagsKeydown(e) {
        // If Enter is pressed, create a tag
        if (e.key === 'Enter') {
            e.preventDefault();
            const tagText = elements.tagsInput.value.trim();
            if (tagText) {
                addTag(tagText);
                elements.tagsInput.value = '';
            }
        }
    }
    
    /**
     * Add a tag to the preview
     * @param {string} text - Tag text
     */
    function addTag(text) {
        const tag = document.createElement('div');
        tag.className = 'tag-item';
        tag.innerHTML = `
            ${text}
            <span class="remove-tag material-icons-outlined">close</span>
        `;
        
        // Add click listener to remove tag
        tag.querySelector('.remove-tag').addEventListener('click', function() {
            tag.remove();
        });
        
        elements.tagsPreview.appendChild(tag);
    }
    
    /**
     * Handle drag over event for image upload
     * @param {DragEvent} e - Drag event
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.imageUploadArea.style.borderColor = 'var(--primary)';
        elements.imageUploadArea.style.backgroundColor = 'var(--primary-light)';
    }
    
    /**
     * Handle drop event for image upload
     * @param {DragEvent} e - Drop event
     */
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.imageUploadArea.style.borderColor = 'var(--border)';
        elements.imageUploadArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.match('image.*')) {
                elements.imageInput.files = e.dataTransfer.files;
                displayImagePreview(file);
            } else {
                alert('Please upload an image file (JPG, PNG, etc.)');
            }
        }
    }
    
    /**
     * Handle image selection from file input
     */
    function handleImageSelect() {
        if (elements.imageInput.files && elements.imageInput.files[0]) {
            const file = elements.imageInput.files[0];
            displayImagePreview(file);
        }
    }
    
    /**
     * Display image preview
     * @param {File} file - Image file
     */
    function displayImagePreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            elements.previewImg.src = e.target.result;
            elements.imagePreview.style.display = 'block';
            elements.imageUploadArea.style.display = 'none';
            
            // Clear image URL field since we're using an uploaded file
            elements.imageUrl.value = '';
        };
        
        reader.readAsDataURL(file);
    }
    
    /**
     * Remove the selected image
     */
    function removeImage() {
        elements.imagePreview.style.display = 'none';
        elements.imageUploadArea.style.display = 'block';
        elements.imageInput.value = '';
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Disable submit button and show loading state
        elements.submitBtn.disabled = true;
        elements.submitBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Submitting...';
        
        // Get form data
        const formData = new FormData(elements.form);
        
        // Add tags
        const tags = [];
        elements.tagsPreview.querySelectorAll('.tag-item').forEach(tag => {
            tags.push(tag.textContent.trim());
        });
        formData.set('tags', tags.join(','));
        
        // If "Other" category is selected, use the specified category
        if (formData.get('category') === 'Other') {
            formData.set('category', formData.get('otherCategory'));
        }
        
        // Convert checkbox array to array format
        const features = [];
        document.querySelectorAll('input[name="features"]:checked').forEach(checkbox => {
            features.push(checkbox.value);
        });
        formData.set('features', features.join(','));
        
        // Send data to server
        fetch('/api/tools', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            elements.form.style.display = 'none';
            elements.successMessage.style.display = 'block';
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your form. Please try again.');
            
            // Re-enable submit button
            elements.submitBtn.disabled = false;
            elements.submitBtn.innerHTML = '<span class="material-icons-outlined">add_circle</span> Submit Tool';
        });
    }
    
    /**
     * Validate the form
     * @returns {boolean} Is form valid
     */
    function validateForm() {
        // Check required fields
        const requiredFields = elements.form.querySelectorAll('[required]');
        for (const field of requiredFields) {
            if (!field.value.trim()) {
                alert('Please fill in all required fields');
                field.focus();
                return false;
            }
        }
        
        // Check if image is provided (either file or URL)
        if (!elements.imageInput.files[0] && !elements.imageUrl.value) {
            alert('Please provide either an image file or image URL');
            return false;
        }
        
        return true;
    }
    
    /**
     * Reset the form for submitting another tool
     */
    function resetForm() {
        // Reset form display
        elements.form.reset();
        elements.form.style.display = 'block';
        elements.successMessage.style.display = 'none';
        
        // Reset image preview
        elements.imagePreview.style.display = 'none';
        elements.imageUploadArea.style.display = 'block';
        
        // Reset tags
        elements.tagsPreview.innerHTML = '';
        
        // Reset category
        elements.otherCategoryGroup.style.display = 'none';
        
        // Reset submit button
        elements.submitBtn.disabled = false;
        elements.submitBtn.innerHTML = '<span class="material-icons-outlined">add_circle</span> Submit Tool';
        
        // Focus on first field
        document.getElementById('tool-name').focus();
    }
});