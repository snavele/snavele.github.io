const params = new URLSearchParams(window.location.search);
const file = params.get("file");
const title = params.get("title");
console.log(title)


// Configure marked options for better rendering
marked.setOptions({
    breaks: true,
    gfm: true
});

async function loadBlogContent() {
    const contentEl = document.getElementById("content");

    if (!file) {
        contentEl.innerHTML = `
          <div class="no-blog-state">
            <h2>No Blog Selected</h2>
            <p>Please select a blog post to read.</p>
            <br>
            <a href="blog-list.html" class="nav-item primary">Browse All Blogs</a>
          </div>
        `;
        return;
    }

    try {
        const cleanTitle = decodeURIComponent(title);
        console.log(cleanTitle)
        const response = await fetch(`blogs/${cleanTitle}/${file}`);

        // const response = await fetch("blogs/" + title + "/" + file);

        if (!response.ok) {
            throw new Error(`Blog not found (${response.status})`);
        }

        const markdown = await response.text();
        const htmlContent = marked.parse(markdown);

        contentEl.innerHTML = htmlContent;


    } catch (error) {
        console.error('Error loading blog:', error);
        contentEl.innerHTML = `
          <div class="error-state">
            <h2>Unable to Load Blog</h2>
            <p>The requested blog post could not be found or loaded.</p>
            <p><strong>Error:</strong> ${error.message}</p>
            <br>
            <a href="blog-list.html" class="nav-item primary">Browse Available Blogs</a>
          </div>
        `;
    }
}

// Back to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide back to top button
function handleScroll() {
    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function () {
    loadBlogContent();
    window.addEventListener('scroll', handleScroll);

    // Setup smooth scrolling after content loads
    setTimeout(setupSmoothScrolling, 500);
});