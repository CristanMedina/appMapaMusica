import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { musicalNotes } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true, 
  imports: [
    IonicModule,       
    CommonModule,     
    ReactiveFormsModule,
    RouterLink,        
  ]
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController

  ) {
    addIcons({ musicalNotes });
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      console.warn('Formulario inválido');
      this.mostrarAlerta('Error', 'Por favor, revisa los campos.');
      return;
    }

    console.log('Iniciando sesión con:', this.loginForm.value);

    // *** Lógica de autenticación simulada ***
    // Aquí es donde llamarías a tu servicio de backend o Firebase.
    // Vamos a simular una llamada exitosa con un setTimeout.
    
    // Muestra un "cargando" (opcional pero recomendado)
    // const loading = await this.loadingController.create({ message: 'Iniciando sesión...' });
    // await loading.present();

    setTimeout(async () => {
      
      console.log('¡Login exitoso!');
      
      await this.mostrarAlerta('¡Bienvenido!', 'Has iniciado sesión correctamente.');
      this.router.navigate(['/home']);

    }, 1500); 
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}