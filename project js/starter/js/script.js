document.addEventListener('DOMContentLoaded', () => {
    let aboutMeData = {};
    let projectsData = [];
    let currentSpotlightProject = null;
    
    const aboutMeContainer = document.querySelector('#aboutMe');
    const projectsList = document.querySelector('#projectList');
    const spotlightImage = document.querySelector('#projectSpotlight');
    const spotlightTitles = document.querySelector('#spotlightTitles');
    const scrollPrevBtn = document.querySelector('.arrow-left');
    const scrollNextBtn = document.querySelector('.arrow-right');
    const contactForm = document.getElementById('formSection');
    const messageTextarea = document.getElementById('contactMessage');
    const charRemaining = document.getElementById('charactersLeft');
    
    const MAX_MESSAGE_LENGTH = 300;
    const PLACEHOLDER_CARD_IMAGE = 'starter/images/card_placeholder_bg.webp';
    const PLACEHOLDER_SPOTLIGHT_IMAGE = 'starter/images/spotlight_placeholder_bg.webp';
    
    async function fetchData() {
        try {
            document.body.style.cursor = 'wait';
            
            const [aboutResponse, projectsResponse] = await Promise.all([
                fetch('starter/data/aboutMeData.json'),
                fetch('starter/data/projectsData.json')
            ]);
            
            if (!aboutResponse.ok || !projectsResponse.ok) {
                throw new Error('Failed to fetch data');
            }
            
            aboutMeData = await aboutResponse.json();
            projectsData = await projectsResponse.json();
            
            initPage();
        } catch (error) {
            console.error('Error fetching data:', error);
            aboutMeContainer.innerHTML = '<p>Failed to load content. Please try again later.</p>';
            projectsList.innerHTML = '<p>Failed to load projects. Please try again later.</p>';
        } finally {
            document.body.style.cursor = '';
        }
    }
    
    function initPage() {
        populateAboutSection();
        populateProjectsSection();
        setupEventListeners();
    }
    
    function populateAboutSection() {
        aboutMeContainer.innerHTML = '';
        
        const bio = document.createElement('p');
        bio.textContent = aboutMeData.aboutMe || 'No bio available';
        aboutMeContainer.appendChild(bio);
        
        if (aboutMeData.headshot) {
            const photoContainer = document.createElement('div');
            photoContainer.className = 'headshotContainer';
            
            const img = document.createElement('img');
            img.src = aboutMeData.headshot;
            img.alt = 'Profile photo';
            img.onerror = () => {
                photoContainer.innerHTML = '<p>Profile photo not available</p>';
            };
            
            photoContainer.appendChild(img);
            aboutMeContainer.appendChild(photoContainer);
        }
    }
    
    function populateProjectsSection() {
        projectsList.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        
        projectsData.forEach(project => {
            const projectCard = createProjectCard(project);
            fragment.appendChild(projectCard);
        });
        
        projectsList.appendChild(fragment);
        
        if (projectsData.length > 0) {
            updateSpotlight(projectsData[0]);
            currentSpotlightProject = projectsData[0];
        }
    }
    
    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'projectCard';
        card.id = project.project_id;
        card.dataset.projectId = project.project_id;
        
        const cardBgImage = project.card_image || PLACEHOLDER_CARD_IMAGE;
        const img = new Image();
        img.src = cardBgImage;
        img.onerror = () => {
            card.style.backgroundImage = `url('${PLACEHOLDER_CARD_IMAGE}')`;
        };
        img.onload = () => {
            card.style.backgroundImage = `url('${cardBgImage}')`;
        };
        
        const title = document.createElement('h4');
        title.textContent = project.project_name || 'Untitled Project';
        
        const description = document.createElement('p');
        description.textContent = project.short_description || 'No description available';
        
        card.appendChild(title);
        card.appendChild(description);
        
        return card;
    }
    
    function updateSpotlight(project) {
        const spotlightBgImage = project.spotlight_image || PLACEHOLDER_SPOTLIGHT_IMAGE;
        const img = new Image();
        img.src = spotlightBgImage;
        img.onerror = () => {
            spotlightImage.style.backgroundImage = `url('${PLACEHOLDER_SPOTLIGHT_IMAGE}')`;
        };
        img.onload = () => {
            spotlightImage.style.backgroundImage = `url('${spotlightBgImage}')`;
        };
        
        let titleElement = spotlightTitles.querySelector('h3');
        if (!titleElement) {
            titleElement = document.createElement('h3');
            spotlightTitles.prepend(titleElement);
        }
        titleElement.textContent = project.project_name || 'Untitled Project';
        
        let descElement = spotlightTitles.querySelector('p');
        if (!descElement) {
            descElement = document.createElement('p');
            spotlightTitles.appendChild(descElement);
        }
        descElement.textContent = project.long_description || 'No detailed description available';
        
        let linkElement = spotlightTitles.querySelector('a');
        if (project.url) {
            if (!linkElement) {
                linkElement = document.createElement('a');
                linkElement.textContent = 'Click here to see more...';
                linkElement.href = project.url;
                linkElement.target = '_blank';
                spotlightTitles.appendChild(linkElement);
            } else {
                linkElement.href = project.url;
            }
        } else if (linkElement) {
            linkElement.remove();
        }
        
        currentSpotlightProject = project;
    }
    
    function handleProjectCardClick(event) {
        let card = event.target.closest('.projectCard');
        
        if (!card) return;
        
        const projectId = card.dataset.projectId;
        const project = projectsData.find(p => p.project_id === projectId);
        
        if (project) {
            updateSpotlight(project);
            
            document.querySelectorAll('.projectCard').forEach(c => {
                c.classList.remove('active');
            });
            card.classList.add('active');
        }
    }
    
    function handleScroll(direction) {
        const isDesktop = window.matchMedia('(width >= 1024px)').matches;
        const scrollAmount = 300;
        
        if (isDesktop) {
            projectsList.scrollBy({
                top: direction === 'next' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        } else {
            projectsList.scrollBy({
                left: direction === 'next' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    }
    
    function updateCharacterCount() {
        const remaining = MAX_MESSAGE_LENGTH - messageTextarea.value.length;
        charRemaining.textContent = `Characters: ${remaining}/${MAX_MESSAGE_LENGTH}`;
        
        if (remaining < 0) {
            charRemaining.style.color = 'var(--error)';
        } else {
            charRemaining.style.color = '';
        }
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function hasIllegalChars(text) {
        const illegalCharsRegex = /[^a-zA-Z0-9@._-\s]/;
        return illegalCharsRegex.test(text);
    }
    
    function validateForm() {
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();
        
        let isValid = true;
        
        document.getElementById('emailError').textContent = '';
        document.getElementById('messageError').textContent = '';
        
        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            isValid = false;
        } else if (!validateEmail(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            isValid = false;
        } else if (hasIllegalChars(email)) {
            document.getElementById('emailError').textContent = 'Email contains invalid characters';
            isValid = false;
        }
        
        if (!message) {
            document.getElementById('messageError').textContent = 'Message is required';
            isValid = false;
        } else if (hasIllegalChars(message)) {
            document.getElementById('messageError').textContent = 'Message contains invalid characters';
            isValid = false;
        } else if (message.length > MAX_MESSAGE_LENGTH) {
            document.getElementById('messageError').textContent = `Message must be ${MAX_MESSAGE_LENGTH} characters or less`;
            isValid = false;
        }
        
        return isValid;
    }
    
    function handleFormSubmit(event) {
        event.preventDefault();
        
        if (validateForm()) {
            alert('Form submitted successfully!');
            contactForm.reset();
            charRemaining.textContent = `Characters: ${MAX_MESSAGE_LENGTH}/${MAX_MESSAGE_LENGTH}`;
        }
    }
    
    function setupEventListeners() {
        projectsList.addEventListener('click', handleProjectCardClick);
        
        scrollPrevBtn.addEventListener('click', () => handleScroll('prev'));
        scrollNextBtn.addEventListener('click', () => handleScroll('next'));
        
        let scrollInterval;
        
        const startScroll = (direction) => {
            scrollInterval = setInterval(() => handleScroll(direction), 100);
        };
        
        const stopScroll = () => {
            clearInterval(scrollInterval);
        };
        
        scrollPrevBtn.addEventListener('mousedown', () => startScroll('prev'));
        scrollNextBtn.addEventListener('mousedown', () => startScroll('next'));
        
        scrollPrevBtn.addEventListener('mouseup', stopScroll);
        scrollPrevBtn.addEventListener('mouseleave', stopScroll);
        scrollNextBtn.addEventListener('mouseup', stopScroll);
        scrollNextBtn.addEventListener('mouseleave', stopScroll);
        
        scrollPrevBtn.addEventListener('touchstart', () => startScroll('prev'));
        scrollNextBtn.addEventListener('touchstart', () => startScroll('next'));
        
        scrollPrevBtn.addEventListener('touchend', stopScroll);
        scrollNextBtn.addEventListener('touchend', stopScroll);
        
        contactForm.addEventListener('submit', handleFormSubmit);
        messageTextarea.addEventListener('input', updateCharacterCount);
    }
    
    fetchData();
});