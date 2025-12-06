import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Database } from '../../services/database';
import { MusicEvent } from '../../interface/event';

import { addIcons } from 'ionicons';
import { 
  searchOutline, locationOutline, calendarOutline, 
  heart, heartOutline, mapOutline, flashOutline, 
  personOutline, optionsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EventsPage implements OnInit {

  // Ubicación simulada del usuario (Centro de Tijuana)
  // Para una app real, usarías Geolocation de Capacitor
  userLat = 32.5149;
  userLng = -117.0382;

  constructor(public database: Database) {
    addIcons({ 
      searchOutline, locationOutline, calendarOutline, 
      heart, heartOutline, mapOutline, flashOutline, 
      personOutline, optionsOutline
    });
  }

  ngOnInit() {}

  // Getter para "Cerca de ti": Calcula la distancia de cada evento
  get nearbyEvents() {
    const allEvents = this.database.events();
    
    const eventsWithDistance = allEvents.map(event => {
      const dist = this.getDistanceFromLatLonInKm(this.userLat, this.userLng, event.lat, event.lng);
      return {
        ...event,
        distanceNumeric: dist,
        distance: dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`
      };
    });

    // Ordenamos del más cercano al más lejano y mostramos solo 5
    return eventsWithDistance.sort((a, b) => a.distanceNumeric - b.distanceNumeric).slice(0, 5);
  }

  // Getter para "Recomendados": Muestra todos los eventos (los más nuevos primero)
  get recommendedEvents() {
    return [...this.database.events()].reverse();
  }

  // --- LÓGICA DE FAVORITOS ---
  toggleFavorite(event: MusicEvent) {
    // Al modificar esto aquí, se actualiza en el servicio Database
    // y por lo tanto aparece en la pestaña de Favoritos del Perfil
    event.isFavorite = !event.isFavorite;
    console.log(`Evento "${event.title}" favorito: ${event.isFavorite}`);
  }

  // Fórmula de Haversine para calcular distancia entre coordenadas
  getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radio de la tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}