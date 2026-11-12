
// API-avaimen asetukset
// Vaihda 'PUT_YOUR_API_KEY_HERE' omaan API-avaimeen jonka saat Last.fm verkkosivulta.
// Get your key from: https://www.last.fm/api/account/create
const API_KEY = 'PUT_YOUR_API_KEY_HERE';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

// Dom-elementtien hakeminen
const artistSelect = document.getElementById('artist-select');
const artistInput = document.getElementById('artist-input');
const searchBtn = document.getElementById('search-btn');
const albumsContainer = document.getElementById('albums-container');
const artistInfoContainer = document.getElementById('artist-info');
const statusMessage = document.getElementById('status-message');

// Dynamisten hakutoimintoiden kuuntelijat 
document.addEventListener('DOMContentLoaded', () => {
  // Haku alasvetovalikosta
  artistSelect.addEventListener('change', (e) => {
    const selectedArtist = e.target.value;
    if (selectedArtist) {
      artistInput.value = '';
      fetchArtistData(selectedArtist);
    }
  });

  // Haku tekstikentästä (nollaa alavetovalikon valinnan)
  searchBtn.addEventListener('click', () => {
    const query = artistInput.value.trim();
    if (query) {
      artistSelect.value = '';
      fetchArtistData(query);
    }
  });

  // Enter-näppäimen kuuntelija hakukentässä (enter-nappain suorittaa haun)
  artistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
});

/**
 * Hakee artistin tiedot ja suositut albumit Last.fm API:sta
 */
async function fetchArtistData(artistName) {
  // Varmistetaan, että käyttäjä on syöttänyt API-avaimen ennen hakuja
  if (API_KEY === 'PUT_YOUR_API_KEY_HERE' || !API_KEY) {
    showStatus('Virhe: API-avain puuttuu! Lisää oma Last.fm API-avaimesi script.js-tiedostoon.', 'error');
    return;
  }

  showStatus('Ladataan tietoja...', 'info');
  albumsContainer.innerHTML = '';
  artistInfoContainer.innerHTML = '';

  try {
    // Haetaan artistin tiedot
    const infoUrl = `${BASE_URL}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json`;
    const infoResponse = await fetch(infoUrl);
    const infoData = await infoResponse.json();

    if (infoData.error) {
      showStatus(`Artistia "${artistName}" ei löytynyt.`, 'error');
      return;
    }

    // Haetaan artistin suositut albumit
    const albumsUrl = `${BASE_URL}?method=artist.gettopalbums&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&limit=8&format=json`;
    const albumsResponse = await fetch(albumsUrl);
    const albumsData = await albumsResponse.json();

    // Renderöidään tulokset (tuotetaan tiedot HTML:ään)
    displayArtistInfo(infoData.artist);
    displayAlbums(albumsData.topalbums.album);
    showStatus('', '');

  } catch (error) {
    console.error('Virhe AJAX-kutsussa:', error);
    showStatus('Tietojen hakemisessa tapahtui virhe.', 'error');
  }
}

/**
 * Tulostaa artistin perustiedot kuten nimi, kuuntelijamäärän ja lyhyen kuvauksen
 */
function displayArtistInfo(artist) {
  // Biografian lopusta poistetaan mahdollinen HTML-linkki, jotta saadaan vain lyhyt kuvaus
  const bioSnippet = artist.bio && artist.bio.summary ? artist.bio.summary.split('<a href')[0] : 'Ei kuvausta saatavilla.';
  const listeners = Number(artist.stats.listeners).toLocaleString('fi-FI');

  artistInfoContainer.innerHTML = `
    <h2>${artist.name}</h2>
    <p><strong>Kuuntelijoita Last.fm:ssä:</strong> ${listeners}</p>
    <p class="bio">${bioSnippet}</p>
  `;
}

/**
 * Luodaan ja tuotetaan albumikortit HTML:ään. Jokaisessa kortissa on albumin kansikuva, nimi, kuuntelukerrat ja painike kappaleiden näyttämiseen.
 */
function displayAlbums(albums) {
  if (!albums || albums.length === 0) {
    albumsContainer.innerHTML = '<p>Ei albumeita saatavilla.</p>';
    return;
  }

  albums.forEach(album => {
    // Haetaan albumin kansikuva (large) tai käytetään placeholder-kuvaa jos ei löydy
    const imageObj = album.image.find(img => img.size === 'large') || album.image[0];
    const imageUrl = imageObj && imageObj['#text'] ? imageObj['#text'] : 'https://via.placeholder.com/150?text=Ei+kuvaa';

    const card = document.createElement('div');
    card.className = 'album-card';
    card.innerHTML = `
      <img src="${imageUrl}" alt="${album.name}">
      <h3>${album.name}</h3>
      <p>Kuuntelukertoja: ${Number(album.playcount || 0).toLocaleString('fi-FI')}</p>
      <button class="details-btn" data-artist="${album.artist.name}" data-album="${album.name}">Näytä kappaleet</button>
      <div class="tracks-list" style="display:none;"></div>
    `;

    albumsContainer.appendChild(card);
  });

  // Lisätään dynaamiset tapahtumankuuntelijat juuri luotujen albumikorttien painikkeille
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const artist = e.target.getAttribute('data-artist');
      const album = e.target.getAttribute('data-album');
      const tracksContainer = e.target.nextElementSibling;
      fetchAlbumDetails(artist, album, tracksContainer);
    });
  });
}

/**
 * Hakee ja näyttää valitun albumin kappaleet Last.fm API:sta. Jos kappalelista on jo ladattu, se piilotetaan tai näytetään uudelleen.
 */
async function fetchAlbumDetails(artist, album, targetElement) {
  // Jos kappalelista on jo ladattu, vaihdetaan sen näkyvyys
  if (targetElement.childElementCount > 0) {
    targetElement.style.display = targetElement.style.display === 'none' ? 'block' : 'none';
    return;
  }

  targetElement.innerHTML = 'Ladataan kappaleita...';
  targetElement.style.display = 'block';

  try {
    const url = `${BASE_URL}?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.album && data.album.tracks && data.album.tracks.track) {
      // Jos kappaleita on vain yksi, se ei ole taulukossa, joten varmistetaan että se on aina taulukko
      const tracks = Array.isArray(data.album.tracks.track) ? data.album.tracks.track : [data.album.tracks.track];
      
      let trackListHtml = '<ol>';
      tracks.forEach(track => {
        trackListHtml += `<li>${track.name}</li>`;
      });
      trackListHtml += '</ol>';
      
      targetElement.innerHTML = trackListHtml;
    } else {
      targetElement.innerHTML = '<p>Kappalelistaa ei löytynyt.</p>';
    }
  } catch (err) {
    targetElement.innerHTML = '<p>Virhe ladattaessa kappaleita.</p>';
  }
}

function showStatus(text, type) {
  statusMessage.textContent = text;
  statusMessage.className = type;
}