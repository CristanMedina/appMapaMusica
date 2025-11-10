import { Component, AfterViewInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
  ],
})
export class MapPage implements AfterViewInit {
  private map!: L.Map;
  private routingControl: any;
  private markers: L.Marker[] = [];
  private selectedMarker: L.Marker | null = null;

  ngAfterViewInit() {
    this.initMap();
    this.setupButtons();
  }

  private initMap(): void {
    this.map = L.map('mapId').setView([32.5149, -117.0382], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    setTimeout(() => this.map.invalidateSize(), 500);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const marker = L.marker(e.latlng, { draggable: true }).addTo(this.map);
      marker.bindPopup('Marcador agregado.').openPopup();

      marker.on('click', () => {
        this.selectedMarker = marker;
        marker.bindPopup('Marcador seleccionado para ruta.').openPopup();
      });

      this.markers.push(marker);
    });
  }

  private setupButtons(): void {
    const btnLocation = document.getElementById('btnLocation');
    const btnClear = document.getElementById('btnClear');
    const btnRouteToMarker = document.getElementById('btnRouteToMarker');
    const btnClearMarkers = document.getElementById('btnClearMarkers');
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;

    btnLocation?.addEventListener('click', () => this.locateUser());
    btnClear?.addEventListener('click', () => this.clearRoutes());
    btnRouteToMarker?.addEventListener('click', () => this.routeToSelectedMarker());
    btnClearMarkers?.addEventListener('click', () => this.clearMarkers());
    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchAddress(searchInput.value);
    });
  }

  private locateUser(): void {
    this.map.locate({ setView: true, maxZoom: 16 });
    this.map.once('locationfound', (e: any) => {
      L.marker(e.latlng).addTo(this.map).bindPopup('Estás aquí').openPopup();
    });
  }

  private clearRoutes(): void {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
  }

  private clearMarkers(): void {
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];
    this.selectedMarker = null;
  }

  private searchAddress(address: string): void {
    if (!address) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const dest = L.latLng(parseFloat(lat), parseFloat(lon));
          const marker = L.marker(dest).addTo(this.map);
          marker.bindPopup(`Destino: ${address}`).openPopup();
          this.map.setView(dest, 14);
          this.markers.push(marker);
        } else {
          alert('Dirección no encontrada');
        }
      })
      .catch(() => alert('Error al buscar dirección'));
  }

  private routeToSelectedMarker(): void {
    if (!this.selectedMarker) {
      alert('Selecciona un marcador primero (clic en él)');
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const userLoc = L.latLng(pos.coords.latitude, pos.coords.longitude);
      const dest = this.selectedMarker!.getLatLng();

      this.clearRoutes();
      this.routingControl = L.Routing.control({
        waypoints: [userLoc, dest],
        routeWhileDragging: true,
        lineOptions: { styles: [{ color: 'blue', weight: 4 }] },
      }).addTo(this.map);
    });
  }
}
