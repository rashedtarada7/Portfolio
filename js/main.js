

const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', function () {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    navLinks.classList.remove('open');
  });
});

const GITHUB_USERNAME = 'rashedtarada7';
const GITHUB_API_BASE = 'https://api.github.com';
const LANG_COLORS = {
  JavaScript:  '#f1e05a',
  TypeScript:  '#2b7489',
  Python:      '#3572A5',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  PHP:         '#4F5D95',
  Java:        '#b07219',
  'C++':       '#f34b7d',
  'C#':        '#178600',
  Go:          '#00ADD8',
  Rust:        '#dea584',
  Ruby:        '#701516',
  Vue:         '#41b883',
  Shell:       '#89e051',
  Kotlin:      '#F18E33',
  Swift:       '#ffac45',
  Dart:        '#00B4AB',
};


async function loadGitHubData() {
  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch(GITHUB_API_BASE + '/users/' + GITHUB_USERNAME),
      fetch(GITHUB_API_BASE + '/users/' + GITHUB_USERNAME + '/repos?sort=updated&per_page=30'),
    ]);

    const user  = await userResponse.json();
    const repos = await reposResponse.json();

    if (user && user.public_repos !== undefined) {
      updateHeroStats(user, repos);
      showGitHubProfile(user);
    }

    if (Array.isArray(repos) && repos.length > 0) {
      const filteredRepos = repos
        .filter(function (repo) { return !repo.fork; })
        .slice(0, 9);

      buildProjectCards(filteredRepos);
    } else {
      showProjectsError('No Projects');
    }

  } catch (error) {
    console.error('Error:', error);
    showProjectsError('Sorry-Not connected');
  }
}

function updateHeroStats(user, repos) {
  var reposEl = document.getElementById('stat-repos');
  if (reposEl) reposEl.textContent = user.public_repos || 0;

  var followersEl = document.getElementById('stat-followers');
  if (followersEl) followersEl.textContent = user.followers || 0;

  var totalStars = repos.reduce(function (sum, repo) {
    return sum + (repo.stargazers_count || 0);
  }, 0);

  var starsEl = document.getElementById('stat-stars');
  if (starsEl) starsEl.textContent = totalStars;
}

function showGitHubProfile(user) {
  var profileEl = document.getElementById('gh-profile');
  if (!profileEl) return;

  var avatarEl = document.getElementById('gh-avatar');
  if (avatarEl && user.avatar_url) {
    avatarEl.src = user.avatar_url;
    avatarEl.alt = user.name || GITHUB_USERNAME;
  }

  // الاسم
  var nameEl = document.getElementById('gh-name');
  if (nameEl && user.name) {
    nameEl.textContent = user.name;
  }

  var ghReposEl = document.getElementById('gh-repos');
  if (ghReposEl) ghReposEl.textContent = user.public_repos || 0;

  var ghFollowersEl = document.getElementById('gh-followers');
  if (ghFollowersEl) ghFollowersEl.textContent = user.followers || 0;

  profileEl.style.display = 'flex';
}




function buildProjectCards(repos) {
  var grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = '';

  repos.forEach(function (repo) {
    var card = createProjectCard(repo);
    grid.appendChild(card);
  });
}


function createProjectCard(repo) {
  var card = document.createElement('div');
  card.className = 'project-card';

  var description = repo.description || 'An open-source project on GitHub';

  var updatedDate = formatDate(repo.updated_at);

  var langColor = LANG_COLORS[repo.language] || '#666666';

  card.innerHTML =
    '<div class="project-header">'
      + '<div class="project-icon">⊡</div>'
      + '<div class="project-links">'
        + '<a class="project-link" href="' + repo.html_url + '" target="_blank" rel="noopener">Code</a>'
        + (repo.homepage
            ? '<a class="project-link" href="' + repo.homepage + '" target="_blank" rel="noopener">Show</a>'
            : '')
      + '</div>'
    + '</div>'
    + '<h3 class="project-name">' + repo.name + '</h3>'
    + '<p class="project-desc">' + description + '</p>'
    + '<div class="project-tags">'
      + buildTopicTags(repo.topics)
      + (repo.language
          ? '<span class="tag"><span class="lang-dot" style="background:' + langColor + '"></span>' + repo.language + '</span>'
          : '')
    + '</div>'
    + '<div class="project-meta">'
      + (repo.stargazers_count ? '<span class="project-stars">' + repo.stargazers_count + '</span>' : '')
      + (repo.forks_count       ? '<span class="project-forks">'  + repo.forks_count       + '</span>' : '')
      + '<span>' + updatedDate + '</span>'
    + '</div>';

  return card;
}


function buildTopicTags(topics) {
  if (!topics || topics.length === 0) return '';

  return topics
    .slice(0, 4) 
    .map(function (topic) {
      return '<span class="tag">' + topic + '</span>';
    })
    .join('');
}


function formatDate(dateString) {
  if (!dateString) return '';
  var date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
  });
}




function showProjectsError(message) {
  var grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = '<p class="state-text">' + message + '</p>';
}


document.addEventListener('DOMContentLoaded', function () {
  loadGitHubData();
});
