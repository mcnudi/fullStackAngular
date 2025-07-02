export interface Irutina {
  name: string;
  description: string;
  defecto: boolean;
  usuario: string;
  is_shared: boolean;
  is_frequent: boolean;
  is_default: boolean;
  id: number;
  version_number: number;
  idVersion: number;
  created_at: Date;
  numActividades?:number;
  is_selected?:boolean;
}

export interface GenerarRutinaResponse {
  message: string;
  idRutVersion: number;
  idRutina: number;
}
