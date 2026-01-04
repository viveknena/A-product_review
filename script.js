// Common JavaScript for all pages

// Star Rating System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize star ratings if they exist
    const stars = document.querySelectorAll('.star');
    if (stars.length > 0) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                setRating(value);
            });
            
            star.addEventListener('mouseover', function() {
                const value = parseInt(this.getAttribute('data-value'));
                highlightStars(value);
            });
            
            star.addEventListener('mouseout', function() {
                const currentRating = parseInt(document.getElementById('rating').value) || 0;
                highlightStars(currentRating);
            });
        });
    }
    
    // Photo upload preview
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('photoPreview');
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            loginUser();
        });
    }
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerUser();
        });
    }
    
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReview();
        });
    }
});

// Rating Functions
function setRating(value) {
    document.getElementById('rating').value = value;
    highlightStars(value);
}

function highlightStars(value) {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        const starValue = parseInt(star.getAttribute('data-value'));
        if (starValue <= value) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

// Chatbot Functions
function toggleChatbot() {
    const chatbot = document.getElementById('chatbot');
    chatbot.style.display = chatbot.style.display === 'block' ? 'none' : 'block';
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatBody = document.getElementById('chatbotBody');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chatbot-message';
    userMsg.style.background = '#667eea';
    userMsg.style.color = 'white';
    userMsg.style.marginLeft = 'auto';
    userMsg.textContent = message;
    chatBody.appendChild(userMsg);
    
    input.value = '';
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chatbot-message';
    typingIndicator.textContent = 'Assistant is typing...';
    typingIndicator.style.fontStyle = 'italic';
    chatBody.appendChild(typingIndicator);
    
    chatBody.scrollTop = chatBody.scrollHeight;
    
    try {
        // Call backend AI chatbot
        const response = await fetch('http://localhost:5000/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        chatBody.removeChild(typingIndicator);
        
        // Add AI response
        const aiMsg = document.createElement('div');
        aiMsg.className = 'chatbot-message';
        aiMsg.textContent = data.response;
        chatBody.appendChild(aiMsg);
        
    } catch (error) {
        chatBody.removeChild(typingIndicator);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chatbot-message';
        errorMsg.textContent = "I'm having trouble connecting. Please try again later.";
        errorMsg.style.color = '#dc3545';
        chatBody.appendChild(errorMsg);
    }
    
    chatBody.scrollTop = chatBody.scrollHeight;
}

// User Authentication Functions
async function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            window.location.href = 'dashboard.html';
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        alert('Connection error. Please try again.');
    }
}

async function registerUser() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        alert('Connection error. Please try again.');
    }
}

async function submitReview() {
    const productName = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value;
    const rating = document.getElementById('rating').value;
    const title = document.getElementById('reviewTitle').value;
    const reviewText = document.getElementById('reviewText').value;
    
    if (rating === '0') {
        alert('Please select a rating');
        return;
    }
    
    const photoInput = document.getElementById('photoInput');
    let photoUrl = '';
    
    if (photoInput.files.length > 0) {
        // In production, you would upload this to a cloud storage service
        photoUrl = 'uploaded/' + photoInput.files[0].name;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            window.location.href = 'login.html';
            return;
        }
        
        const response = await fetch('http://localhost:5000/api/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                productName,
                category,
                description,
                rating,
                title,
                reviewText,
                photoUrl
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Review submitted successfully!');
            window.location.href = 'dashboard.html';
        } else {
            alert(data.error || 'Submission failed');
        }
    } catch (error) {
        alert('Connection error. Please try again.');
    }
}

async function generateAIReview() {
    const productName = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value;
    const rating = document.getElementById('rating').value;
    
    if (!productName || !category || !description) {
        alert('Please fill in product details first');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/generate-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productName,
                category,
                description,
                rating: rating || 5
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('reviewTitle').value = data.title;
            document.getElementById('reviewText').value = data.review;
            
            // Add AI suggestions to chatbot
            const chatBody = document.getElementById('chatbotBody');
            const suggestion = document.createElement('div');
            suggestion.className = 'chatbot-message';
            suggestion.textContent = "I've generated a review suggestion for you! You can ask me to make adjustments.";
            chatBody.appendChild(suggestion);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    } catch (error) {
        alert('Could not generate AI review. Please try again.');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}