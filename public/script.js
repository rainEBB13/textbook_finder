const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const status = document.getElementById('status');

function setStatus(message, visible = true) {
  status.textContent = message;
  status.hidden = !visible;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = (input.value || '').trim();
  resultsDiv.innerHTML = '';
  setStatus('Searching...');

  if (!query) {
    setStatus('Please enter a search term.');
    return;
  }

  try {
    // encode query to avoid breaking the URL
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      setStatus('No results found.', true);
      resultsDiv.innerHTML = '<p class="no-results">No books matched your query.</p>';
      return;
    }

    setStatus(`${data.items.length} result(s) found.`, true);

    resultsDiv.innerHTML = data.items.map((book, idx) => {
      const info = book.volumeInfo || {};
      const title = info.title || 'Untitled';
      const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
      const thumb = info.imageLinks?.thumbnail || '';
      const link = info.infoLink || '#';

      // accessible card with keyboard-focusable link
      return `
        <article class="book" id="book-${idx}">
          ${thumb ? `<img src="${thumb}" alt="Cover of ${escapeHtml(title)}">` : ''}
          <div class="book-info">
            <h3>${escapeHtml(title)}</h3>
            <p class="authors">${escapeHtml(authors)}</p>
            <a class="view-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">View Book</a>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error(err);
    setStatus('An error occurred while searching. Please try again later.');
  }
});

// small helper to avoid inserting raw HTML from API fields
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
