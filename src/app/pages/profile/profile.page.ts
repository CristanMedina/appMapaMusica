import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  settingsOutline, mapOutline, flashOutline, personOutline,
  logOutOutline, personCircleOutline, eyeOutline, camera,
  heart, heartOutline, calendarOutline, locationOutline,
  closeCircleOutline // Icono para cerrar la vista previa
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Database } from '../../services/database';
import { ThemeService } from 'src/app/services/theme';
import { MusicEvent } from 'src/app/interface/event'; // Importamos la interfaz

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class ProfilePage implements OnInit {

  user = this.database.currentUser;
  profileImage = 'assets/icon/Vectoor.png';
  eventsAttended = 15;
  artistsFollowed = 5;
  currentMode = 'normal';
  activeTab: 'favorites' | 'calendar' = 'favorites';

  // Variable para la vista previa del evento en el calendario
  selectedEventPreview: MusicEvent | null = null;

  constructor(
    public database: Database,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private themeService: ThemeService
  ) {
    addIcons({
      settingsOutline, mapOutline, flashOutline, personOutline,
      logOutOutline, personCircleOutline, eyeOutline, camera,
      heart, heartOutline, calendarOutline, locationOutline,
      closeCircleOutline
    });
    
    this.currentMode = localStorage.getItem('color-mode') || 'normal';
  }

  ngOnInit() {
    if (!this.user()) {
        console.log('Sesión no encontrada, redirigiendo...');
        this.router.navigate(['/login']);
    }
  }

  get favoriteEvents() {
    return this.database.events().filter(event => event.isFavorite);
  }

  get calendarEvents() {
    return this.database.events()
      .filter(event => event.date && event.date !== '') 
      .sort((a, b) => (a.date! > b.date!) ? 1 : -1);
  }

  get highlightedDates() {
    return this.calendarEvents.map(event => ({
      date: event.date!, 
      textColor: '#ffffff',
      backgroundColor: '#ff00ff'
    }));
  }

  segmentChanged(ev: any) {
    this.activeTab = ev.detail.value;
    // Limpiamos la vista previa al cambiar de pestaña
    this.selectedEventPreview = null;
  }

  // --- NUEVA FUNCIÓN: Al seleccionar una fecha en el calendario ---
  onDateSelected(event: any) {
    // El evento devuelve la fecha en formato ISO (YYYY-MM-DD...)
    const dateSelected = event.detail.value.split('T')[0];
    
    // Buscamos si hay un evento ese día
    const foundEvent = this.calendarEvents.find(e => e.date === dateSelected);
    
    if (foundEvent) {
      this.selectedEventPreview = foundEvent;
    } else {
      this.selectedEventPreview = null;
    }
  }

  closePreview() {
    this.selectedEventPreview = null;
  }

  async changeImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, 
        source: CameraSource.Prompt
      });

      if (image.dataUrl) {
        this.profileImage = image.dataUrl;
      }
    } catch (error) {
      console.log('Usuario canceló o error en cámara', error);
    }
  }

  changeColorMode(event: any) {
    const mode = event.detail.value;
    this.currentMode = mode;
    this.themeService.setTheme(mode);
  }

  async presentSettings() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Ajustes de Cuenta',
      buttons: [
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          icon: 'log-out-outline',
          handler: () => { this.logout(); }
        },
        { text: 'Cancelar', role: 'cancel', icon: 'close', handler: () => { } }
      ]
    });
    await actionSheet.present();
  }

  logout() {
    this.database.logout();
    this.router.navigate(['/login']);
  }
}