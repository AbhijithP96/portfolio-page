/**
 * Dynamic Project Loader with Hover Popup
 * This script dynamically loads projects from a JSON file and creates interactive project cards
 * with hover functionality to show expanded descriptions.
 */

class ProjectManager {
    constructor() {
        this.projects = [];
        this.projectContainer = null;
        this.modal = null;
        this.initialize();
    }

    async initialize() {
        await this.createModal();
        await this.loadProjects();
        this.setupEventListeners();
    }

    /**
     * Load projects from JSON file
     */
    async loadProjects() {
        try {
            const response = await fetch('/static/data/projects.json')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.projects = await response.json();
            this.renderProjects();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showErrorMessage('Failed to load projects. Please check if projects.json exists.');
        }
    }

    /**
     * Render projects in the existing project section
     */
    renderProjects() {
        // Find the existing project container
        const projectSection = document.querySelector('.flex.overflow-y-auto');
        if (!projectSection) {
            console.error('Project section not found');
            return;
        }

        // Find the inner container with project items
        this.projectContainer = projectSection.querySelector('.flex.items-stretch.p-4.gap-3');
        if (!this.projectContainer) {
            console.error('Project container not found');
            return;
        }

        // Clear existing projects (keep structure intact)
        this.projectContainer.innerHTML = '';

        // Add each project
        this.projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            this.projectContainer.appendChild(projectCard);
        });
    }

    /**
     * Create a project card element
     */
    createProjectCard(project, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'flex h-full flex-1 flex-col gap-4 rounded-xl bg-[#212121] shadow-[0_0_4px_rgba(0,0,0,0.1)] min-w-60 project-card';
        cardDiv.style.cursor = 'pointer';
        cardDiv.setAttribute('data-project-index', index);

        // Default image if none provided
        const imageUrl = project.image || 'https://via.placeholder.com/400x225/212121/ffffff?text=Project+Image';

        // Decide which button to render
        let buttonHTML = '';
        if (project.github) {
            buttonHTML = `
                <button class="github-btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#303030] text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors duration-300 hover:bg-[#404040]">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"></path>
                    </svg>
                    <span class="truncate">View on GitHub</span>
                </button>`;
        } else if (project.huggingface || project.hugging_face) {
            buttonHTML = `
                <button class="huggingface-btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#303030] text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors duration-300 hover:bg-[#404040]">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v-.07zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                    <span class="truncate">View on Hugging Face</span>
                </button>`;
        }

        cardDiv.innerHTML = `
            <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex flex-col transition-transform duration-300 hover:scale-105"
                 style="background-image: url('${imageUrl}');">
            </div>
            <div class="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
                <p class="text-white text-base font-medium leading-normal">${project.title}</p>
                ${buttonHTML}
            </div>
        `;

        return cardDiv;
    }

    /**
     * Create modal for project details
     */
    async createModal() {
        const modalHTML = `
            <div id="project-modal" class="fixed inset-0 bg-black bg-opacity-50 z-[9999] hidden items-center justify-center p-4">
                <div class="bg-[#212121] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <h3 id="modal-title" class="text-white text-xl font-bold"></h3>
                            <button id="modal-close" class="text-[#ababab] hover:text-white text-2xl leading-none">×</button>
                        </div>
                        <div id="modal-image" class="w-full h-48 bg-center bg-no-repeat bg-cover rounded-xl mb-4"></div>
                        <div id="modal-description" class="text-[#ababab] text-sm leading-relaxed mb-6"></div>
                        <div id="modal-github" class="hidden">
                            <a id="modal-github-link" target="_blank" class="inline-flex items-center justify-center px-6 py-3 bg-[#303030] text-white text-sm font-bold rounded-full hover:bg-[#404040] transition-colors duration-300">
                                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"></path>
                                </svg>
                                View on GitHub
                            </a>
                        </div>
                        <div id="modal-huggingface" class="hidden">
                            <a id="modal-huggingface-link" target="_blank" class="inline-flex items-center justify-center px-6 py-3 bg-[#303030] text-white text-sm font-bold rounded-full hover:bg-[#404040] transition-colors duration-300">
                                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v-.07zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                </svg>
                                View on Hugging Face
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('project-modal');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Project card hover and click events
        document.addEventListener('click', (e) => {
            const projectCard = e.target.closest('.project-card');
            if (projectCard) {
                const index = projectCard.getAttribute('data-project-index');
                this.showProjectModal(this.projects[index]);
                return;
            }

            // GitHub button click
            const githubBtn = e.target.closest('.github-btn');
            if (githubBtn) {
                e.stopPropagation();
                const projectCard = githubBtn.closest('.project-card');
                const index = projectCard.getAttribute('data-project-index');
                const project = this.projects[index];
                if (project.github) {
                    window.open(project.github, '_blank');
                }
                return;
            }

            // Hugging Face button click
            const huggingfaceBtn = e.target.closest('.huggingface-btn');
            if (huggingfaceBtn) {
                e.stopPropagation();
                const projectCard = huggingfaceBtn.closest('.project-card');
                const index = projectCard.getAttribute('data-project-index');
                const project = this.projects[index];
                const hfLink = project.huggingface || project.hugging_face;
                if (hfLink) {
                    window.open(hfLink, '_blank');
                }
                return;
            }

            // Modal close button
            if (e.target.id === 'modal-close' || e.target.id === 'project-modal') {
                this.hideProjectModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
                this.hideProjectModal();
            }
        });

        // Prevent modal close when clicking inside modal content
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bg-\\[\\#212121\\].rounded-xl')) {
                e.stopPropagation();
            }
        });
    }

    /**
     * Show project modal with details
     */
    showProjectModal(project) {
        if (!this.modal) return;

        const modalTitle = document.getElementById('modal-title');
        const modalImage = document.getElementById('modal-image');
        const modalDescription = document.getElementById('modal-description');
        const modalGithub = document.getElementById('modal-github');
        const modalGithubLink = document.getElementById('modal-github-link');
        const modalHuggingface = document.getElementById('modal-huggingface');
        const modalHuggingfaceLink = document.getElementById('modal-huggingface-link');

        modalTitle.textContent = project.title;
        modalImage.style.backgroundImage = `url('${project.image || 'https://via.placeholder.com/400x225/212121/ffffff?text=Project+Image'}')`;
        modalDescription.textContent = project.description;

        // Handle GitHub link
        if (project.github) {
            modalGithub.classList.remove('hidden');
            modalGithubLink.href = project.github;
        } else {
            modalGithub.classList.add('hidden');
        }

        // Handle Hugging Face link
        const hfLink = project.huggingface || project.hugging_face;
        if (hfLink) {
            modalHuggingface.classList.remove('hidden');
            modalHuggingfaceLink.href = hfLink;
        } else {
            modalHuggingface.classList.add('hidden');
        }

        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide project modal
     */
    hideProjectModal() {
        if (!this.modal) return;

        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
        document.body.style.overflow = '';
    }

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        console.error(message);

        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-400 text-sm p-4 bg-red-900/20 rounded-xl border border-red-500/30 m-4';
        errorDiv.textContent = message;

        // Find project section and show error
        const projectSection = document.querySelector('.flex.overflow-y-auto');
        if (projectSection) {
            projectSection.appendChild(errorDiv);
        }
    }

    /**
     * Add a new project programmatically
     */
    addProject(project) {
        this.projects.push(project);
        this.renderProjects();
    }

    /**
     * Remove a project by index
     */
    removeProject(index) {
        if (index >= 0 && index < this.projects.length) {
            this.projects.splice(index, 1);
            this.renderProjects();
        }
    }

    /**
     * Refresh projects from JSON file
     */
    async refreshProjects() {
        await this.loadProjects();
    }
}

// Enhanced scroll behavior for project container
function enhanceProjectScroll() {
    const projectContainer = document.querySelector('.flex.overflow-y-auto');
    if (!projectContainer) return;

    // Add smooth scrolling
    projectContainer.style.scrollBehavior = 'smooth';

    // Find the contact section to place scroll buttons before it
    const contactSection = document.getElementById('contact');
    if (!contactSection) {
        console.error('Contact section not found');
        return;
    }

    // Remove any existing scroll indicators to prevent duplicates
    const existingIndicators = document.getElementById('project-scroll-indicators');
    if (existingIndicators) {
        existingIndicators.remove();
    }

    // Create scroll indicators container
    const scrollIndicators = document.createElement('div');
    scrollIndicators.id = 'project-scroll-indicators';
    scrollIndicators.className = 'flex justify-center py-6 gap-1';
    scrollIndicators.innerHTML = `
        <button id="scroll-left" class="text-[#ababab] hover:text-white transition-colors p-2 rounded-full hover:bg-[#303030]">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"></path>
            </svg>
        </button>
        <button id="scroll-right" class="text-[#ababab] hover:text-white transition-colors p-2 rounded-full hover:bg-[#303030]">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"></path>
            </svg>
        </button>
    `;

    // Insert scroll indicators before the contact section
    contactSection.parentNode.insertBefore(scrollIndicators, contactSection);

    // Add scroll functionality
    document.getElementById('scroll-left').addEventListener('click', () => {
        projectContainer.scrollBy({ left: -300, behavior: 'smooth' });
    });

    document.getElementById('scroll-right').addEventListener('click', () => {
        projectContainer.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize project manager
    window.projectManager = new ProjectManager();

    // Enhance scroll behavior
    enhanceProjectScroll();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectManager;
}