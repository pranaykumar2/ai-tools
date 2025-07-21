// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('#contact-form');
    const submitBtn = document.querySelector('.submit-btn');
    const messageContainer = document.querySelector('#form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };

            // Basic client-side validation
            if (!data.name || !data.email || !data.message) {
                showMessage('Please fill in all fields.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Show loading state
            setLoadingState(true);

            try {
                // Send form data to server
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showMessage(result.message, 'success');
                    contactForm.reset();
                } else {
                    showMessage(result.message, 'error');
                }

            } catch (error) {
                console.error('Error sending form:', error);
                showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
            } finally {
                setLoadingState(false);
            }
        });
    }

    function showMessage(message, type) {
        if (!messageContainer) {
            // Create message container if it doesn't exist
            const container = document.createElement('div');
            container.id = 'form-message';
            container.className = `form-message ${type}`;
            container.textContent = message;
            contactForm.insertBefore(container, contactForm.firstChild);
        } else {
            messageContainer.className = `form-message ${type}`;
            messageContainer.textContent = message;
            messageContainer.style.display = 'block';
        }

        // Auto-hide message after 5 seconds
        setTimeout(() => {
            if (messageContainer) {
                messageContainer.style.display = 'none';
            }
        }, 5000);
    }

    function setLoadingState(loading) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message';
        }
    }
});

// Smooth scrolling for internal links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Navbar scroll effect (optional enhancement)
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    }
});

// Video error handling
document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('.hero-video');
    if (video) {
        video.addEventListener('error', function() {
            console.log('Video failed to load, showing fallback image');
            // The fallback image will automatically show due to HTML structure
        });
    }
});
