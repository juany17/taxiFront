export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: 'pasajero' | 'conductor' | 'admin';
  fotoPerfil?: string;
  descripcion?: string;
  
  // Información Profesional
  anosExperiencia?: number;
  totalViajes?: number;
  calificacionPromedio?: number;
  certificaciones?: string[];
  
  // Información Personal
  edad?: number;
  idiomas?: string[];
  pasatiempos?: string[];
  frasePersonal?: string;
  
  // Preferencias de Servicio
  musicaPreferida?: string;
  aceptaMascotas?: boolean;
  tieneCascoExtra?: boolean;
  estiloConduccion?: 'tranquilo' | 'rapido' | 'intermedio';
  ofreceChucherias?: boolean;
  
  // Disponibilidad
  horariosTrabajo?: string;
  zonasPreferencia?: string[];
  
  // Información del Vehículo
  accesoriosVehiculo?: string[];
  fotosVehiculo?: string[];
  
  // Social
  redesSociales?: { instagram?: string; facebook?: string; whatsapp?: string };
  
  // Seguridad y Confianza
  documentosVerificados?: { licencia?: boolean; soat?: boolean; seguro?: boolean };
  fechaUltimaVerificacion?: string | Date;
  
  // Badges
  badges?: string[];
  
  createdAt?: string | Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginResponse {
  token: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  conductor: User;
  createdAt?: string | Date;
}

export interface Trip {
  id: string;
  passenger_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  status: 'pendiente' | 'aceptado' | 'finalizado';
  fare: number;
  origin_address: string | null;
  destination_address: string | null;
  requested_at?: string | Date | null;
  accepted_at?: string | Date | null;
  finished_at?: string | Date | null;
  createdAt?: string | Date;
  passenger?: User;
  driver?: User | null;
  vehicle?: Vehicle | null;
}

export interface CreateTripRequest {
  origin_address: string;
  origin_lat: number;
  origin_lng: number;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  vehicle_id?: string;
}

export interface Review {
  id: string;
  trip_id: string;
  rating: number;
  comment?: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  author?: User;
  subject?: User;
  trip?: Trip;
  createdAt?: string | Date;
}

export interface Complaint {
  id: string;
  trip_id?: string | null;
  reason: string;
  description: string;
  status: 'pendiente' | 'revisada' | 'descartada';
  reporter?: User;
  reportedUser?: User | null;
  trip?: Trip | null;
  createdAt?: string | Date;
}