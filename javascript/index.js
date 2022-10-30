"use strict";
// Global DOM Variables
const body = document.querySelector("body")
const checkbox = document.querySelector(".checkbox")
const loader = document.querySelector(".loader-div")

// Global Variables
let apiData = []
const timer = 1000

// Api Fetching Data Function
const fetchData = async (key, apiKey) => {
  let endpoint;
  switch (key) {
    case "All":
      endpoint = `https://restcountries.com/v3.1/${apiKey}`
      break
    case "Name":
      endpoint = `https://restcountries.com/v3.1/name/${apiKey}?fullText=true`
      break
    default:
      break
  }

  try {
    const response = await fetch(endpoint)

    if (!response.ok) {
      const message = `Error Occurred: Page Not Found ${response.status}`

      throw new Error(message)
    }
    const data = await response.json()

    return data
  } catch (err) {
    console.error(err.message)

    document.querySelector("main").innerHTML = `<main>
      <div class="container d-flex flex-column justify-content-start align-items-center">
        <img class="mb-5 world-icon" src="../assets/images/world-dark.png" alt="world-icon" />
        <h1 class="error">${err.message}</h1>
      </div>
    </main>`
  }
}

// Hide Loader
const hideLoader = () => {
  setTimeout(() => {
    loader.classList.add("d-none")
  }, timer)
}

// Change Background Color
const changeBackColor = () => {
  const countryFilter = document.querySelector(".input-group")
  const cards = document.querySelectorAll(".card")
  const worldImage = document.querySelector(".world-icon")

  if (body.classList.contains("background-light")) {
    body.classList = "background-dark"

    if (worldImage) {
      worldImage.setAttribute("src", "../assets/images/world-light.png")
    }

    if (countryFilter) {
      countryFilter.classList = "input-group input-group-dark"
    }

    if (cards) {
      for (let card of cards) {
        card.classList = "card card-dark"
      }
    }
  } else {
    body.classList = "background-light"

    if (worldImage) {
      worldImage.setAttribute("src", "../assets/images/world-dark.png")
    }

    if (countryFilter) {
      countryFilter.classList = "input-group input-group-light"
    }

    if (cards) {
      for (let card of cards) {
        card.classList = "card card-light"
      }
    }
  }
}

checkbox.addEventListener("change", changeBackColor)

// Pages
if (document.querySelector("#home")) {
  // Main DOM Variables
  const countriesDiv = document.querySelector(".countries-div")
  const paginationDiv = document.querySelector(".pagination")
  const dropdown = document.querySelector(".dropdown-menu")
  const search = document.querySelector("input.search")

  //Main Variables
  let rows = 32

  // Render Cards
  const renderCards = (data, rowsPerPage, page) => {
    if (data.length !== 0) {
      countriesDiv.innerHTML = ""
      page--
      let start = page * rowsPerPage
      let end = start + rowsPerPage
      const compactedData = data.slice(start, end)

      compactedData.map((items) => {
        const { name, flags, population, region, capital } = items
        const div = document.createElement("div")

        div.classList = `card card-light`

        div.innerHTML = `
        <img src=${flags.png} class="${
          flags.png === undefined ? "d-none" : "card-img-top"
        }" alt="${name.official}-flag" />
        <div class="card-body d-flex flex-column justify-content-center">
          <h5>${name.common === undefined ? "No Data" : name.common}</h5>
          <div class="description">
            <p><strong class="text-bold">Population:</strong> ${
              population === undefined
                ? "No Data"
                : population.toLocaleString("en-US")
            }</p>
            <p><strong class="text-bold">Region:</strong> ${
              region === undefined ? "No Data" : region
            }</p>
            <p><strong class="text-bold">Capital:</strong> ${
              capital !== undefined ? capital[0] : "No Data"
            }</p>
          </div>
        </div>
        `

        countriesDiv.appendChild(div)
        
        div.addEventListener("click", () => {
          localStorage.setItem("countryName", `${name.common}`)
          location.href = "country-page.html"
        })
      })
    } else {
      countriesDiv.innerHTML = ""
      paginationDiv.innerHTML = ""
    }
  }

  // Filter Functions
  const filterRegion = (storedRegion, data) => {
    let filteredRegion = data.filter((item) =>
      storedRegion === "All" ? item : item.region === storedRegion
    )

    renderCards(filteredRegion, rows, localStorage.getItem("paginIndex"))
    createPagination(filteredRegion, rows)
  }

  const filterSearch = (data, searchValue) => {
    if (searchValue !== "") {
      let filteredName = data.filter((item) => {
        let countryName = item.name.common.toLowerCase()
        let searchedName = searchValue.toLowerCase()

        return countryName.includes(searchedName)
      })

      renderCards(filteredName, rows, localStorage.getItem("paginIndex"))
      createPagination(filteredName, rows)
    } else {
      renderCards(data, rows, localStorage.getItem("paginIndex"))
      createPagination(data, rows)
    }
  }

  // Search
  search.addEventListener("input", () => {
    let searchValue = search.value

    localStorage.setItem("paginIndex", "1")
    filterSearch(apiData, searchValue)
  })

  // Dropdown List
  const dropdownList = [
    "All",
    "Africa",
    "Americas",
    "Antarctic",
    "Asia",
    "Europe",
    "Oceania"
  ]

  dropdownList.map((region) => {
    let listItem = document.createElement("li")

    listItem.classList = `dropdown-item ${region}`
    listItem.innerHTML = region;
    dropdown.appendChild(listItem)

    if (listItem.classList.contains(localStorage.getItem("currentRegion"))) {
      listItem.classList.add("active")
    }

    listItem.addEventListener("click", () => {
      const allDropdownItem = document.querySelectorAll(".dropdown-item")

      for (let item of allDropdownItem) {
        item.classList.remove("active")
      }

      listItem.classList.add("active")
      localStorage.setItem("currentRegion", `${region}`)
      localStorage.setItem("paginIndex", "1")

      filterRegion(localStorage.getItem("currentRegion"), apiData)
    })
  })

  // Fetch Data From Api
  window.onload = () => {
    fetchData("All", "all").then((data) => {
      if (data) {
        apiData = data
        apiData.sort((a, b) =>
          a.name.common > b.name.common
            ? 1
            : b.name.common > a.name.common
            ? -1
            : 0
        )
        hideLoader()

        setTimeout(() => {
          if (localStorage.getItem("paginIndex") == null) {
            localStorage.setItem("paginIndex", "1")

          }
          if (localStorage.getItem("currentRegion") == null) {
            localStorage.setItem("currentRegion", "All")

            filterRegion(localStorage.getItem("currentRegion"), apiData)
          } else {
            filterRegion(localStorage.getItem("currentRegion"), apiData)
          }
        }, timer)
      } else {
        apiData = []
      }
    })
  }

  // Create Pagination
  const createPagination = (data, rowsPerPage) => {
    paginationDiv.innerHTML = ""

    let pageCount = Math.ceil(data.length / rowsPerPage)

    for (let i = 1; i <= pageCount; i++) {
      let btn = paginationButton(i)

      btn.classList.add(i)
      paginationDiv.appendChild(btn)

      if (btn.classList.contains(localStorage.getItem("paginIndex"))) {
        btn.classList.add("active")
      }

      btn.addEventListener("click", () => {
        let button = document.querySelectorAll(".pagination li.page-item")
        
        for (let item of button) {
          item.classList.remove("active")
        }

        localStorage.setItem("paginIndex", `${i}`)

        let paginationIndex = localStorage.getItem("paginIndex")

        btn.classList.add("active")

        renderCards(data, rowsPerPage, paginationIndex)

        location.href = "#home"
      })
    }
  }

  function paginationButton(page) {
    let button = document.createElement("li")
    let span = document.createElement("span")

    span.classList = "page-link"
    button.classList = "page-item"

    span.innerHTML = page
    button.appendChild(span)

    return button
  }
} else if (document.querySelector("#country-page")) {
  // Main DOM Variables
  const countryDiv = document.querySelector(".country-div")
  // Get Country Name From Local Storage
  const currentCountryName = localStorage.getItem("countryName")

  // Fetch Data From Api
  window.onload = () => {
    fetchData("Name", currentCountryName).then((data) => {
      if (data) {
        apiData = data[0]

        hideLoader()

        setTimeout(() => renderCurrentCountry(), timer)

        document.title = `Country's Information | ${apiData.name.common}`
      } else {
        apiData = []
      }
    })
  }

  // Render Current Country
  const renderCurrentCountry = () => {
    const {
      name,
      flags,
      coatOfArms,
      population,
      region,
      subregion,
      capital,
      area,
      altSpellings,
      currencies,
      languages,
      capitalInfo,
      latlng
    } = apiData

    if (apiData.length !== []) {
      countryDiv.innerHTML = `
          <div class="col-lg-7 flag d-flex justify-content-start align-items-start">
            <img class="${flags.svg === undefined ? "d-none" : ""}" src=${
        flags.svg
      } alt="${name.official}-flag" title="${name.common} Flag" />
            <img width="100" height="100" class="${
              coatOfArms.svg === undefined ? "d-none" : ""
            }" src=${coatOfArms.svg} alt="${
        name.official
      }-coat-of-arms" title="${name.common} Coat Of Arms"/>
          </div>

          <div
            class="col-lg-5 country-info d-flex flex-column justify-content-center"
          >
            <h1 class="country-name">${
              name.common === undefined ? "No Data" : name.common
            }</h1>
            <p><strong class="text-bold">Area:</strong> ${
              area === undefined ? "No Data" : area.toLocaleString("en-US")
            }(Km²)</p>
            <p><strong class="text-bold">Native Name:</strong> ${
              name.nativeName === undefined
                ? "No Data"
                : Object.values(name.nativeName)[0].common
            }</p>
            <p><strong class="text-bold">Population:</strong> ${
              population === undefined
                ? "No Data"
                : population.toLocaleString("en-US")
            }</p>
            <p><strong class="text-bold">Region:</strong> ${
              region === undefined ? "No Data" : region
            }</p>
            <p><strong class="text-bold">Sub Region:</strong> ${
              subregion === undefined ? "No Data" : subregion
            }</p>
            <p><strong class="text-bold">Capital:</strong> ${
              capital !== undefined ? capital[0] : "No Data"
            }</p>
            <p><strong class="text-bold">Country Sign:</strong> ${
              altSpellings === undefined ? "No Data" : altSpellings[0]
            }</p>
            <p><strong class="text-bold">Currencies:</strong> ${
              currencies === undefined
                ? "No Data"
                : Object.values(currencies)[0].name + " - "
            } ${
        currencies === undefined ? "" : Object.values(currencies)[0].symbol
      }</p>
            <p><strong class="text-bold">Languages:</strong> ${
              languages === undefined
                ? "No Data"
                : Object.values(languages).map((lang) => lang)
            }</p>
        </div>

        <div class="country-map col-lg-12 d-flex justify-content-center align-items-center">
          <div id='map'></div>
        </div>
      `
    } else {
      countryDiv.innerHTML = ""
    }

    // Mapbox Map
    // Map Coordinates And Description
    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates:
              capitalInfo.latlng === undefined
                ? [latlng[1], latlng[0]]
                : [capitalInfo.latlng[1], capitalInfo.latlng[0]]
          },
          properties: {
            title: "Capital City",
            description: capital === undefined ? "No Data" : capital[0]
          }
        }
      ]
    }

    // Map Configuration
    mapboxgl.accessToken = "pk.eyJ1IjoiZ29nZWxhIiwiYSI6ImNsOTh4MWR2bTBiMXYzd3A4bjM1bzVqd2kifQ.XD51XAa3grQuMtKDIt92JQ"

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/gogela/cl9ogs3fw00mi15ogxf8h85fh",
      center: geojson.features[0].geometry.coordinates,
      zoom: area > 800000 ? 3 : 5,
      projection: "globe"
    })

    map.on("style.load", () => {
      map.setFog({})
    })

    // Map Controls
    map.addControl(new mapboxgl.NavigationControl())

    // Map Marker
    const marker = new mapboxgl.Marker({
      draggable: true
    })
      .setLngLat(geojson.features[0].geometry.coordinates)
      .addTo(map)

    // Mark Popup
    new mapboxgl.Marker()
      .setLngLat(geojson.features[0].geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h1 class="text-center">${name.common}</h1>
          <h5 class="text-center"><strong>${geojson.features[0].properties.title}</strong>: ${geojson.features[0].properties.description}</h5>`
        )
      )
      .addTo(map)
  }
}