// API endpoints
const API_URL = window.APP_CONFIG.API_URL;
const AUTH_ENDPOINTS = {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    validate: `${API_URL}/auth/validate` // Add endpoint for token validation
};
const POSTS_ENDPOINTS = {
    base: `${API_URL}/posts`,
    single: (id) => `${API_URL}/posts/${id}`
};

// DOM Elements
const elements = {
    loginSection: document.getElementById('loginSection'),
    registerSection: document.getElementById('registerSection'),
    dashboard: document.getElementById('dashboard'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    userDisplay: document.getElementById('userDisplay'),
    logoutBtn: document.getElementById('logoutBtn'),
    postsList: document.getElementById('postsList'),
    newPostBtn: document.getElementById('newPostBtn'),
    postModal: document.getElementById('postModal'),
    postForm: document.getElementById('postForm'),
    closeModal: document.getElementById('closeModal'),
    cancelPost: document.getElementById('cancelPost'),
    modalTitle: document.getElementById('modalTitle'),
    authSection: document.getElementById('authSection'),
    dashboardSection: document.getElementById('dashboardSection'),
    errorContainer: document.getElementById('errorContainer'),
    userInfo: document.getElementById('userInfo')
};

// State management
let currentUser = null;
let currentPost = null;

// Authentication functions
async function validateToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }

    try {
        const response = await fetch(AUTH_ENDPOINTS.validate, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            return false;
        }

        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
    }
}

async function login(email, password) {
    try {
        const response = await fetch(AUTH_ENDPOINTS.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        showDashboard();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

async function register(username, email, password) {
    try {
        const response = await fetch(AUTH_ENDPOINTS.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        alert('Registration successful! Please login.');
        showLoginForm();
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    showAuth();
}

// UI functions
function showLoginForm() {
    elements.loginSection.classList.remove('hidden');
    elements.registerSection.classList.add('hidden');
    elements.dashboard.classList.add('hidden');
    elements.postModal.classList.add('hidden');
}

function showRegisterForm() {
    elements.loginSection.classList.add('hidden');
    elements.registerSection.classList.remove('hidden');
    elements.dashboard.classList.add('hidden');
    elements.postModal.classList.add('hidden');
}

function showAuth() {
    if (elements.authSection) elements.authSection.style.display = 'block';
    if (elements.dashboardSection) elements.dashboardSection.style.display = 'none';
}

function showDashboard() {
    if (!currentUser) {
        showAuth();
        return;
    }
    elements.loginSection.classList.add('hidden');
    elements.registerSection.classList.add('hidden');
    elements.dashboard.classList.remove('hidden');
    elements.userDisplay.textContent = `Welcome, ${currentUser.username}!`;
    fetchPosts();
}

// Posts functions
async function fetchPosts() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(POSTS_ENDPOINTS.base, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to fetch posts');
        }

        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        alert('Error fetching posts: ' + error.message);
    }
}

function displayPosts(posts) {
    elements.postsList.innerHTML = '';
    posts.forEach(post => {
        const postElement = createPostElement(post);
        elements.postsList.appendChild(postElement);
    });
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${escapeHTML(post.title)}</h3>
            <span class="status-badge status-${post.status}">${post.status}</span>
        </div>
        <div class="post-meta">
            <p>By ${escapeHTML(post.author_name)} on ${new Date(post.created_at).toLocaleDateString()}</p>
        </div>
        <div class="post-content">
            <p>${escapeHTML(post.content.substring(0, 150))}...</p>
        </div>
        <div class="post-actions">
            <button onclick="editPost(${post.id})" class="secondary-btn">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button onclick="deletePost(${post.id})" class="secondary-btn">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return div;
}

async function createPost(title, content, status) {
    try {
        const response = await fetch(POSTS_ENDPOINTS.base, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, content, status })
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to create post');
        }

        closeModal();
        fetchPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post: ' + error.message);
    }
}

async function updatePost(id, title, content, status) {
    try {
        const response = await fetch(POSTS_ENDPOINTS.single(id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, content, status })
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to update post');
        }

        closeModal();
        fetchPosts();
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Error updating post: ' + error.message);
    }
}

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        const response = await fetch(POSTS_ENDPOINTS.single(id), {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to delete post');
        }

        fetchPosts();
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post: ' + error.message);
    }
}

async function editPost(id) {
    try {
        const response = await fetch(POSTS_ENDPOINTS.single(id), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to fetch post');
        }

        const post = await response.json();
        currentPost = post;
        
        elements.modalTitle.textContent = 'Edit Post';
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postContent').value = post.content;
        document.getElementById('postStatus').value = post.status;
        
        openModal();
    } catch (error) {
        console.error('Error fetching post:', error);
        alert('Error fetching post: ' + error.message);
    }
}

// Modal functions
function openModal() {
    elements.postModal.classList.remove('hidden');
}

function closeModal() {
    elements.postModal.classList.add('hidden');
    elements.postForm.reset();
    currentPost = null;
    elements.modalTitle.textContent = 'Create New Post';
}

// Utility functions
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Event listeners
document.addEventListener('DOMContentLoaded', initializeApp);
loginForm?.addEventListener('submit', handleLogin);
registerForm?.addEventListener('submit', handleRegister);
logoutBtn?.addEventListener('click', logout);
newPostBtn?.addEventListener('click', () => postModal.style.display = 'block');
closeModal?.addEventListener('click', closeModal);
postForm?.addEventListener('submit', handleCreatePost);

// Initialize app
async function initializeApp() {
    console.log('Initializing app...');
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const isValid = await validateToken();
            if (isValid) {
                await showDashboard();
            } else {
                showAuth();
            }
        } catch (error) {
            console.error('Error during initialization:', error);
            showAuth();
        }
    } else {
        showAuth();
    }
}

// Auth handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(AUTH_ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        await showDashboard();
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(AUTH_ENDPOINTS.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Auto-login after registration
        await handleLogin(new Event('submit'));
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message);
    }
}

// Post handlers
async function handleCreatePost(e) {
    e.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const status = document.getElementById('postStatus').value;
    const token = localStorage.getItem('token');

    console.log('Creating post:', { title, content, status });
    console.log('Using token:', token);

    try {
        const response = await fetch(POSTS_ENDPOINTS.base, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content, status })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create post');
        }

        postModal.style.display = 'none';
        postForm.reset();
        await fetchPosts();
    } catch (error) {
        console.error('Create post error:', error);
        showError(error.message);
    }
}

// Error handling
function showError(message) {
    if (!elements.errorContainer) return;
    
    elements.errorContainer.textContent = message;
    elements.errorContainer.style.display = 'block';
    setTimeout(() => {
        elements.errorContainer.style.display = 'none';
    }, 5000);
} 