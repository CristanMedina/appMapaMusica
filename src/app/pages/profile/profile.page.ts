import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { settingsOutline, mapOutline, flashOutline, personOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';
import { Database } from '../../services/database';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterLink,
    FormsModule
  ]
})
export class ProfilePage implements OnInit {

  // Obtenemos la señal del usuario actual
  user = this.database.currentUser;

  // Datos Mock (Estáticos por ahora, hasta que tengas tabla de eventos)
  eventsAttended = 15;
  artistsFollowed = 5;

  savedEvents = [
    { title: 'Rock Festival', subtitle: 'Indie Bar • Hoy, 20:00h', tags: ['#Rock', '#Indie'], image: 'assets/icon/banda1.jpg' },
    { title: 'Strangers', subtitle: 'Hita Bar • Sab, 21:30h', tags: ['#Electrónica'], image: 'assets/icon/banda3.jpg' },
    { title: 'Latin Beats', subtitle: 'Hazy District • Vie, 22:00h', tags: ['#Latin', '#Reggaeton'], image: 'assets/icon/banda4.jpg' }
  ];

  activeTab: 'saved' | 'favorites' | 'calendar' = 'saved';

  constructor(
    public database: Database,
    private router: Router,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({ settingsOutline, mapOutline, flashOutline, personOutline, logOutOutline, personCircleOutline });
  }

  ngOnInit() {
    // Si no hay usuario (por recarga), intentamos cargarlo o redirigir
    if (!this.user()) {
        this.database.loadUsers();
    }
  }

  segmentChanged(ev: any) {
    this.activeTab = ev.detail.value;
  }

  // Función para mostrar opciones (Cerrar Sesión)
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
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  logout() {
    this.database.logout();
    this.router.navigate(['/login']);
  }
}
