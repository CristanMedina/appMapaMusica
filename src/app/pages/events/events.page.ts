import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// 1. Importar iconos y addIcons
import { addIcons } from 'ionicons';
import { 
  searchOutline, 
  locationOutline, 
  calendarOutline, 
  heart, 
  heartOutline,
  mapOutline,
  flashOutline,
  personOutline,
  optionsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EventsPage implements OnInit {

  nearbyEvents = [
    {
      id: 1,
      title: 'Neon Party',
      distance: '0.5 km',
      date: 'Hoy, 22:00',
      image: 'https://img.freepik.com/foto-gratis/amigos-tintinean-vasos-bebida-bar-moderno_1150-18971.jpg?semt=ais_hybrid&w=740&q=80',
    },
    {
      id: 2,
      title: 'Jazz Night',
      distance: '1.2 km',
      date: 'Mañana, 20:00',
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 3,
      title: 'Rooftop Vibes',
      distance: '2.0 km',
      date: 'Sab, 18:00',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbYrBtxjrv2KDdrCy0Q0OWBOrFlaoXg66zJQ&s',
    }
  ];

  recommendedEvents = [
    {
      id: 4,
      title: 'Cyberpunk Festival',
      location: 'Arena Central',
      date: '15 Nov • 19:00',
      price: '$200',
      tags: ['Electrónica', 'Techno'],
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      isFavorite: false
    },
    {
      id: 5,
      title: 'Rock Legends',
      location: 'Estadio Norte',
      date: '20 Nov • 21:00',
      price: '$500',
      tags: ['Rock', 'Clásico'],
      image: 'https://www.loopearplugs.com/cdn/shop/articles/applause-audience-band-167636_8a2ad979-d6bb-48e8-8c90-8810a35cdf5d.jpg?v=1702892933&width=2000',
      isFavorite: true
    },
    {
      id: 6,
      title: 'Underground Beats',
      location: 'Club Sótano',
      date: '22 Nov • 23:00',
      price: '$150',
      tags: ['House', 'Deep'],
      image: 'https://images.sk-static.com/images/media/profile_images/artists/187138/huge_avatar',
      isFavorite: false
    }
  ];

  constructor() {
    addIcons({ 
      searchOutline, 
      locationOutline, 
      calendarOutline, 
      heart, 
      heartOutline,
      mapOutline,
      flashOutline,
      personOutline,
      optionsOutline
    });
  }

  ngOnInit() {
  }

  toggleFavorite(event: any) {
    event.isFavorite = !event.isFavorite;
  }

}