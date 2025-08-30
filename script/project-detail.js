const params = new URLSearchParams(window.location.search);
const title = params.get("title");
const file = params.get("file");


// Configure marked options for better rendering
marked.setOptions({
    breaks: true,
    gfm: true
});

async function loadprojectContent() {
    const contentEl = document.getElementById("content");

    if (!file) {
        contentEl.innerHTML = `
          <div class="no-project-state">
            <h2>No project Selected</h2>
            <p>Please select a project post to read.</p>
            <br>
            <a href="projects-list.html" class="nav-item primary">Browse All projects</a>
          </div>
        `;
        return;
    }

    try {
        const response = await fetch("projects/" + encodeURIComponent(title) + "/" + file);

        if (!response.ok) {
            throw new Error(`project not found (${response.status})`);
        }

        const markdown = await response.text();
        const htmlContent = marked.parse(markdown);

        contentEl.innerHTML = htmlContent;

        // Update page title with project title if h1 exists
        const firstH1 = contentEl.querySelector('h1');
        // if (firstH1) {
        //   document.title = `${firstH1.textContent} | project`;
        //   document.querySelector('.project-title').textContent = firstH1.textContent;
        // }

        if (firstH1) {
            document.title = `${firstH1.textContent} | project`;
            const titleEl = document.querySelector('.project-title');
            if (titleEl) {
                titleEl.textContent = firstH1.textContent;
            }
        }


    } catch (error) {
        console.error('Error loading project:', error);
        contentEl.innerHTML = `
          <div class="error-state">
            <h2>Unable to Load project</h2>
            <p>The requested project post could not be found or loaded.</p>
            <p><strong>Error:</strong> ${error.message}</p>
            <br>
            <a href="projects-list.html" class="nav-item primary">Browse Available projects</a>
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
    loadprojectContent();
    window.addEventListener('scroll', handleScroll);

    // Setup smooth scrolling after content loads
    setTimeout(setupSmoothScrolling, 500);
});