// Get the search URL from the query parameters
const urlParams = new URLSearchParams(window.location.search);
const searchUrl = urlParams.get('url');

// For debugging
console.log('Search URL:', searchUrl);

if (searchUrl) {
  document.getElementById('searchFrame').src = searchUrl;
} else {
  console.error('No URL provided in query parameters');
} 