// ── Viliar Family Tree — JS ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    const NAV_H    = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 56;
    const html     = document.documentElement;
    const sections = Array.from(document.querySelectorAll('.gen-section'));
    const nodes    = document.querySelectorAll('.node');

    // Show gen-1 immediately on load
    document.querySelectorAll('#gen-1 .fade-item').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 100 + i * 130);
    });


    // ────────────────────────────────────────────────────
    // 2. FADE-IN (IntersectionObserver)
    // ────────────────────────────────────────────────────
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.fade-item').forEach((el, i) => {
                    setTimeout(() => el.classList.add('visible'), i * 130);
                });
            }
        });
    }, { root: null, threshold: 0.35 });

    sections.forEach(sec => sectionObserver.observe(sec));


    // ────────────────────────────────────────────────────
    // 4. SEARCH
    // ────────────────────────────────────────────────────
    const people = [];
    document.querySelectorAll('.node .node-name, .people[data-title]').forEach(el => {
        const name = (el.dataset.title || el.textContent).trim();
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!people.some(p => p.slug === slug)) people.push({ name, slug });
    });

    // Click a node on the tree → open that person on content.html
    nodes.forEach(node => {
        const nameEl = node.querySelector('.node-name');
        if (!nameEl) return;
        const slug = nameEl.textContent.trim().toLowerCase()
            .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        node.style.cursor = 'pointer';
        node.addEventListener('click', () => {
            window.location.href = `content.html#${slug}`;
        });
    });

    const input       = document.getElementById('search-input');
    const suggestions = document.getElementById('search-suggestions');
    if (!input || !suggestions) return;

    function highlightMatch(text, query) {
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return document.createTextNode(text);
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode(text.slice(0, idx)));
        const mark = document.createElement('span');
        mark.className = 'match';
        mark.textContent = text.slice(idx, idx + query.length);
        frag.appendChild(mark);
        frag.appendChild(document.createTextNode(text.slice(idx + query.length)));
        return frag;
    }

    function renderSuggestions(query) {
        suggestions.innerHTML = '';
        if (!query) { suggestions.classList.remove('open'); return; }
        const matches = people.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        if (matches.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'search-no-results';
            empty.textContent = 'No family member found.';
            suggestions.appendChild(empty);
        } else {
            matches.forEach(person => {
                const li = document.createElement('li');
                const a  = document.createElement('a');
                a.href = `content.html#${person.slug}`;
                a.appendChild(highlightMatch(person.name, query));
                li.appendChild(a);
                suggestions.appendChild(li);
            });
        }
        suggestions.classList.add('open');
    }

    input.addEventListener('input', () => renderSuggestions(input.value.trim()));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { const first = suggestions.querySelector('a'); if (first) window.location.href = first.href; }
        if (e.key === 'Escape') { suggestions.classList.remove('open'); input.blur(); }
    });
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) suggestions.classList.remove('open');
    });
    suggestions.addEventListener('mousedown', (e) => e.preventDefault());
});



const steps    = document.querySelectorAll('.progress-step');
const sections = document.querySelectorAll('.gen-section');

// Move the highlight to one dot
function setActive(index) {
    steps.forEach((step, i) => {
        step.classList.toggle('progress-step-active', i === index);
    });
}

// Highlight the dot of whichever section is on screen
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            setActive([...sections].indexOf(entry.target));
        }
    });
}, { threshold: 0.6 });

sections.forEach((section) => sectionObserver.observe(section));

// Click a dot to scroll to its section
steps.forEach((step, i) => {
    step.addEventListener('click', () => {
        sections[i].scrollIntoView({ behavior: 'smooth' });
    });
});

// Fade-in for .fade-item (skip this part if your script already does it)
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
    });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-item').forEach((el) => fadeObserver.observe(el));


//for the content.html

const people = document.querySelectorAll('.people');
const photoBox = document.querySelector('.photo-box');
const photo = document.getElementById('main-photo');
const placeholder = document.getElementById('photo-placeholder');

people.forEach(person => {
    person.addEventListener('click', () => {
        // info text
        document.getElementById('source-title').textContent = person.dataset.title;
        document.getElementById('source-text').textContent  = person.dataset.source;
        document.getElementById('main-desc').innerHTML      = person.dataset.desc;

        // enlarged photo
        const src = person.querySelector('img').getAttribute('src');
        if (src) {
            photo.src = src;
            photo.alt = person.dataset.title;
            photo.hidden = false;
            placeholder.hidden = true;
        } else {
            photo.hidden = true;
            placeholder.hidden = false;
        }

        // replay the enlarge animation
        photoBox.classList.remove('pop');
        void photoBox.offsetWidth;      // forces a restart
        photoBox.classList.add('pop');

        // keep the selected highlight
        people.forEach(p => p.classList.remove('selected'));
        person.classList.add('selected');
    });
});


// open the person from a search / node link (content.html#slug)
function openFromHash() {
    const slug = decodeURIComponent(location.hash.slice(1));
    if (!slug) return;
    const match = [...people].find(p =>
        p.dataset.title.toLowerCase().trim()
            .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug
    );
    if (match) {
        match.click();
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
openFromHash();
window.addEventListener('hashchange', openFromHash);
