import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  mapOutline,
  flashOutline,
  personOutline,
  logOutOutline,
  personCircleOutline,
  eyeOutline,
  camera,
  heart,
  heartOutline,
  calendarOutline
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Database } from '../../services/database';
import { ThemeService } from 'src/app/services/theme';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  
  ]
})
export class ProfilePage implements OnInit {

  user = this.database.currentUser;
  
  profileImage = 'assets/icon/Vectoor.png';

  eventsAttended = 15;
  artistsFollowed = 5;
  currentMode = 'normal';

  savedEvents = [
    { title: 'Rock Festival', subtitle: 'Indie Bar • Hoy, 20:00h', tags: ['#Rock', '#Indie'], image: 'assets/icon/banda1.jpg' },
    { title: 'Strangers', subtitle: 'Hita Bar • Sab, 21:30h', tags: ['#Electrónica'], image: 'assets/icon/banda3.jpg' },
    { title: 'Latin Beats', subtitle: 'Hazy District • Vie, 22:00h', tags: ['#Latin', '#Reggaeton'], image: 'assets/icon/banda4.jpg' }
  ];

  activeTab: 'saved' | 'favorites' | 'calendar' = 'saved';

  constructor(
    public database: Database,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private themeService: ThemeService
  ) {
    addIcons({
      settingsOutline,
      mapOutline,
      flashOutline,
      personOutline,
      logOutOutline,
      personCircleOutline,
      eyeOutline,
      camera,
      heart,
      heartOutline,
      calendarOutline
    });

    this.currentMode = localStorage.getItem('color-mode') || 'normal';
  }

  ngOnInit() {
  }

  segmentChanged(ev: any) {
    this.activeTab = ev.detail.value;
  }

  async changeImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });

      if (image.webPath) {
        this.profileImage = image.webPath;
      }
    } catch (error) {
      console.log(error);
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
          handler: () => {
            this.logout();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close',
          handler: () => {
          }
        }
      ]
    });
    await actionSheet.present();
  }

  logout() {
    this.database.logout();
    this.router.navigate(['/login']);
  }
}