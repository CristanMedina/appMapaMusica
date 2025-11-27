import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { addIcons } from 'ionicons';
import { settingsOutline, mapOutline, flashOutline, personOutline } from 'ionicons/icons';


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

  eventsAttended = 15;
  artistsFollowed = 5;

  savedEvents = [
    { title: 'Rock Festival', subtitle: 'Indie Bar • Hoy, 20:00h', tags: ['#Rock', '#Indie'], image: 'assets/icon/banda1.jpg' },
    { title: 'Rock Festival', subtitle: 'Indie Bar • Hoy, 20:00h', tags: ['#Rock', '#Indie'], image: 'assets/icon/banda2.jpg' },
    { title: 'Strangers', subtitle: 'Hita Bar • Sab, 21:30h', tags: ['#Electrónica'], image: 'assets/icon/banda3.jpg' },
    { title: 'Latin Beats', subtitle: 'Hazy District • Vie, 22:00h', tags: ['#Latin', '#Reggaeton'], image: 'assets/icon/banda4.jpg' }
  ];

  activeTab: 'saved' | 'favorites' | 'calendar' = 'saved';

  constructor() {
    addIcons({ settingsOutline, mapOutline, flashOutline, personOutline });
  }

  ngOnInit() {
  }

  segmentChanged(ev: any) {
    this.activeTab = ev.detail.value;
  }

}