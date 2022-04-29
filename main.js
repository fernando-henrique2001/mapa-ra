let map;
let markers = [];
let currentMarker;
let currentPosition;
let selectedTravelMode = "DRIVING";

async function initMap() {
    const mapElement = document.getElementById("map");

    // Verificar se serviço de geolocalizacao esta ativo:
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            console.log(position);
            currentPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            }

            // Iniciar Mapa com localizacao atual
            map = new google.maps.Map(mapElement, {
                center: currentPosition,
                zoom: 15
            });

            currentMarker = new google.maps.Marker({
                position: currentPosition,
                map: map,
                title: "Localização Atual",
                animation: google.maps.Animation.DROP,
                icon: "./pin.png",
            });
        });


    }

    // Directions Services.
    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer();

    await initAutoComplete();

    const btnSubmit = document.getElementById("btnSubmit");
    const btnDelete = document.getElementById("btnDelete");


    btnSubmit.addEventListener("click", (event) => {
        event.preventDefault();


        // Pegar instância de limites do Markers
        const bounds = new google.maps.LatLngBounds();
        markers.forEach((marker) => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);

        // Setar mapa com direções renderizadas.
        directionsDisplay.setMap(map);

        const origin = markers[0].getPosition();
        const destination = markers[1].getPosition();

        const request = {
            origin,
            destination,
            travelMode: selectedTravelMode,
        }

        // Setar Travel Mode

        directionsService.route(request, (result, status) => {
            if (status == "OK") {
                directionsDisplay.setDirections(result);
            } else {
                window.alert("Wrong Directions " + status);
            }
        })

        markers.map((marker) => {
            marker.setMap(null);
        })
    });

    const drivingMode = document.getElementById("driving");
    const walkingMode = document.getElementById("walking");

    drivingMode.addEventListener("click", (event) => {
        event.preventDefault();
        selectedTravelMode = "DRIVING";
    });

    walkingMode.addEventListener("click", (event) => {
        event.preventDefault();
        selectedTravelMode = "WALKING";
    });

    btnDelete.addEventListener("click", (event) => {
        event.preventDefault();
        initMap();
        markers = [];

        const inputDestination = document.getElementById("destination");
        const inputOrigin = document.getElementById("origin");

        inputDestination.value = "";
        inputOrigin.value = "";
    });


}

let inputOrigin;

async function initAutoComplete() {
    const options = {
        types: ["(cities)"],
    };

    // Endereço de origem
    inputOrigin = document.getElementById("origin");

    let autoCompleteOrigin = new google.maps.places.Autocomplete(inputOrigin, options);

    autoCompleteOrigin.addListener("place_changed", async () => await setMarker(autoCompleteOrigin, "Origin", "A"));

    // Endereço de destino

    const inputDestination = document.getElementById("destination");

    let autoCompleteDestination = new google.maps.places.Autocomplete(inputDestination, options);

    autoCompleteDestination.addListener("place_changed", async () => await setMarker(autoCompleteDestination, "Destination", "B"));
}

const setMarker = async (autoCompletePlace, title, label) => {
    const place = await autoCompletePlace.getPlace();
    const lat = await place.geometry.location.lat();
    const lng = await place.geometry.location.lng();
    const origin = { lat, lng };

    // Criar Marker usando as variaveis
    const Marker = new google.maps.Marker({
        position: origin,
        map: map,
        title,
        label,
        animation: google.maps.Animation.BOUNCE,
    });

    markers.push(Marker);
    map.panTo(origin);

    setTimeout(() => {
        Marker.setAnimation(null);
    }, 3000);
}

function setCurrentPositionMarker() {

    if (inputOrigin.value == "Localização atual") {
        markers.push(currentMarker);
        map.panTo(currentPosition);
    }

}