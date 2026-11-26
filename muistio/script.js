// ============================================================================
// 1. JAVASCRIPT SYNTAKSI, MUUTTUJAT, SYÖTTEET JA EHTOLAUSEET
// ============================================================================

// Tulostaa tekstin selaimen kehittäjätyökalujen (F12) konsoliin
console.log("Hello, World!");

// Näyttää ponnahdusikkunan (pop-up) käyttäjälle
alert("Tervetuloa nettisivulle!");

// Kysyy käyttäjältä tekstisyötteen ponnahdusikkunassa ja tallentaa sen muuttujaan
const visitorName = prompt("Mikä on nimesi?");

// Muuttujien määrittely: const kun arvo ei muutu, let kun arvoa muutetaan myöhemmin
const userName = "Nita";
let age = 22;
age = 23; // let-muuttujan arvoa voi muuttaa

// Tietotyypit: teksti (string), numero (number), totuusarvo (boolean), taulukko (array), olio (object)
const teksti = "Leopardi";
const numero = 10;
const onTotta = true;
const elaimet = ["Leopardi", "Kissa", "Koira"];
const henkilo = { nimi: "Nita", ika: 22 };

// Tekstin ja muuttujien yhdistäminen plus-merkillä (+)
console.log("Hello! My name is " + userName + " and I am " + age + " years old.");

// Ehtolause (if / else if / else) ja tiukka vertailu (=== tarkistaa arvon ja tyypin)
if (age >= 18) {
    console.log("You are an adult.");
} else {
    console.log("You are under 18.");
}

// Perinteinen funktio: ottaa vastaan parametrin (name) ja suorittaa koodin kutsuttaessa
function greetUser(name) {
    console.log("Hello, " + name + "!");
}
greetUser(visitorName); // Kutsutaan funktiota

// Funktio, joka palauttaa arvon return-komennolla
function laskeSumma(a, b) {
    return a + b;
}

// For-silmukka: käy läpi taulukon kaikki alkiot yksi kerrallaan
for (let i = 0; i < elaimet.length; i++) {
    console.log(elaimet[i]);
}


// ============================================================================
// 2. DOM SCRIPTING (HTML-ELEMENTTIEN HAKU JA MUOKKAUS)
// ============================================================================

// Hakee yksittäisen elementin sen id-attribuutin perusteella
const otsikko = document.getElementById("paaotsikko");

// Hakee ensimmäisen elementin, joka täsmää CSS-selektoriin (.luokka, #id tai tagi)
const nappi = document.querySelector("#lahetaNappi");

// Hakee KAIKKI elementit, jotka täsmäävät selektoriin (palauttaa listan)
const kaikkiKappaleet = document.querySelectorAll("p");

// Muuttaa elementin sisällä olevan pelkän tekstin (turvallinen tapa)
otsikko.textContent = "Uusi otsikko";

// Muuttaa elementin sisällä olevan HTML-koodin
otsikko.innerHTML = "<strong>Lihavoitu otsikko</strong>";

// Lukee tekstikentän (<input>) sisään kirjoitetun arvon
const syote = document.querySelector("#tekstikentta").value;

// Muuttaa elementin CSS-tyyliä suoraan JavaScriptistä
otsikko.style.color = "blue";
otsikko.style.backgroundColor = "lightgray";

// Lisää, poistaa tai vaihtaa elementin CSS-luokkia
otsikko.classList.add("korostus");
otsikko.classList.remove("piilotettu");
otsikko.classList.toggle("aktiivinen");

// Luo kokonaan uuden HTML-elementin ja lisää sen sivulle toisen elementin sisään
const uusiListaAlkio = document.createElement("li");
uusiListaAlkio.textContent = "Uusi listan kohta";
document.querySelector("#lista").appendChild(uusiListaAlkio);

// Poistaa elementin sivulta
uusiListaAlkio.remove();


// ============================================================================
// 3. TAPAHTUMAT (EVENTS) & DYNAMIC EVENT HANDLERS
// ============================================================================

// Lisää tapahtumankuuntelijan (click) nappiin ja suorittaa funktion klikattaessa
nappi.addEventListener("click", function() {
    alert("Nappia klikattiin!");
});

// Lomakkeen lähetyksen (submit) kuuntelu ja sivun uudelleenlatauksen estäminen
const lomake = document.querySelector("#lomake");
lomake.addEventListener("submit", function(event) {
    event.preventDefault(); // Estää selainta päivittämästä sivua lomakkeen lähetyksessä
    console.log("Lomake käsitelty ilman sivun latausta!");
});

// Dynamic Event Handler (Event Delegation): kuuntelee klikkauksia myös myöhemmin lisätyissä elementeissä
const lista = document.querySelector("#tehtavalista");
lista.addEventListener("click", function(event) {
    // event.target kertoo, mitä tarkkaa elementtiä listan sisällä klikattiin
    if (event.target.classList.contains("poista-nappi")) {
        event.target.parentElement.remove(); // Poistaa klikatun napin emoelementin (esim. <li>)
    }
});


// ============================================================================
// 4. LOCALSTORAGE (TIETOJEN TALLENNUS SELAIMEEN)
// ============================================================================

// Tallentaa yksittäisen tekstiarvon selaimen muistiin (avain, arvo)
localStorage.setItem("kayttaja", "Nita");

// Hakee tallennetun arvon avaimen perusteella (palauttaa null, jos ei löydy)
const tallennettuKayttaja = localStorage.getItem("kayttaja");

// Tallentaa taulukon tai olion muistiin (täytyy muuttaa ensin JSON-merkkijonoksi)
const suosikit = ["Leopardi", "Tiikeri"];
localStorage.setItem("suosikkiElaimet", JSON.stringify(suosikit));

// Hakee taulukon tai olion muistista (täytyy muuttaa JSON-tekstistä takaisin JS-muotoon)
const haetutSuosikit = JSON.parse(localStorage.getItem("suosikkiElaimet")) || [];

// Poistaa yhden kohteen tai tyhjentää koko LocalStoragen
localStorage.removeItem("kayttaja");
localStorage.clear();


// ============================================================================
// 5. AJAX-DEMO OSA 1: PERINTEINEN XMLHttpRequest (XML & JSON)
// ============================================================================

// Hakee XML-tiedoston palvelimelta perinteisellä XMLHttpRequest-oliolla
function lataaXML() {
    const xhttp = new XMLHttpRequest();
    
    // Määritellään mitä tapahtuu, kun palvelimen vastauksen tila muuttuu
    xhttp.onreadystatechange = function() {
        // readyState 4 = pyyntö valmis, status 200 = HTTP OK (onnistui)
        if (this.readyState === 4 && this.status === 200) {
            const xmlDoc = this.responseXML; // Vastaus XML-muodossa
            const otsikot = xmlDoc.getElementsByTagName("title");
            console.log(otsikot[0].textContent);
        }
    };
    
    // Avataan GET-pyyntö tiedostoon (true = asynkroninen) ja lähetetään se
    xhttp.open("GET", "data.xml", true);
    xhttp.send();
}


// ============================================================================
// 6. AJAX-DEMO OSA 2: JSON JA MODERNI FETCH API
// ============================================================================

// Muuntaa JSON-merkkijonon JavaScript-olioksi ja takaisin
const jsonTeksti = '{"nimi": "Nita", "ika": 22}';
const jsOlio = JSON.parse(jsonTeksti);           // JSON -> JS-olio
const takaisinTeksti = JSON.stringify(jsOlio);   // JS-olio -> JSON

// Hakee JSON-dataa ulkoisesta rajapinnasta (API) modernilla fetch-komennolla
function haeDataa() {
    fetch("https://api.esimerkki.fi/data")
        .then(function(response) {
            // Muuttaa palvelimen vastauksen JSON-muotoon
            return response.json();
        })
        .then(function(data) {
            // Käsitellään valmis JavaScript-data täällä
            console.log(data);
        })
        .catch(function(error) {
            // Tulostaa virheilmoituksen, jos verkkopyyntö epäonnistuu
            console.log("Virhe datan haussa: " + error);
        });
}

// Sama fetch-haku käyttäen async / await -syntaksia (selkeämpi tapa lukea)
async function haeDataaAsync() {
    try {
        const response = await fetch("https://api.esimerkki.fi/data");
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log("Virhe: " + error);
    }
}


// ============================================================================
// 7. AJAX-DEMO OSA 3: MODULARISOINTI & CORS
// ============================================================================

// --- tiedosto: apufunktiot.js ---
// export-avainsana jakaa funktion tai muuttujan muiden tiedostojen käyttöön
export function tervehdi(nimi) {
    return "Hei " + nimi;
}

// --- tiedosto: main.js ---
// import-avainsana tuo jaetun funktion käyttöön (HTML:ssä oltava <script type="module">)
import { tervehdi } from "./apufunktiot.js";
console.log(tervehdi("Nita"));

// CORS (Cross-Origin Resource Sharing) - MUISTISÄÄNTÖ TEORIAKOKEESEEN:
// Selain estää oletuksena AJAX/fetch-pyynnöt toiseen verkkotunnukseen (domain/portti).
// Kohdepalvelimen täytyy palauttaa otsake "Access-Control-Allow-Origin: *", 
// jotta selain sallii datan lukemisen.


// ============================================================================
// 8. ULKOISET KIRJASTOT / jQuery
// ============================================================================

// Odottaa, että koko HTML-sivu on latautunut ennen jQuery-koodin ajamista
$(document).ready(function() {

    // Valitsee elementin ($-merkki), muuttaa tekstin ja lisää CSS-tyylin
    $("#paaotsikko").text("Muokattu jQueryllä").css("color", "red");

    // Piilottaa ja näyttää elementin efektillä
    $(".laatikko").hide();
    $(".laatikko").fadeIn();

    // Tapahtumankuuntelija jQueryllä (click)
    $("#lahetaNappi").click(function() {
        $(this).toggleClass("aktiivinen");
    });

    // AJAX-kutsu JSON-datalle jQueryllä
    $.getJSON("https://api.esimerkki.fi/data", function(data) {
        console.log(data);
    });

});