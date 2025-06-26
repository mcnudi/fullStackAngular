import { Irutina } from "./irutina.interface";

export interface IRutinaPaginada {
    data: Irutina[]; // o el tipo exacto de rutina
  page: number;
  total: number;
  totalPage: number;

}
