
// API-avaimen asetukset
// Vaihda 'PUT_YOUR_API_KEY_HERE' omaan API-avaimeen jonka saat Last.fm verkkosivulta.
// Get your key from: https://www.last.fm/api/account/create
const API_KEY = 'PUT_YOUR_API_KEY_HERE';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
let albumsChart = null; // Säilyttää Chart.js-instanssin päivitystä varten

// jQueryn document.ready -lyhenne
$(function() {
  // Haku alasvetovalikosta
  $('#artist-select').on('change', function() {
    const selectedArtist = $(this).val();
    if (selectedArtist) {
      $('#artist-input').val('');
      fetchArtistData(selectedArtist);
    }
  });

  // Haku tekstikentästä
  $('#search-btn').on('click', function() {
    const query = $('#artist-input').val().trim();
    if (query) {
      $('#artist-select').val('');
      fetchArtistData(query);
    } else {
      showAlert('Huomio!', 'Kirjoita artistin nimi tai valitse listalta.', 'warning');
    }
  });

  // Enter-näppäimen kuuntelija hakukentässä
  $('#artist-input').on('keypress', function(e) {
    if (e.which === 13) { // 13 = Enter
      $('#search-btn').trigger('click');
    }
  });

  // Dynaaminen tapahtumankuuntelija albumikorttien painikkeille (event delegation)
  $(document).on('click', '.details-btn', function() {
    const $btn = $(this);
    const artist = $btn.data('artist');
    const album = $btn.data('album');
    const $tracksContainer = $btn.siblings('.tracks-list');
    
    fetchAlbumDetails(artist, album, $tracksContainer, $btn);
  });
});

/**
 * Hakee artistin tiedot ja albumit jQueryn $.when() ja $.getJSON() -metodeilla
 */
function fetchArtistData(artistName) {
  if (API_KEY === 'PUT_YOUR_API_KEY_HERE' || !API_KEY) {
    showAlert('API-avain puuttuu!', 'Lisää oma Last.fm API-avaimesi script.js-tiedostoon.', 'error');
    return;
  }

  // Tyhjennetään ja piilotetaan vanhat tiedot pehmeästi
  $('#status-message').text('Ladataan tietoja...').attr('class', 'info').fadeIn(200);
  $('#artist-info, #chart-wrapper, #albums-heading').hide();
  $('#albums-container').empty();

  const infoUrl = `${BASE_URL}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json`;
  const albumsUrl = `${BASE_URL}?method=artist.gettopalbums&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&limit=8&format=json`;

  // Suoritetaan molemmat AJAX-haut rinnakkain jQueryn $.when()-funktiolla
  $.when($.getJSON(infoUrl), $.getJSON(albumsUrl))
    .done(function(infoRes, albumsRes) {
      const infoData = infoRes[0];
      const albumsData = albumsRes[0];

      $('#status-message').fadeOut(200);

      if (infoData.error) {
        showAlert('Ei tuloksia', `Artistia "${artistName}" ei löytynyt.`, 'error');
        return;
      }

      displayArtistInfo(infoData.artist);
      
      const albums = albumsData.topalbums ? albumsData.topalbums.album : [];
      displayAlbums(albums);
      renderAlbumsChart(albums);
    })
    .fail(function() {
      $('#status-message').fadeOut(200);
      showAlert('Verkkovirhe', 'Tietojen hakemisessa Last.fm-palvelimelta tapahtui virhe.', 'error');
    });
}

/**
 * Tulostaa artistin perustiedot ja animoi kortin näkyviin
 */
function displayArtistInfo(artist) {
  const bioSnippet = artist.bio && artist.bio.summary 
    ? artist.bio.summary.split('<a href')[0] 
    : 'Ei kuvausta saatavilla.';
  const listeners = Number(artist.stats.listeners).toLocaleString('fi-FI');

  const html = `
    <h2>${artist.name}</h2>
    <p><strong>Kuuntelijoita Last.fm:ssä:</strong> ${listeners}</p>
    <p class="bio">${bioSnippet}</p>
  `;

  // Päivitetään sisältö ja käytetään jQueryn fadeIn-tehostetta
  $('#artist-info').html(html).fadeIn(500);
}

/**
 * Luo albumikortit jQuerylla ja animoi ne porrastetusti näkyviin
 */
function displayAlbums(albums) {
  const $container = $('#albums-container');
  $container.empty();

  if (!albums || albums.length === 0) {
    $container.html('<p>Ei albumeita saatavilla.</p>');
    return;
  }

  $('#albums-heading').fadeIn(400);

  $.each(albums, function(index, album) {
    const imageObj = album.image.find(img => img.size === 'large') || album.image[0];
    const imageUrl = (imageObj && imageObj['#text']) ? imageObj['#text'] : 'https://via.placeholder.com/150?text=Ei+kuvaa';

    // Luodaan kortti jQuery-objektina (piilotettuna aluksi animaatiota varten)
    const $card = $('<div>', { class: 'album-card' }).hide().html(`
      <img src="${imageUrl}" alt="${album.name}">
      <h3>${album.name}</h3>
      <p>Kuuntelukertoja: ${Number(album.playcount || 0).toLocaleString('fi-FI')}</p>
      <button class="details-btn" data-artist="${album.artist.name}" data-album="${album.name}">Näytä kappaleet</button>
      <div class="tracks-list" style="display:none;"></div>
    `);

    $container.append($card);
    // Porrastettu fadeIn-efekti jokaiselle kortille
    $card.delay(index * 80).fadeIn(400);
  });
}

/**
 * Hakee kappaleet ja käyttää jQueryn slideToggle()-animaatiota listan avaamiseen/sulkemiseen
 */
function fetchAlbumDetails(artist, album, $targetElement, $btn) {
  // Jos lista on jo ladattu, liu'utetaan se vain auki tai kiinni
  if ($targetElement.children().length > 0) {
    $targetElement.slideToggle(300, function() {
      $btn.text($targetElement.is(':visible') ? 'Piilota kappaleet' : 'Näytä kappaleet');
    });
    return;
  }

  $targetElement.html('<p>Ladataan kappaleita...</p>').slideDown(200);
  $btn.text('Ladataan...');

  const url = `${BASE_URL}?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`;

  $.getJSON(url)
    .done(function(data) {
      if (data.album && data.album.tracks && data.album.tracks.track) {
        const tracks = Array.isArray(data.album.tracks.track) ? data.album.tracks.track : [data.album.tracks.track];
        
        let trackListHtml = '<ol>';
        $.each(tracks, function(_, track) {
          trackListHtml += `<li>${track.name}</li>`;
        });
        trackListHtml += '</ol>';
        
        $targetElement.hide().html(trackListHtml).slideDown(300);
        $btn.text('Piilota kappaleet');
      } else {
        $targetElement.html('<p>Kappalelistaa ei löytynyt.</p>');
        $btn.text('Näytä kappaleet');
      }
    })
    .fail(function() {
      $targetElement.html('<p>Virhe ladattaessa kappaleita.</p>');
      $btn.text('Näytä kappaleet');
    });
}

/**
 * Piirtää pylväskaavion albumien kuuntelukerroista käyttäen Chart.js-kirjastoa
 */
function renderAlbumsChart(albums) {
  if (!albums || albums.length === 0) return;

  $('#chart-wrapper').fadeIn(500);

  // Otetaan enintään 6 suosituinta albumia kaavioon luettavuuden vuoksi
  const topAlbums = albums.slice(0, 6);
  const labels = topAlbums.map(a => a.name.length > 18 ? a.name.substring(0, 18) + '...' : a.name);
  const playcounts = topAlbums.map(a => Number(a.playcount || 0));

  const ctx = $('#albums-chart')[0].getContext('2d');

  // Tuhotaan aiempi kaavio ennen uuden piirtämistä
  if (albumsChart) {
    albumsChart.destroy();
  }

  albumsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Kuuntelukerrat',
        data: playcounts,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#94a3b8' },
          grid: { color: '#1e2638' }
        },
        x: {
          ticks: { color: '#e1e7ed' },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Näyttää tyylikkään ilmoituksen SweetAlert2-kirjastolla
 */
function showAlert(title, text, icon) {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    background: '#131822',
    color: '#e1e7ed',
    confirmButtonColor: '#3b82f6'
  });
}