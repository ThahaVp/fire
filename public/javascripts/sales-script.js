var modalWrap = null;
var map = null;
var lat = null, lng = null, street_address = null;

const setLoc = () => {

  lat = map.getCenter().lat()
  lng = map.getCenter().lng()
  getAddress();

}

function submitStoreData() {

  if (lat != null && lng != null && street_address != null) {

    const storeName = document.getElementById("name").value.trim()
    const storeDescription = document.getElementById("description").value.trim()
    const co1 = document.getElementById("co1").value.trim()
    const co2 = document.getElementById("co2").value.trim()
    const whatsppNum = document.getElementById("wh").value.trim()
    const ManagerName = document.getElementById("manager_name").value.trim()
    const ManagerContact = document.getElementById("manager_contact").value.trim()
    const fb = document.getElementById("fb").value.trim()
    const inst = document.getElementById("in").value.trim()

    if (storeName != "" && storeDescription != "" && co1.length == 10) {

      var xhr = new XMLHttpRequest();
      xhr.open("POST", 'http://localhost:3000/sales/add-store', true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          console.log(this.response)
        }
      }

      xhr.send(
        "ad=" + street_address +
        "&lat=" + lat +
        "&lng=" + lng +
        "&title=" + storeName +
        "&description=" + storeDescription +
        "&contact1=" + co1 +
        "&contact2=" + co2 +
        "&whatsapp=" + whatsppNum +
        "&in=" + inst +
        "&fb=" + fb +
        "&man_name=" + ManagerName +
        "&man_cont=" + ManagerContact
      );

    }


  }

}

function getAddress() {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();

    var method = 'GET';
    var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=true&key=AIzaSyBaxdI9cgj-Cln97faKXvBHh4q-ccyTZNY';
    var async = true;

    request.open(method, url, async);
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        if (request.status == 200) {
          var data = JSON.parse(request.responseText).results;
          console.log(data)
          for (var i = 0; i < data.length; i++) {
            var types = data[i].types
            if (types[0] == "street_address") {
              street_address = data[i].formatted_address
              document.getElementById("location-div").innerHTML = "Location : <br>" + street_address

              var reqBody = {
                'Body': street_address
              };


            }
            else
              continue
          }


        }
        else {
          reject(request.status);
        }
      }
    };
    request.send();
  });
};

const showModal = () => {
  if (modalWrap !== null) {
    modalWrap.remove();
  }

  modalWrap = document.createElement('div');
  modalWrap.innerHTML = `
  <div class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">

        <div class="modal-header p-3">
          <h6 class="modal-title">Set Location</h6>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" style="padding:0;">
        <div id="map">
        
        </div>
        <div style="width:30px;height:30px;z-index:5;background:red; position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);"></div>
          
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-success" onclick="setLoc()" data-bs-dismiss="modal">Continue</button></a>
        </div>
      </div>
    </div>
  </div>
`;


  document.body.append(modalWrap);

  var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'));
  modal.show();

  let infoWindow;
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 9.9312, lng: 76.2673 },
    zoom: 16,
  });

  infoWindow = new google.maps.InfoWindow();

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        infoWindow.setPosition(pos);
        infoWindow.setContent("Current Location.");
        infoWindow.open(map);
        map.setCenter(pos);

        // The marker, positioned at pos

      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  map.addListener("center_changed", () => {
    // doing nothing here
  });

}



function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}


