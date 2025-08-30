let subtitles = [];
let currentSubtitleIndex = 0;
let isTyping = false;

function typeText(element, text, speed = 100) {
    return new Promise((resolve) => {
        element.textContent = '';
        let i = 0;

        function typeChar() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            } else {
                resolve();
            }
        }

        typeChar();
    });
}

function eraseText(element, speed = 50) {
    return new Promise((resolve) => {
        const text = element.textContent;
        let i = text.length;

        function eraseChar() {
            if (i > 0) {
                element.textContent = text.substring(0, i - 1);
                i--;
                setTimeout(eraseChar, speed);
            } else {
                resolve();
            }
        }

        eraseChar();
    });
}

async function animateSubtitle() {
    if (subtitles.length === 0) return;

    const subtitleElement = document.getElementById('subtitle');
    const currentText = subtitles[currentSubtitleIndex];

    isTyping = true;

    // Type the current subtitle
    await typeText(subtitleElement, currentText, 80);

    // Pause for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Erase the current subtitle
    await eraseText(subtitleElement, 60);

    // Move to next subtitle
    currentSubtitleIndex = (currentSubtitleIndex + 1) % subtitles.length;

    isTyping = false;

    // Pause for 500ms before next subtitle
    setTimeout(animateSubtitle, 500);
}

function loadSubtitles(subtitleData) {
    subtitles = subtitleData.subtitles;
    if (subtitles.length > 0) {
        // Start the subtitle animation
        animateSubtitle();
    }
}

function loadAboutContent(aboutData) {
    const aboutContainer = document.getElementById('about-content');
    aboutContainer.innerHTML = '';

    aboutData.paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.className = 'about-text';
        p.textContent = paragraph;
        aboutContainer.appendChild(p);
    });
}

function formatDate(dateStr, endDateStr = null) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short' };

    if (endDateStr) {
        const endDate = new Date(endDateStr);
        return `${date.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }

    return date.toLocaleDateString('en-US', options);
}

function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.onclick = () => window.location.href = `project-detail.html?project=${encodeURIComponent(project.file.replace('.md', ''))}`;

    const techTags = project.tech_stack.map(tech =>
        `<span class="tech-tag">${tech}</span>`
    ).join('');

    const dateDisplay = formatDate(project.date, project.end_date);

    projectCard.innerHTML = `
    <div class="project-title">${project.title}</div>
    <div class="project-date">${dateDisplay}</div>
    <div class="project-tech">${techTags}</div>
    <div class="project-description">${project.description || 'Click to learn more about this project'}</div>
    <div class="project-actions">
        <a href="project-detail.html?title=${project.title}&file=${project.file}" class="btn-small">
            View Details
        </a>
    </div>
`;

    return projectCard;
}

function loadProjects(projectsData) {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '';

    // Check if projectsData and projects array exist
    if (!projectsData || !projectsData.projects || !Array.isArray(projectsData.projects)) {
        projectsContainer.innerHTML = '<div class="error-message">No projects data available</div>';
        return;
    }

    // Show only first 5 projects on main page
    const featuredProjects = projectsData.projects.slice(0, 5);

    if (featuredProjects.length === 0) {
        projectsContainer.innerHTML = '<div class="error-message">No projects found</div>';
        return;
    }

    featuredProjects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsContainer.appendChild(projectCard);
    });
}

function createSkillItem(skill) {
    const skillItem = document.createElement('div');
    skillItem.className = 'skill-item';
    skillItem.setAttribute('data-level', skill.level);

    const strokeOffset = 314 - (314 * skill.percentage / 100);

    skillItem.innerHTML = `
    <div class="circular-progress">
        <svg class="progress-ring">
            <circle class="progress-ring-background" cx="60" cy="60" r="50"></circle>
            <circle class="progress-ring-fill" cx="60" cy="60" r="50" style="stroke-dashoffset: ${strokeOffset};"></circle>
        </svg>
        <div class="progress-text">${skill.percentage}%</div>
    </div>
    <div class="skill-name">${skill.name}</div>
    <div class="skill-level">${skill.level}</div>
`;

    return skillItem;
}

function createTimelineItem(item, index) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';

    // Alternate between top and bottom positioning
    const position = index % 2 === 0 ? 'top' : 'bottom';

    timelineItem.innerHTML = `
    <div class="timeline-content ${position} category-${item.category}">
        <div class="timeline-year">${item.year}</div>
        <div class="timeline-description">${item.description}</div>
    </div>
    <div class="timeline-dot" onclick="toggleTimelineCard(${index})">
        <div class="timeline-icon">${item.icon}</div>
        <div class="timeline-year-display">${item.year}</div>
    </div>
`;

    return timelineItem;
}

function toggleTimelineCard(index) {
    const allItems = document.querySelectorAll('.timeline-item');
    const allContents = document.querySelectorAll('.timeline-content');
    const allDots = document.querySelectorAll('.timeline-dot');

    const clickedContent = allItems[index].querySelector('.timeline-content');
    const clickedDot = allItems[index].querySelector('.timeline-dot');

    // Check if clicked item is already active
    const isCurrentlyActive = clickedContent.classList.contains('active');

    // Hide all cards and remove active state
    allContents.forEach(content => content.classList.remove('active'));
    allDots.forEach(dot => dot.classList.remove('active'));

    // If it wasn't active, show it (toggle behavior)
    if (!isCurrentlyActive) {
        clickedContent.classList.add('active');
        clickedDot.classList.add('active');
    }
}

function loadTimeline(timelineData) {
    const timelineContainer = document.getElementById('timeline-container');
    timelineContainer.innerHTML = '<div class="timeline-line"></div>';

    timelineData.timeline.forEach((item, index) => {
        const timelineItem = createTimelineItem(item, index);
        timelineContainer.appendChild(timelineItem);
    });
}

function loadSkills(skillsData) {
    const skillsContainer = document.getElementById('skills-container');
    skillsContainer.innerHTML = '';

    skillsData.skills.forEach(skill => {
        const skillItem = createSkillItem(skill);
        skillsContainer.appendChild(skillItem);
    });
}

async function loadData() {
    try {
        // Load subtitles
        const subtitleResponse = await fetch('data/subtitles.json');
        if (!subtitleResponse.ok) {
            throw new Error(`Failed to load subtitles.json: ${subtitleResponse.status}`);
        }
        const subtitleData = await subtitleResponse.json();
        loadSubtitles(subtitleData);

        const aboutResponse = await fetch('data/about.json');
        if (!aboutResponse.ok) {
            throw new Error(`Failed to load about.json: ${aboutResponse.status}`);
        }
        const aboutData = await aboutResponse.json();

        const skillsResponse = await fetch('data/skills.json');
        if (!skillsResponse.ok) {
            throw new Error(`Failed to load skills.json: ${skillsResponse.status}`);
        }
        const skillsData = await skillsResponse.json();

        const timelineResponse = await fetch('data/timeline.json');
        if (!timelineResponse.ok) {
            throw new Error(`Failed to load timeline.json: ${timelineResponse.status}`);
        }
        const timelineData = await timelineResponse.json();

        const projectsResponse = await fetch('data/projects.json');
        if (!projectsResponse.ok) {
            throw new Error(`Failed to load projects.json: ${projectsResponse.status}`);
        }
        const projectsData = await projectsResponse.json();

        loadAboutContent(aboutData);
        loadSkills(skillsData);
        loadTimeline(timelineData);
        loadProjects(projectsData);

    } catch (error) {
        console.error('Error loading data:', error);

        // Fallback subtitle if JSON fails to load
        const subtitleElement = document.getElementById('subtitle');
        subtitleElement.textContent = 'Generative AI Developer | Data Engineer | Cloud';

        document.getElementById('about-content').innerHTML = `
        <div class="error-message">
            Unable to load content. Please ensure data files exist.
        </div>
    `;

        document.getElementById('skills-container').innerHTML = `
        <div class="error-message">
            Unable to load skills. Please ensure data/skills.json exists.
        </div>
    `;

        document.getElementById('timeline-container').innerHTML = `
        <div class="error-message">
            Unable to load timeline. Please ensure data/timeline.json exists.
        </div>
    `;

        document.getElementById('projects-container').innerHTML = `
        <div class="error-message">
            Unable to load projects. Please ensure data/projects.json exists.
        </div>
    `;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadData();
});