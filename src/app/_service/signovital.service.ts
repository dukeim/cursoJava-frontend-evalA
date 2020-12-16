import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SignoVital } from '../_model/signovital';
import { GenericService } from './generic.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignoVitalService extends GenericService<SignoVital> {

  private signovitalCambio = new Subject<SignoVital[]>();
  private mensajeCambio = new Subject<string>();
  
  constructor(protected http: HttpClient) {
    super(
      http,
      `${environment.HOST}/signosvitales`
    );
  }  

  listarPageable(p: number, s:number){
    return this.http.get<any>(`${this.url}/pageable?page=${p}&size=${s}`);
  }

  getSignoVitalCambio(){
    return this.signovitalCambio.asObservable();
  }

  setSignoVitalCambio(signosvitales : SignoVital[]){
    this.signovitalCambio.next(signosvitales);
  }

  getMensajeCambio(){
    return this.mensajeCambio.asObservable();
  }

  setMensajeCambio(mensaje: string){
    return this.mensajeCambio.next(mensaje);
  }
}
