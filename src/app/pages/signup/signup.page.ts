import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { musicalNotes } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true, 
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ]
})
export class SignupPage implements OnInit {

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ musicalNotes });
    
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit() {
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      console.warn('Formulario de registro inválido');
      this.mostrarAlerta('Error', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    console.log('Registrando usuario:', this.registerForm.value);

    // base de datos
    
  

    setTimeout(async () => {
      
      console.log('¡Registro exitoso!');
      
      await this.mostrarAlerta('¡Éxito!', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.');
      
      this.router.navigate(['/login']);

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

  passwordsMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordsMismatch: true };
    }
    return null;
  }

}