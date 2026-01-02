console.log("IT'S ALIVE!");

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact' }
  // add the rest of your pages here
];

const navLinks = $$("nav a")

// Array.find() method gives us the first array element that passes a test.
// The location object, which has information about the current page, such as location.host and location.pathname.
let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname,
);

if (currentLink) {
    // or if (currentLink !== undefined)
    currentLink.classList.add('current'); //Adding 'current' class (in style.css) to our link
}

let nav = document.createElement('nav');
document.body.prepend(nav); //Puts the new nav element at the start of <body>

//Ensuring internal links both when run locally, and when deployed:
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "/"                  // Local server
    : "/";         // GitHub Pages repo name


for (let p of pages) { //Adding a elements in the nav for each page
    let url = p.url.startsWith('http') ? p.url : BASE_PATH + p.url;
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

    // Open links to external sites in a new tab
    if (a.host !== location.host) {
        a.target = "_blank";
    }

    nav.append(a);
}


// THE LIGHT/DARK MODE SWITCH: (after body is set up)

document.body.insertAdjacentHTML( 
  'afterbegin', //afterbegin means right after <body> starts, so at the top of the page
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
		</select>
	</label>`,
);

const select = document.querySelector('.color-scheme select');

if ("colorScheme" in localStorage) {
    const localStorageScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', localStorageScheme);
    select.value = localStorageScheme
    console.log('color scheme set to memory:', localStorageScheme);
}

select.addEventListener('input', function (event) {
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value
    console.log('color scheme changed to', event.target.value);
});


// PROJECTS FOR JS:
export async function fetchJSON(url) {
    try {
      // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
  }

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = ''; //Clear existing content from container

    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const headingTag = validHeadings.includes(headingLevel.toLowerCase()) ? headingLevel.toLowerCase() : 'h2';

    if (!containerElement || !(containerElement instanceof HTMLElement)) {
        console.error("Invalid container element provided.");
        return;
    }

    //For each project, create a new <article> element to hold its details.
    projects.forEach(project => {
        const article = document.createElement('article');

        article.innerHTML = `
            <h3>${project.title ?? "Untitled Project"}</h3>
            ${
                project.image
                ? `<img src="${project.image}" alt="${project.title ?? "No title"}">`
                : `<div class="placeholder">No image available</div>`
            }
            <p>${project.description ?? "No description provided."}</p>
            <p></p>
            <p class="projects-year-text">${project.year.italics() ?? "No year provided.".italics()}</p>
        `;

        containerElement.appendChild(article);
    });
}


// GITHUB API DATA:
export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}