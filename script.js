'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
//TODO set querySelector instead of getElementById
const mapContainer = document.getElementById('map-container');

const svgImg = `<svg version="1.1" height="60px" width="38px" viewBox="0 0 365 560" xmlns="http://www.w3.org/2000/svg">	
<path style="fill:#aa0000" id="path2" d="M182.9,551.7c0,0.1,0.2,0.3,0.2,0.3S358.3,283,358.3,194.6c0-130.1-88.8-186.7-175.4-186.9   C96.3,7.9,7.5,64.5,7.5,194.6c0,88.4,175.3,357.4,175.3,357.4S182.9,551.7,182.9,551.7z M122.2,187.2c0-33.6,27.2-60.8,60.8-60.8   c33.6,0,60.8,27.2,60.8,60.8S216.5,248,182.9,248C149.4,248,122.2,220.8,122.2,187.2z" fill="#00AEEF" /> </svg>`

// TODO: Reafctor. Set a config object instead of parameters
const Map = function(latitude, longitude, zoom=15, target='map', markerSrc='./marker.svg', markerScale=0.5){
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.target = target;
    this.markerScale = markerScale;
    this.markers = [];
    this.markerSrc = markerSrc;
}

Map.prototype._getMarkerStyle = function(){
    const  markerIcon = new ol.style.Icon(
      {
         src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgImg)}`, 
         anchor: [0.5, 1]
      });
    markerIcon.setScale(this.markerScale);
    const markerStyle = new ol.style.Style({ image: markerIcon }); 
    return markerStyle
}


Map.prototype._createPopup = function(text){
   let popupContainer = document.createElement('div');
   popupContainer.classList.add('ol-popup');
   popupContainer.classList.add('cycling-popup');

   let popupCloser = document.createElement('a'); 
   popupCloser.setAttribute('href', '#');
   popupCloser.classList.add('ol-popup-closer');

   //TODO: Add individual id
   let popupContent = document.createElement('div'); 
   popupContent.setAttribute('id', 'popup-content');
   popupContent.classList.add('ol-popup-content');
   popupContent.innerHTML = text;

   popupContainer.appendChild(popupCloser);
   popupContainer.appendChild(popupContent);

   popupContainer.addEventListener('mouseover', function(){
        console.log('Popup hovered');
        popupContainer.parentElement.classList.add('active-popup');
        console.log(popupContainer.classList);
   });
   popupContainer.addEventListener('mouseout', function(){
        console.log('Popup released');
        popupContainer.parentElement.classList.remove('active-popup');
        console.log(popupContainer.classList);
   });
   mapContainer.appendChild(popupContainer); 
   console.log(popupContainer);
   return popupContainer;
}

Map.prototype.setMark = function(latitude, longitude, message){
    const Pos = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude])),
        type: 'marker' 
    });
    Pos.setStyle(this._getMarkerStyle());
    this.vectorSource.addFeature(Pos);

    const popup = this._createPopup('Hello', 'popup');
    // TODO: Why these values?
    popup.style.left = '-10rem';
    popup.style.bottom = '32px';

    Pos.attributes = { "message": popup };

    const overlay = new ol.Overlay({ element: popup });
    overlay.setPosition(ol.proj.fromLonLat([longitude, latitude]));
    this.map.addOverlay(overlay);
}

Map.prototype.on = function(evtType, handler){
    this.map.on(evtType, handler);
}

Map.prototype.createMap = function(){
    this.vectorSource = new ol.source.Vector({});
    this.map = new ol.Map({
          target: this.target,
          layers: [
            new ol.layer.Tile({
              source: new ol.source.OSM({
                url: 'https://{a-c}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
              })
            }),
            new ol.layer.Vector({
                source: this.vectorSource
            })
          ],
          view: new ol.View({
            center: ol.proj.fromLonLat([this.longitude, this.latitude]),
            zoom: this.zoom 
          })
        });
    return this; 
}

if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position){
       const { latitude } = position.coords;
       const { longitude } = position.coords;
       console.log(`My coords: ${position.coords.longitude}, ${position.coords.latitude}`);
       const map = new Map(latitude, longitude);
       map.createMap().setMark(latitude, longitude);
       map.on('click', function(evt){
          const [longitude, latitude] = ol.proj.toLonLat(evt.coordinate);
          map.setMark(latitude, longitude, 'Woo-hoo');
       });
    }, function(){
        alert('Could not get your position');
    });
}

