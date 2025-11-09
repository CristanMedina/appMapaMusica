import { Component, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon } from "@ionic/angular/standalone";
import { mapOutline, musicalNotesOutline, calendarOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-bottom-tab-bar',
  templateUrl: './bottom-tab-bar.component.html',
  styleUrls: ['./bottom-tab-bar.component.scss'],
  imports: [IonIcon, IonTabButton, IonTabBar, IonTabs],
})
export class BottomTabBarComponent  implements OnInit {

  constructor() {
    addIcons({
        mapOutline,
        musicalNotesOutline,
        calendarOutline
    })
  }

  ngOnInit() {}

}
