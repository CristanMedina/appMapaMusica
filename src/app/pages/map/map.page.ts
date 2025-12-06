import { Component, AfterViewInit } from '@angular/core';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonModal, IonButtons, IonItem, IonInput, IonLabel,
  IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
  IonIcon, IonFab, IonFabButton, IonImg,
  IonDatetime, IonDatetimeButton, IonPopover
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { location, navigate, trash, close, add, camera, image, calendar } from 'ionicons/icons';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Database } from '../../services/database';
import { MusicEvent } from '../../interface/event';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonModal, IonButtons, IonItem, IonInput, IonLabel,
    IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
    IonIcon, IonFab, IonFabButton, IonImg,
    IonDatetime, IonDatetimeButton, IonPopover
  ],
})
export class MapPage implements AfterViewInit {
  private map!: L.Map;
  private routingControl: any;
  private markers: L.Marker[] = [];
  
  private userLatLng: L.LatLng | null = null;

  tempLatLng: L.LatLng | null = null;
  isModalOpen = false;
  
  // Objeto para el nuevo evento, incluyendo imagen y fecha
  newEvent: Partial<MusicEvent> = {
    hasAccessibility: false,
    image: '',
    date: ''
  };

  constructor(public database: Database) {
    addIcons({ location, navigate, trash, close, add, camera, image, calendar });
  }

  ngAfterViewInit() {
    this.initMap();
    // Pequeño retraso para asegurar que el DOM del mapa esté listo
    setTimeout(() => {
        this.loadSavedEventsOnMap();
    }, 1000);
  }

  private initMap(): void {
    // Coordenadas iniciales (Tijuana)
    this.map = L.map('mapId').setView([32.5149, -117.0382], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Ajuste de tamaño por si el contenedor cambió
    setTimeout(() => this.map.invalidateSize(), 500);

    // Evento al hacer clic en el mapa para crear un marcador
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const user = this.database.currentUser();
      // Validación: Solo si hay usuario (y si es admin, opcional)
      if (!user) {
        // Podrías mostrar un toast o alert aquí
        console.log('Usuario no autenticado');
        return;
      }
      
      // Si quieres restringir solo a admins:
      // if (!user.isAdmin) return;

      this.tempLatLng = e.latlng;
      
      // Reseteamos el formulario con la fecha de hoy por defecto
      this.newEvent = { 
        hasAccessibility: false, 
        address: '', 
        image: '',
        date: new Date().toISOString() 
      };
      
      // Intentamos obtener la dirección automáticamente
      this.getAddressFromCoords(e.latlng.lat, e.latlng.lng);
      
      this.isModalOpen = true;
    });
  }

  private loadSavedEventsOnMap() {
    // Limpiamos marcadores previos
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const events = this.database.events();
    events.forEach(event => {
       this.createMarkerForEvent(event);
    });
  }

  private createMarkerForEvent(event: MusicEvent) {
    const icon = L.icon({
        iconUrl: 'assets/icon/favicon.png', // Asegúrate de tener este icono
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const marker = L.marker([event.lat, event.lng]).addTo(this.map);

    // HTML para la imagen dentro del popup
    const imgHtml = event.image 
      ? `<img src="${event.image}" style="width:100%; height:120px; object-fit:cover; border-radius:8px; margin-bottom:5px;">` 
      : '';

    // HTML para la fecha dentro del popup
    const dateHtml = event.date 
      ? `<p style="margin: 0; color: #00ffff; font-weight: bold; font-size: 0.85em;">📅 ${event.date.split('T')[0]}</p>` 
      : '';

    const popupContent = `
      <div style="font-family: sans-serif; min-width: 200px;">
        ${imgHtml}
        <h3 style="margin: 0; color: #ff00ff;">${event.title}</h3>
        ${dateHtml}
        <p style="font-weight: bold; margin: 5px 0;">${event.locationType}</p>
        <p style="margin: 5px 0;">${event.description}</p>
        <p style="font-size: 0.9em; color: #666;">📍 ${event.address}</p>

        <div style="margin-top: 5px;">
            <span style="background: #eee; padding: 2px 5px; border-radius: 4px; font-size: 0.8em;">${event.tags}</span>
        </div>

        ${event.hasAccessibility ? '<p style="color: green; font-size: 0.8em;">♿ Acceso para personas discapacitadas</p>' : ''}

        <p style="font-size: 0.8em; margin-top: 5px;">Extra: ${event.extraInfo || 'Sin info extra'}</p>
        <p style="font-size: 0.7em; color: #999;">By: ${event.createdBy}</p>

        <div style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
            <button id="btn-navigate-${event.id}" style="background: #00ffff; color: #000; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                🚗 Cómo llegar
            </button>
            
            <button id="btn-delete-${event.id}" style="background: red; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                Eliminar
            </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    // Event listeners para los botones dentro del popup
    marker.on('popupopen', () => {
        const btnDelete = document.getElementById(`btn-delete-${event.id}`);
        if(btnDelete) {
            const user = this.database.currentUser();
            // Solo admin o el creador (opcional) puede borrar
            if(!user?.isAdmin) {
                btnDelete.style.display = 'none';
            }
            btnDelete.addEventListener('click', () => {
                this.deleteEvent(event.id, marker);
            });
        }

        const btnNavigate = document.getElementById(`btn-navigate-${event.id}`);
        if(btnNavigate) {
            btnNavigate.addEventListener('click', () => {
                this.calculateRoute(event.lat, event.lng);
                this.map.closePopup();
            });
        }
    });

    this.markers.push(marker);
  }

  // --- LÓGICA DE FOTO (CÁMARA) ---
  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt // Pregunta si Cámara o Galería
      });

      if (image.webPath) {
        this.newEvent.image = image.webPath;
      }
    } catch (error) {
      console.log('No se seleccionó imagen o usuario canceló');
    }
  }

  // --- LÓGICA DE RUTA (LEAFLET ROUTING MACHINE) ---
  calculateRoute(destLat: number, destLng: number) {
    if (!this.userLatLng) {
        alert('Primero necesitamos saber tu ubicación. Presiona el botón de navegación abajo a la derecha.');
        this.locateUser();
        return;
    }

    // Borramos rutas anteriores
    this.clearRoutes();

    // @ts-ignore: Ignoramos el error de tipos porque la librería sí tiene osrmv1 en JS
    this.routingControl = L.Routing.control({
        waypoints: [
            this.userLatLng,
            L.latLng(destLat, destLng)
        ],
        // Usamos (L.Routing as any) para evitar error TS2339
        router: (L.Routing as any).osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        lineOptions: {
            styles: [{ color: '#ff00ff', weight: 6 }] // Estilo Neón Rosa
        },
        createMarker: () => null, // No crear marcadores extra A/B
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: true 
    }).addTo(this.map);
  }

  async saveEvent() {
    if (!this.tempLatLng || !this.newEvent.title) return;

    const user = this.database.currentUser();
    const createdBy = user?.name ? user.name.split('@')[0] : 'Anónimo';

    // Formateamos la fecha a YYYY-MM-DD para guardarla limpia
    const dateFormatted = this.newEvent.date ? this.newEvent.date.split('T')[0] : '';

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
        image: this.newEvent.image || 'assets/event-placeholder.jpg',
        date: dateFormatted,
        isFavorite: false,
        createdBy: createdBy
    };

    await this.database.addEvent(fullEvent);
    this.createMarkerForEvent(fullEvent);
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

  locateUser() {
    this.map.locate({ setView: true, maxZoom: 16 });
    this.map.once('locationfound', (e: any) => {
        this.userLatLng = e.latlng;
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