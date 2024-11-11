import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tasks']); // Redirigir si ya está autenticado
      sessionStorage.setItem('userEmail', this.email);
      console.log(sessionStorage.getItem('userEmail'));
    }
  }

  // Función para validar email
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Función para validar la contraseña
  validatePassword(password: string): boolean {
    return password.length >= 6;  // Asegúrate de que la contraseña tenga al menos 6 caracteres
  }

  login(): void {
    this.errorMessage = '';  // Limpiar errores previos

    // Validar email y contraseña
    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Por favor ingrese un correo electrónico válido.';
      return;
    }
    if (!this.validatePassword(this.password)) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Si todo está validado, continuar con el login
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        // Al obtener el token y el correo, guardamos en sessionStorage
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('userEmail', this.email); // Guardar el email en sessionStorage
        this.router.navigate(['/tasks']);
      },
      (error) => {
        console.error('Error de login', error);
        this.errorMessage = 'Error al autenticar al usuario, por favor verifica tus credenciales.';
      }
    );
  }

  register(): void {
    this.errorMessage = '';  // Limpiar errores previos

    // Validar email y contraseña
    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Por favor ingrese un correo electrónico válido.';
      return;
    }
    if (!this.validatePassword(this.password)) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Si todo está validado, continuar con el registro
    this.authService.register(this.email, this.password).subscribe(
      (response) => {
        // Al registrar al usuario, puedes redirigirlo o mostrar un mensaje de éxito
        console.log('Registro exitoso', response);
        alert('Usuario registrado con éxito');
        this.router.navigate(['/login']);  // Redirigir a la página de login
      },
      (error) => {
        console.error('Error de registro', error);
        this.errorMessage = 'Error al registrar al usuario, por favor intenta de nuevo.';
      }
    );
  }
}
