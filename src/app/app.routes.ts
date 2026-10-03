import { Routes } from '@angular/router';
import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { ForgotPasswordComponent } from './auth/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/pages/reset-password/reset-password.component';
import { PassengerHomeComponent } from './features/passenger/pages/home/home.component';
import { RequestTripComponent } from './features/passenger/pages/request-trip/request-trip.component';
import { PassengerTripsComponent } from './features/passenger/pages/trips/trips.component';
import { DriverHomeComponent } from './features/driver/pages/home/home.component';
import { DriverTripsComponent } from './features/driver/pages/trips/trips.component';
import { DriverActiveTripComponent } from './features/driver/pages/active-trip/active-trip.component';
import { DriverProfileComponent } from './features/driver/pages/profile/profile.component';
import { AdminHomeComponent } from './features/admin/pages/home/home.component';
import { AdminUsersComponent } from './features/admin/pages/users/users.component';
import { AdminVehiclesComponent } from './features/admin/pages/vehicles/vehicles.component';
import { AdminTripsComponent } from './features/admin/pages/trips/trips.component';
import { AdminFeedbackComponent } from './features/admin/pages/feedback/feedback.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Rutas de Pasajero
  { path: 'passenger/home', component: PassengerHomeComponent, canActivate: [AuthGuard] },
  { path: 'passenger/request-trip', component: RequestTripComponent, canActivate: [AuthGuard] },
  { path: 'passenger/trips', component: PassengerTripsComponent, canActivate: [AuthGuard] },
  { path: 'passenger/trip/:id', component: PassengerTripsComponent, canActivate: [AuthGuard] },

  // Rutas de Conductor
  { path: 'driver/home', component: DriverHomeComponent, canActivate: [AuthGuard] },
  { path: 'driver/trips', component: DriverTripsComponent, canActivate: [AuthGuard] },
  { path: 'driver/trip/:id', component: DriverActiveTripComponent, canActivate: [AuthGuard] },
  { path: 'driver/profile', component: DriverProfileComponent, canActivate: [AuthGuard] },

  // Rutas de Administrador
  { path: 'admin/home', component: AdminHomeComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/vehicles', component: AdminVehiclesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/trips', component: AdminTripsComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/feedback', component: AdminFeedbackComponent, canActivate: [AuthGuard, AdminGuard] },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
];