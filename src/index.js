/* script.js */

import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let searchQuery = '';
let page = 1;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

form.addEventListener('submit', event => {
  event.preventDefault();
  searchQuery = event.target.searchQuery.value.trim();
  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('hidden');
  fetchImages(true); // Trebuie să trimiți un parametru pentru a indica prima căutare
});

loadMoreBtn.addEventListener('click', () => fetchImages(false)); // Fără notificare

async function fetchImages(isNewSearch) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '47533640-b7cfaf493a633d05be21fd4b5', // Cheia ta API
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40, // Asigură-te că fiecare răspuns conține doar 40 de imagini
      },
    });
    const data = response.data;
    if (data.hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }
    if (isNewSearch) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }
    renderGallery(data.hits);
    lightbox.refresh();
    loadMoreBtn.classList.remove('hidden');
    if (page * 40 >= data.totalHits) {
      loadMoreBtn.classList.add('hidden');
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
    page += 1;
    // Derulare lină a paginii
    const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
  }
}

function renderGallery(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
      <div class="photo-card">
        <a href="${largeImageURL}" target="_blank">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b> ${likes}
          </p>
          <p class="info-item">
            <b>Views</b> ${views}
          </p>
          <p class="info-item">
            <b>Comments</b> ${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b> ${downloads}
          </p>
        </div>
      </div>
    `,
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}
