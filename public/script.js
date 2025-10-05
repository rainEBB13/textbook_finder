document.getElementById('search').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value;
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
  const data = await res.json();

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = data.items.map(book => `
    <div class="book">
      <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="">
      <h3>${book.volumeInfo.title}</h3>
      <p>${book.volumeInfo.authors?.join(', ') || 'Unknown Author'}</p>
      <a href="${book.volumeInfo.infoLink}" target="_blank">View Book</a>
    </div>
  `).join('');
});
