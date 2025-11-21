import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

let selectedIndex = -1; 
let activeQuery = '';
let currentPieData = []; 

function filterAndRender() {
    let filteredProjects = projects;
    if (activeQuery) {
        filteredProjects = filteredProjects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(activeQuery.toLowerCase());
        });
    }

    if (selectedIndex !== -1) {
        const selectedYear = currentPieData[selectedIndex].label;
        filteredProjects = filteredProjects.filter(
            (project) => project.year === selectedYear
        );
    }
    
    renderProjects(filteredProjects, projectsContainer, 'h2');
    const titleElement = document.querySelector('.projects-title');
    if (titleElement) {
        titleElement.textContent = `${filteredProjects.length} Projects `;
    }
    renderPieChart(filteredProjects);
}


function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    
    currentPieData = newData; 

    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newArcs = newArcData.map((d) => newArcGenerator(d));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove();
    let newLegend = d3.select('.legend');
    newLegend.selectAll('*').remove();

    newArcs.forEach((arc, idx) => {
        newSVG.append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        .attr('class', idx === selectedIndex ? 'selected' : null) 
        .on('click', () => {
            selectedIndex = selectedIndex === idx ? -1 : idx;

            newSVG.selectAll('path')
                .attr('class', (_, i) =>
                    i === selectedIndex ? 'selected' : null
                );
            
            newLegend.selectAll('li')
                .attr('class', (_, i) => 
                    i === selectedIndex ? 'selected' : null
                );
            
            filterAndRender();
        });
    })

    newData.forEach((d, idx) => {
        newLegend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .attr('class', idx === selectedIndex ? 'selected' : null) 
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}


filterAndRender(); 

let searchInput = document.querySelector('.searchBar'); 
searchInput.addEventListener('input', (event) => {
    activeQuery = event.target.value;
    
    d3.select('svg').selectAll('path').attr('class', null);
    d3.select('.legend').selectAll('li').attr('class', null);
    selectedIndex = -1;
    
    filterAndRender();
});


//Old, independent state code:

// import { fetchJSON, renderProjects } from '../global.js';
// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// // Load project data from JSON:
// const projects = await fetchJSON('../lib/projects.json');

// // Select container for where to render the project articles:
// const projectsContainer = document.querySelector('.projects');

// function renderPieChart(projectsGiven) {
//     // re-calculate rolled data
//     let newRolledData = d3.rollups(
//       projectsGiven,
//       (v) => v.length,
//       (d) => d.year,
//     );
//     // re-calculate data
//     let newData = newRolledData.map(([year, count]) => {
//         return { value: count, label: year };
//     });

//     let newSliceGenerator = d3.pie().value((d) => d.value);
//     let newArcData = newSliceGenerator(newData);
//     let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
//     let newArcs = newArcData.map((d) => newArcGenerator(d));
//     let colors = d3.scaleOrdinal(d3.schemeTableau10);

//     //Resetting paths and legends:
//     let newSVG = d3.select('svg');
//     newSVG.selectAll('path').remove();
//     let newLegend = d3.select('.legend');
//     newLegend.selectAll('*').remove();

//     let selectedIndex = -1;
//     // Remaking paths:
//     newArcs.forEach((arc, idx) => {
//         newSVG.append('path')
//         .attr('d', arc)
//         .attr('fill', colors(idx))
//         .on('click', () => {
//             selectedIndex = selectedIndex === idx ? -1 : idx;

//             newSVG.selectAll('path')
//                 .attr('class', (_, idx) =>
//                     idx === selectedIndex ? 'selected' : null
//                 );
            
//             newLegend.selectAll('li')
//                 .attr('class', (_, idx) => 
//                     idx === selectedIndex ? 'selected' : null
//                 );
            
//             if (selectedIndex === -1) {
//                 renderProjects(projects, projectsContainer, 'h2');
//                 } else {
//                     const selectedYear = newData[selectedIndex].label;
//                     let filteredProjects = projects.filter(
//                         (project) => project.year === selectedYear
//                     );
//                     renderProjects(filteredProjects, projectsContainer, 'h2');
//                 }
//         });
//     })

//     // Remaking legends:
//     newData.forEach((d, idx) => {
//         newLegend.append('li')
//         .attr('style', `--color:${colors(idx)}`)
//         .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
//     });
// }

// // Render each project w h2:
// renderProjects(projects, projectsContainer, 'h2'); 
// renderPieChart(projects);

// // Selecting title element
// const titleElement = document.querySelector('.projects-title');
// if (titleElement) {
//     titleElement.textContent = `${projects.length} Projects `;
// }

// let searchInput = document.querySelector('.searchBar'); //Searches for a searchBar-labeled element.
// searchInput.addEventListener('input', (event) => {
//   const query = event.target.value;
//   let filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
//   renderProjects(filteredProjects, projectsContainer, 'h2');
//   renderPieChart(filteredProjects);
// });