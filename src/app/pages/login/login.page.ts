import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { musicalNotes, logoGoogle } from 'ionicons/icons';
import { Database } from '../../services/database';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private database: Database
  ) {
    addIcons({ musicalNotes, logoGoogle });
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // Cargar usuarios al entrar al login para asegurar que la lista esté fresca
    this.database.loadUsers();
  }

  async onLogin() {
    if (this.loginForm.invalid) return;

    const loading = await this.loadingController.create({ message: 'Entrando...', spinner: 'crescent' });
    await loading.present();

    const { email, password } = this.loginForm.value;
    const user = await this.database.findUser(email, password);

    await loading.dismiss();

    if (user) {
      console.log('Login correcto:', user);
      this.router.navigate(['/home']);
    } else {
      this.mostrarAlerta('Error', 'Correo o contraseña incorrectos.');
    }
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}
