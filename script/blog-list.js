let allBlogs = [];
let filteredBlogs = [];

function createBlogCard(blog) {
    const blogCard = document.createElement('div');
    blogCard.className = 'blog-card';
    blogCard.setAttribute('data-title', blog.title.toLowerCase());

    blogCard.innerHTML = `
        <a href="blog.html?title=${encodeURIComponent(blog.title)}&file=${encodeURIComponent(blog.file)}" class="blog-title-link">
          <h2 class="blog-title-text">${blog.title}</h2>
        </a>

        <p class="blog-excerpt">Click to read the full blog post...</p>
        <div class="blog-meta">
          <div class="blog-date">${formatDate(blog.date)}</div>
          <a href="blog.html?title=${encodeURIComponent(blog.title)}&file=${encodeURIComponent(blog.file)}" class="read-more">
            Read More <span>→</span>
          </a>
        </div>
      `;

    return blogCard;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString; // Return original if parsing fails
    }
}

function renderBlogs(blogs) {
    const blogListContainer = document.getElementById('blog-list');
    blogListContainer.innerHTML = '';

    if (blogs.length === 0) {
        const searchTerm = document.getElementById('search-input').value;
        if (searchTerm) {
            blogListContainer.innerHTML = `
            <div class="empty-state">
              <h2>No Results Found</h2>
              <p>No blog posts match your search for "${searchTerm}"</p>
              <p>Try different keywords or browse all posts below.</p>
            </div>
          `;
        } else {
            blogListContainer.innerHTML = `
            <div class="empty-state">
              <h2>No Blog Posts Yet</h2>
              <p>Stay tuned for upcoming content!</p>
            </div>
          `;
        }
        return;
    }

    blogs.forEach(blog => {
        const blogCard = createBlogCard(blog);
        blogListContainer.appendChild(blogCard);
    });
}

function updateStats(blogs) {
    document.getElementById('total-posts').textContent = blogs.length;
    document.getElementById('topics-covered').textContent = blogs.length > 0 ? '∞' : '0';
}

function filterBlogs() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    if (!searchTerm) {
        filteredBlogs = [...allBlogs];
    } else {
        filteredBlogs = allBlogs.filter(blog => {
            const titleMatch = blog.title.toLowerCase().includes(searchTerm);
            return titleMatch;
        });
    }

    renderBlogs(filteredBlogs);
}

async function loadBlogs() {
    try {
        const response = await fetch("blogs.json");
        if (!response.ok) {
            throw new Error(`Failed to load blogs.json (${response.status})`);
        }

        const blogs = await response.json();

        // Sort blogs by date (newest first)
        allBlogs = blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        filteredBlogs = [...allBlogs];

        updateStats(allBlogs);
        renderBlogs(filteredBlogs);

    } catch (error) {
        console.error('Error loading blogs:', error);
        document.getElementById('blog-list').innerHTML = `
          <div class="error-state">
            <h2>Unable to Load Blogs</h2>
            <p>There was an error loading the blog posts.</p>
            <p><strong>Error:</strong> ${error.message}</p>
            <p>Please ensure the blogs.json file exists and is properly formatted.</p>
          </div>
        `;
    }
}

// Add smooth scrolling and search functionality
document.addEventListener('DOMContentLoaded', function () {
    loadBlogs();

    // Focus search on '/' key press
    document.addEventListener('keydown', function (e) {
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
    });
});