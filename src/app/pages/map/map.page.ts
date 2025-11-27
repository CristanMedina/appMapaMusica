import { Component, AfterViewInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonModal,
  IonButtons,
  IonItem,
  IonInput,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonIcon,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para el formulario
import { addIcons } from 'ionicons';
import { location, navigate, trash, close, add } from 'ionicons/icons';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Database } from '../../services/database';
import { MusicEvent } from '../../interface/event';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Necesario para ngModel
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonModal, IonButtons, IonItem, IonInput, IonLabel,
    IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
    IonIcon, IonFab, IonFabButton
  ],
})
export class MapPage implements AfterViewInit {
  private map!: L.Map;
  private routingControl: any;
  private markers: L.Marker[] = [];

  // Coordenada temporal donde se hizo click
  tempLatLng: L.LatLng | null = null;

  // Control del Modal de creación
  isModalOpen = false;

  // Objeto para el formulario
  newEvent: Partial<MusicEvent> = {
    hasAccessibility: false
  };

  constructor(public database: Database) {
    addIcons({ location, navigate, trash, close, add });
  }

  ngAfterViewInit() {
    this.initMap();
    // Cargar eventos existentes al iniciar el mapa
    setTimeout(() => {
        this.loadSavedEventsOnMap();
    }, 1000);
  }

  private initMap(): void {
    this.map = L.map('mapId').setView([32.5149, -117.0382], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    setTimeout(() => this.map.invalidateSize(), 500);

    // Evento CLICK en el mapa
    this.map.on('click', (e: L.LeafletMouseEvent) => {

      // SOLO ADMINS PUEDEN CREAR
      const user = this.database.currentUser();
      if (!user || !user.isAdmin) {
        // Opcional: Mostrar alerta de que solo admins pueden crear
        console.log('Solo admins pueden crear eventos');
        return;
      }

      this.tempLatLng = e.latlng;

      // Limpiamos el formulario y abrimos modal
      this.newEvent = { hasAccessibility: false, address: '' };

      // Intentamos obtener dirección automáticamente (Geocoding inverso simple)
      this.getAddressFromCoords(e.latlng.lat, e.latlng.lng);

      this.isModalOpen = true;
    });
  }

  // Cargar eventos desde la BD y poner marcadores
  private loadSavedEventsOnMap() {
    const events = this.database.events(); // Obtener del signal

    events.forEach(event => {
       this.createMarkerForEvent(event);
    });
  }

  // Crear marcador visual
  private createMarkerForEvent(event: MusicEvent) {
    const icon = L.icon({
        iconUrl: 'assets/icon/favicon.png', // Asegúrate de tener un icono o usa el default de leaflet
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    // Si no tienes icono propio, borra la opción {icon: icon} de abajo
    const marker = L.marker([event.lat, event.lng]).addTo(this.map);

    // HTML del Popup
    const popupContent = `
      <div style="font-family: sans-serif;">
        <h3 style="margin: 0; color: #ff00ff;">${event.title}</h3>
        <p style="font-weight: bold; margin: 5px 0;">${event.locationType}</p>
        <p style="margin: 5px 0;">${event.description}</p>
        <p style="font-size: 0.9em; color: #666;">📍 ${event.address}</p>

        <div style="margin-top: 5px;">
            <span style="background: #eee; padding: 2px 5px; border-radius: 4px; font-size: 0.8em;">${event.tags}</span>
        </div>

        ${event.hasAccessibility ? '<p style="color: green; font-size: 0.8em;">♿ Acceso Discapacitados</p>' : ''}

        <p style="font-size: 0.8em; margin-top: 5px;">Extra: ${event.extraInfo || 'Sin info extra'}</p>
        <p style="font-size: 0.7em; color: #999;">By: ${event.createdBy}</p>

        <button id="btn-delete-${event.id}" style="background:red; color:white; border:none; padding:5px; border-radius:4px; margin-top:5px; cursor:pointer;">Eliminar Evento</button>
      </div>
    `;

    marker.bindPopup(popupContent);

    // Listener para botón eliminar dentro del popup
    marker.on('popupopen', () => {
        const btnDelete = document.getElementById(`btn-delete-${event.id}`);
        if(btnDelete) {
            // Solo permitir borrar si es admin
            const user = this.database.currentUser();
            if(!user?.isAdmin) {
                btnDelete.style.display = 'none';
            }

            btnDelete.addEventListener('click', () => {
                this.deleteEvent(event.id, marker);
            });
        }
    });

    this.markers.push(marker);
  }

  // Guardar evento desde el Modal
  async saveEvent() {
    if (!this.tempLatLng || !this.newEvent.title) return;

    const user = this.database.currentUser();

    const fullEvent: MusicEvent = {
        id: new Date().getTime(),
        lat: this.tempLatLng.lat,
        lng: this.tempLatLng.lng,
        title: this.newEvent.title!,
        address: this.newEvent.address || 'Ubicación en mapa',
        description: this.newEvent.description || '',
        tags: this.newEvent.tags || 'General',
        locationType: this.newEvent.locationType || 'Evento',
        extraInfo: this.newEvent.extraInfo || '',
        hasAccessibility: this.newEvent.hasAccessibility || false,
        createdBy: user?.name || 'Anónimo'
    };

    // Guardar en BD
    await this.database.addEvent(fullEvent);

    // Poner en mapa
    this.createMarkerForEvent(fullEvent);

    // Cerrar y limpiar
    this.isModalOpen = false;
    this.tempLatLng = null;
  }

  cancelAdd() {
    this.isModalOpen = false;
    this.tempLatLng = null;
  }

  async deleteEvent(id: number, marker: L.Marker) {
    if(confirm('¿Seguro que quieres borrar este evento?')) {
        await this.database.deleteEvent(id);
        this.map.removeLayer(marker);
        this.markers = this.markers.filter(m => m !== marker);
    }
  }

  // Utilidad para buscar dirección (opcional visual)
  private getAddressFromCoords(lat: number, lng: number) {
     const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
     fetch(url)
       .then(res => res.json())
       .then(data => {
          if(data && data.display_name) {
              this.newEvent.address = data.display_name;
          }
       })
       .catch(() => console.log('No se pudo obtener dirección automática'));
  }

  // --- Botones de utilidad ---
  locateUser() {
    this.map.locate({ setView: true, maxZoom: 16 });
    this.map.once('locationfound', (e: any) => {
        L.marker(e.latlng).addTo(this.map).bindPopup('Tú estás aquí').openPopup();
    });
  }

  clearRoutes() {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
  }
}
