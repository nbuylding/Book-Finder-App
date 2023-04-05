'use strict';

const searchInput = document.querySelector('input');
const searchBtn = document.querySelector('#submit');
const bookList = document.querySelector('.book-list');
const homePage = document.querySelector('.container');
const favoritesContainer = document.querySelector('#favourites');
const popupOverlay = document.querySelector('.description-popup');
const backHome = document.querySelector('#home');
const faveImg = favoritesContainer.querySelector('img');

const apiKey = 'AIzaSyCSQcUYCciFyLcVpLQ9HIL5GLpPGobJ6tU';

//  fetching book info
const getJSON = function () {
	const searchTerm = searchInput.value;
	const url = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&key=${apiKey}`;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			console.log(data.items);
			const books = data.items;
			bookList.innerHTML = '';

			books.forEach((book) => {
				const img = book.volumeInfo.imageLinks.thumbnail;
				const title = book.volumeInfo.title;
				const author = book.volumeInfo.authors;
				const description = book.volumeInfo.description;
				const publisher = book.volumeInfo.publisher;
				const isbn = book.volumeInfo.industryIdentifiers[1].identifier;

				const bookDiv = document.createElement('div');
				bookDiv.innerHTML = `
				<img src='${img}' alt='${title}'/>
				<h3>${title}</h3>
				<p>${author ? author : 'Unknown Author'}</p>
				<button class='faves'>Add to Favourites</button>
				`;

				bookList.appendChild(bookDiv);
				clearField();

				const favButton = bookDiv.querySelector('.faves');
				favButton.addEventListener('click', () => {
					addToFavorites(book);
				});

				const openPopup = bookDiv.querySelector('img');
				openPopup.addEventListener('click', function () {
					// console.log('clicked');

					bookList.classList.add('hidden');
					popupOverlay.classList.remove('hidden');

					popupOverlay.innerHTML = `<img src='${img}' alt='${title}'/>
					<h3>${title}</h3>
					<h4>${author ? author : 'Unknown Author'}</h4>
					<p>${description}</p>
					<h3>Publisher: ${publisher ? publisher : 'No publisher found'}</h3>
					<h4>ISBN ${isbn ? isbn : 'Not found'}</h4>
					`;
				});
			});
			const closePopup = document.querySelector('#description-popup');
			closePopup.addEventListener('click', function () {
				bookList.classList.remove('hidden');
				popupOverlay.classList.add('hidden');
			});
		})
		.catch((error) => console.log(error));
};

// adding favourite books
function addToFavorites(book) {
	const favLi = document.createElement('li');
	favLi.classList.add('favorite');
	favLi.innerHTML = `<img src='${book.volumeInfo.imageLinks.thumbnail}' alt='${book.volumeInfo.title}'/>
	<button class='remove'>x</button>`;

	favoritesContainer.appendChild(favLi);

	// add to local storage
	const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	if (!favorites.includes(book.id)) {
		favorites.push(book.id);
		localStorage.setItem('favorites', JSON.stringify(favorites));
	}
}

// removing fave books
function removeBooksFromFaves(book) {
	favoritesContainer.addEventListener('click', function (e) {
		if (e.target.classList.contains('remove')) {
			const bookId = e.target.parentNode.dataset.id;
			e.target.parentNode.remove();

			removeBooksFromStorage('favorites', bookId);
		}
	});
}

function removeBooksFromStorage(key, index) {
	const storedArray = JSON.parse(localStorage.getItem(key));
	storedArray.splice(index, 1);
	localStorage.setItem(key, JSON.stringify(storedArray));
}

// loading faves on page refresh
function loadFavorites() {
	const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

	favorites.forEach((id) => {
		const url = `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`;
		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				addToFavorites(data);
			})
			.catch((error) => console.log(error));
	});
}

const init = function () {
	homePage.classList.remove('hidden');
	bookList.classList.add('hidden');
	popupOverlay.classList.add('hidden');
};

const clearField = function () {
	searchInput.value = '';
};

init();
loadFavorites();
removeBooksFromFaves();

// search event handler
searchBtn.addEventListener('click', function () {
	getJSON();
	homePage.classList.add('hidden');
	bookList.classList.remove('hidden');
});

searchInput.addEventListener('keyup', function (e) {
	if (e.code === 'Enter') {
		e.preventDefault();
		getJSON();
		homePage.classList.add('hidden');
		bookList.classList.remove('hidden');
	}
});

// home event handlers
backHome.addEventListener('click', init);
document.querySelector('#logo').addEventListener('click', init);
