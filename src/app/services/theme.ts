import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  // Al iniciar la app, recuperamos el tema guardado
  initTheme() {
    const savedTheme = localStorage.getItem('color-mode') || 'normal';
    this.setTheme(savedTheme);
  }

  setTheme(mode: string) {
    // 1. Limpiamos las clases anteriores del body
    document.body.classList.remove('normal', 'protanopia', 'deuteranopia', 'tritanopia');

    // 2. Agregamos la clase nueva
    document.body.classList.add(mode);

    // 3. Guardamos la preferencia
    localStorage.setItem('color-mode', mode);
  }
}