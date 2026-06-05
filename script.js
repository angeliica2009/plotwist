document.addEventListener("DOMContentLoaded", () => {

  const API_KEY = "141bd41783b303d69d65d2b940be8ca1";
  const IMG = "https://image.tmdb.org/t/p/w500";

  // ELEMENTOS
  const search = document.getElementById("search");
  const cards = document.getElementById("cards");

  const movieSection = document.getElementById("movieSection");
  const poster = document.getElementById("poster");
  const title = document.getElementById("title");
  const rating = document.getElementById("rating");
  const resumen = document.getElementById("resumen");

  const favBtn = document.getElementById("favBtn");

  const reviewInput = document.getElementById("reviewInput");
  const reviewsDiv = document.getElementById("reviews");

  const favoritesDiv = document.getElementById("favorites");

  let currentMovie = null;

  // =========================
  // 🔎 BUSCADOR
  // =========================
  search.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const query = search.value.trim();
      if (!query) return;

      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}`
      );

      const data = await res.json();
      showCards(data.results);
    }
  });

  // =========================
  // 🎬 MOSTRAR PELÍCULA
  // =========================
  function showMovie(movie) {
    currentMovie = movie;

    movieSection.classList.remove("hidden");

    poster.src = movie.poster_path
      ? IMG + movie.poster_path
      : "https://via.placeholder.com/300x450";

    title.textContent = movie.title;

    rating.textContent = movie.vote_average
      ? "⭐ " + movie.vote_average.toFixed(1)
      : "Sin rating";

    resumen.textContent = movie.overview || "Sin descripción.";

    updateFavButton();
  }

  // =========================
  // ⭐ FAVORITOS
  // =========================
  function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  }

  function saveFavorites(favs) {
    localStorage.setItem("favorites", JSON.stringify(favs));
  }

  function updateFavButton() {
    if (!currentMovie) return;

    const favs = getFavorites();
    const exists = favs.find(f => f.id === currentMovie.id);

    favBtn.textContent = exists
      ? "💔 Quitar de favoritos"
      : "⭐ Añadir a favoritos";

    renderFavorites();
  }

  favBtn.addEventListener("click", () => {
    if (!currentMovie) return;

    let favs = getFavorites();
    const exists = favs.find(f => f.id === currentMovie.id);

    if (exists) {
      favs = favs.filter(f => f.id !== currentMovie.id);
    } else {
      favs.push(currentMovie);
    }

    saveFavorites(favs);
    updateFavButton();
  });

  // =========================
  // ⭐ RENDER FAVORITOS
  // =========================
  function renderFavorites() {

    const favs = getFavorites();

    favoritesDiv.innerHTML = "";

    favs.forEach(movie => {

      const div = document.createElement("div");
      div.classList.add("fav-card");

      div.innerHTML = `
        <img src="${
          movie.poster_path
            ? IMG + movie.poster_path
            : "https://via.placeholder.com/150"
        }">

        <p>${movie.title}</p>

        <p class="tmdb-credit">
          Datos proporcionados por TMDB
        </p>
      `;

      div.addEventListener("click", () => showMovie(movie));

      favoritesDiv.appendChild(div);

    });

  }

  // =========================
  // 🎬 CARDS
  // =========================
  function showCards(movies) {

    cards.innerHTML = "";

    movies.slice(0, 10).forEach(movie => {

      const div = document.createElement("div");
      div.classList.add("card");

      div.innerHTML = `
        <img src="${
          movie.poster_path
            ? IMG + movie.poster_path
            : "https://via.placeholder.com/150"
        }">

        <p>${movie.title}</p>

        <p class="tmdb-credit">
          Fuente: TMDB
        </p>
      `;

      div.addEventListener("click", () => showMovie(movie));

      cards.appendChild(div);

    });

  }

  // =========================
  // 🎬 FILTROS
  // =========================
  document.querySelectorAll(".tags button").forEach(btn => {

    btn.addEventListener("click", async () => {

      const genre = btn.dataset.genre;

      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${genre}`
      );

      const data = await res.json();

      showCards(data.results);

    });

  });

  // =========================
  // 💬 REVIEWS
  // =========================
  function loadReviews() {

    const saved = JSON.parse(localStorage.getItem("reviews")) || [];

    reviewsDiv.innerHTML = saved
      .map(r => `<p>💬 ${r}</p>`)
      .join("");

  }

  document.getElementById("sendReview").addEventListener("click", () => {

    const text = reviewInput.value.trim();

    if (text) {

      const saved =
        JSON.parse(localStorage.getItem("reviews")) || [];

      saved.push(text);

      localStorage.setItem(
        "reviews",
        JSON.stringify(saved)
      );

      reviewInput.value = "";

      loadReviews();

    }

  });

  // =========================
  // 🎬 DESTACADA
  // =========================
  async function loadFeatured() {

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`
    );

    const data = await res.json();

    const random =
      data.results[
        Math.floor(Math.random() * data.results.length)
      ];

    const container =
      document.getElementById("featuredMovie");

    container.innerHTML = `
      <img src="${IMG + random.poster_path}">

      <h3>${random.title}</h3>

      <p>⭐ ${random.vote_average.toFixed(1)}</p>

      <p class="tmdb-credit">
        Fuente: TMDB (The Movie Database)
      </p>
    `;

    container.addEventListener("click", () =>
      showMovie(random)
    );

  }

  // =========================
  // 🧭 NAVEGACIÓN
  // =========================
  function initNavigation() {

    const sections = {
      inicio: document.querySelector(".featured"),
      pelis: document.querySelector(".pelis-section"),
      reviews: document.querySelector(".reviews-section"),
      favoritos: document.querySelector(".favorites-section")
    };

    document.querySelectorAll("nav a").forEach(link => {

      link.addEventListener("click", (e) => {

        e.preventDefault();

        const section = link.dataset.section;

        Object.values(sections).forEach(sec => {
          if (sec) sec.style.display = "none";
        });

        if (sections[section]) {
          sections[section].style.display = "block";
        }

      });

    });

  }

  // =========================
  // 🚀 INICIO
  // =========================
  (async () => {

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`
    );

    const data = await res.json();

    showCards(data.results);

    loadFeatured();

    loadReviews();

    initNavigation();

    renderFavorites();

  })();

});
