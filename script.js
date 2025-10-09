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

  const queryEncoded = encodeURIComponent(query);
  let googleBooks = [];
  let openLibBooks = [];

  // --- Fetch Google Books ---
  try {
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${queryEncoded}&maxResults=10`);
    if (!googleRes.ok) throw new Error(`Google Books API error: ${googleRes.status}`);
    const googleData = await googleRes.json();

    googleBooks = (googleData.items || []).map(book => {
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
  } catch (err) {
    console.warn('Google Books fetch failed:', err);
  }

  // --- Fetch Open Library ---
  try {
    const openLibRes = await fetch(`https://openlibrary.org/search.json?q=${queryEncoded}&limit=10`);
    if (!openLibRes.ok) throw new Error(`Open Library API error: ${openLibRes.status}`);
    const openLibData = await openLibRes.json();

    openLibBooks = (openLibData.docs || []).map(doc => {
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
  } catch (err) {
    console.warn('Open Library fetch failed:', err);
  }

  // --- Combine Results ---
  const combinedBooks = [...googleBooks, ...openLibBooks];

  if (combinedBooks.length === 0) {
    setStatus('No results found or both APIs failed.', true);
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
});
