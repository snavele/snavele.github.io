let allProjects = [];
let currentFilter = 'all';

function formatDate(dateStr, endDateStr = null) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short' };

    if (endDateStr) {
        const endDate = new Date(endDateStr);
        const now = new Date();

        // If end date is in the future or very recent, show as "ongoing"
        if (endDate > now || (now - endDate) < 30 * 24 * 60 * 60 * 1000) {
            return `${date.toLocaleDateString('en-US', options)} - Present`;
        }

        return `${date.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }

    return date.toLocaleDateString('en-US', options);
}

function getProjectStatus(project) {
    if (!project.end_date) return 'ongoing';

    const endDate = new Date(project.end_date);
    const now = new Date();

    if (endDate > now) return 'ongoing';
    if ((now - endDate) < 30 * 24 * 60 * 60 * 1000) return 'completed';

    return 'completed';
}

function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.setAttribute('data-tech', project.tech_stack.join(',').toLowerCase());

    const status = getProjectStatus(project);
    const statusClass = `status-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    const techTags = project.tech_stack.map(tech =>
        `<span class="tech-tag">${tech}</span>`
    ).join('');

    const dateDisplay = formatDate(project.date, project.end_date);

    projectCard.innerHTML = `
                <div class="project-header">
                    <div>
                        <div class="project-title">${project.title}</div>
                        <div class="project-date">${dateDisplay}</div>
                    </div>
                    <div class="project-status ${statusClass}">${statusText}</div>
                </div>
                <div class="project-tech">${techTags}</div>
                <div class="project-description">${project.description || 'Click to learn more about this project'}</div>
                <div class="project-actions">
                    <a href="project-detail.html?title=${project.title}&file=${project.file}" class="btn-small">
                        View Details
                    </a>
                </div>
            `;

    // // Add click handler for the entire card
    // projectCard.onclick = () => {
    //     window.location.href = `project-detail.html?project=${encodeURIComponent(project.file.replace('.md', ''))}`;
    // };

    return projectCard;
}

function createFilters(projects) {
    const filtersContainer = document.getElementById('filters-container');
    const techStacks = new Set();

    // Collect all unique technologies
    projects.forEach(project => {
        project.tech_stack.forEach(tech => techStacks.add(tech));
    });

    // Create filter buttons
    filtersContainer.innerHTML = `
                <div class="filter-btn active" data-filter="all">All Projects</div>
                ${Array.from(techStacks).map(tech =>
        `<div class="filter-btn" data-filter="${tech.toLowerCase()}">${tech}</div>`
    ).join('')}
            `;

    // Add event listeners
    filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            setFilter(filter);

            // Update active button
            filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function setFilter(filter) {
    currentFilter = filter;
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const cardTech = card.getAttribute('data-tech').toLowerCase();
        const shouldShow = filter === 'all' || cardTech.includes(filter);

        if (shouldShow) {
            card.style.display = 'block';
            card.style.animation = 'project-fade-in 0.5s ease-in-out forwards';
        } else {
            card.style.display = 'none';
        }
    });
}

function renderProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');

    if (!projects || projects.length === 0) {
        projectsGrid.innerHTML = '<div class="no-projects">No projects found</div>';
        return;
    }

    projectsGrid.innerHTML = '';

    // Sort projects by date (newest first)
    const sortedProjects = projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedProjects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });

    // Create filters based on projects
    createFilters(projects);
}

async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');

        if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.projects || !Array.isArray(data.projects)) {
            throw new Error('Invalid projects data structure');
        }

        allProjects = data.projects;
        renderProjects(allProjects);

    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('projects-grid').innerHTML = `
                    <div class="error-message">
                        Unable to load projects. Please ensure data/projects.json exists with proper structure.
                    </div>
                `;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadProjects();
});