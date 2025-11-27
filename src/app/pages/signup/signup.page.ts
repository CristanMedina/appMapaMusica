import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { musicalNotes, person, business } from 'ionicons/icons';
import { Database } from '../../services/database';

@Component({
  selector: 'app-register',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterLink]
})
export class SignupPage implements OnInit {

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private database: Database
  ) {
    addIcons({ musicalNotes, person, business });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      isAdmin: [false]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit() {}

  async onRegister() {
    if (this.registerForm.invalid) {
      this.mostrarAlerta('Formulario inválido', 'Revisa los campos.');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Guardando...', spinner: 'crescent' });
    await loading.present();

    const { username, email, password, isAdmin } = this.registerForm.value;

    try {
      // Llamada simplificada al servicio
      await this.database.addUser({
        name: username,
        email: email,
        password: password,
        isAdmin: isAdmin ?? false
      });

      await loading.dismiss();
      await this.mostrarAlerta('¡Éxito!', 'Cuenta creada correctamente.');
      this.router.navigate(['/login']);

    } catch (error: any) {
      await loading.dismiss();
      if (error.message === 'EMAIL_EXISTS') {
        this.mostrarAlerta('Error', 'Ese correo ya está registrado.');
      } else {
        this.mostrarAlerta('Error', 'No se pudo guardar el usuario.');
      }
    }
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  passwordsMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return (password && confirmPassword && password.value !== confirmPassword.value) ? { passwordsMismatch: true } : null;
  }
}
