const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const status = document.getElementById('status');

function setStatus(message, visible = true) {
  status.textContent = message;
  status.hidden = !visible;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
    const queryEncoded = encodeURIComponent(query);

    // Fetch from Google Books and Open Library simultaneously
    const [googleRes, openLibRes] = await Promise.all([
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${queryEncoded}&maxResults=10`),
      fetch(`https://openlibrary.org/search.json?q=${queryEncoded}&limit=10`)
    ]);

    if (!googleRes.ok || !openLibRes.ok)
      throw new Error('API request failed.');

    const googleData = await googleRes.json();
    const openLibData = await openLibRes.json();

    // Combine results
    const googleBooks = (googleData.items || []).map(book => {
      const info = book.volumeInfo || {};
      return {
        title: info.title || 'Untitled',
        authors: info.authors?.join(', ') || 'Unknown Author',
        thumb: info.imageLinks?.thumbnail || '',
        link: info.infoLink || '#',
        source: 'Google Books',
        access: book.accessInfo?.epub?.isAvailable || book.accessInfo?.pdf?.isAvailable
          ? 'Free'
          : 'Purchase'
      };
    });

    const openLibBooks = (openLibData.docs || []).map(doc => {
      const cover = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : '';
      return {
        title: doc.title || 'Untitled',
        authors: doc.author_name?.join(', ') || 'Unknown Author',
        thumb: cover,
        link: `https://openlibrary.org${doc.key}`,
        source: 'Open Library',
        access: 'Free'
      };
    });

    const combinedBooks = [...googleBooks, ...openLibBooks];

    if (combinedBooks.length === 0) {
      setStatus('No results found.', true);
      resultsDiv.innerHTML = '<p class="no-results">No books matched your query.</p>';
      return;
    }

    setStatus(`${combinedBooks.length} result(s) found.`, true);

    resultsDiv.innerHTML = combinedBooks.map((book, idx) => `
      <article class="book" id="book-${idx}">
        ${book.thumb ? `<img src="${escapeHtml(book.thumb)}" alt="Cover of ${escapeHtml(book.title)}">` : ''}
        <div class="book-info">
          <h3>${escapeHtml(book.title)}</h3>
          <p class="authors">${escapeHtml(book.authors)}</p>
          <p class="source">Source: ${escapeHtml(book.source)}</p>
          <p class="access">Access: ${escapeHtml(book.access)}</p>
          <a class="view-link" href="${escapeHtml(book.link)}" target="_blank" rel="noopener">View Book</a>
        </div>
      </article>
    `).join('');

  } catch (err) {
    console.error(err);
    setStatus('An error occurred while searching. Please try again later.');
  }
});
