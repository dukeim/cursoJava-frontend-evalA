import { Paciente } from './paciente';
export class SignoVital {
    idSignoVital: number;
    fecha: string;
    temperatura: string;
    pulso: string;
    ritmoRespiratorio: string;
    paciente: Paciente;
}