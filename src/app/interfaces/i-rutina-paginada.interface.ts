import { Irutina } from "./irutina.interface";

export interface IRutinaPaginada {
    data: Irutina[];
  page: number;
  total: number;
  totalPage: number;

}
