import { SignoVital } from './../../../_model/signovital';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SignoVitalService } from 'src/app/_service/signovital.service';
import { switchMap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Paciente } from 'src/app/_model/paciente';
import { PacienteService } from 'src/app/_service/paciente.service';
import * as moment from 'moment';

@Component({
  selector: 'app-signovital-edicion',
  templateUrl: './signovital-edicion.component.html',
  styleUrls: ['./signovital-edicion.component.css']
})
export class SignovitalEdicionComponent implements OnInit {
  form: FormGroup;
  id: number;
  edicion: boolean;
  fechaSeleccionada: Date = new Date();
  maxFecha: Date = new Date();
  
  myControlPaciente: FormControl = new FormControl();
  pacientes: Paciente[];
  pacientesFiltrados$: Observable<Paciente[]>;


  constructor( 
    private pacienteService : PacienteService,
    private route: ActivatedRoute,
    private router: Router,
    private signovitalService: SignoVitalService
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'id': new FormControl(0),
      'paciente': new FormControl(''),
      'fecha': new FormControl(''),
      'temperatura': new FormControl(''),
      'pulso': new FormControl(''),
      'ritmorespiratorio': new FormControl(''),
    });
    this.route.params.subscribe((data: Params) => {
      this.id = data['id'];
      this.edicion = data['id'] != null;
      this.initForm();
    });

    this.listarPacientes();  
    this.pacientesFiltrados$ = this.myControlPaciente.valueChanges.pipe(map(val => this.filtrarPacientes(val)));
  }
  
  filtrarPacientes(val: any){

    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(el =>
        el.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || el.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || el.dni.includes(val.dni)
      );
    }
    return this.pacientes.filter(el => 
      el.nombres.toLowerCase().includes(val?.toLowerCase()) || el.apellidos.toLowerCase().includes(val?.toLowerCase()) || el.dni.includes(val)
    );
  }

  
  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  
  mostrarPaciente(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  estadoBotonRegistrar() {
    if (this.form.value['paciente'] === null) { return true;}
    return (this.form.invalid || !(typeof this.form.value['paciente'] === 'object'));
  }

  private initForm() {
    if (this.edicion) {
      this.signovitalService.listarPorId(this.id).subscribe(data => {
        this.fechaSeleccionada = moment(data.fecha,'DD/MM/YYYY').toDate();
        this.myControlPaciente = new FormControl(data.paciente);
        this.form = new FormGroup({
          'id': new FormControl(data.idSignoVital),
          'paciente': this.myControlPaciente,
          'fecha': new FormControl(data.fecha),
          'temperatura': new FormControl(data.temperatura),
          'pulso': new FormControl(data.pulso),
          'ritmorespiratorio': new FormControl(data.ritmoRespiratorio),
        });
        this.pacientesFiltrados$ = this.myControlPaciente.valueChanges.pipe(map(val => this.filtrarPacientes(val)));
      });
      
    }else{
      
      this.form = new FormGroup({
        'id': new FormControl(0),
        'paciente': this.myControlPaciente,
        'fecha': new FormControl(''),
        'temperatura': new FormControl(''),
        'pulso': new FormControl(''),
        'ritmorespiratorio': new FormControl(''),
      });
  
    }
  }

  get f() {
    return this.form.controls;
  }


  operar() {
    if (this.estadoBotonRegistrar()) { 
      this.signovitalService.setMensajeCambio('DATOS INCOMPLETOS');
      return; 
    }

    let signovital = new SignoVital();
    signovital.idSignoVital = this.form.value['id'];
    signovital.fecha = moment(this.form.value['fecha']).format('DD/MM/YYYY');
    signovital.temperatura = this.form.value['temperatura'];
    signovital.pulso = this.form.value['pulso'];
    signovital.ritmoRespiratorio = this.form.value['ritmorespiratorio'];
    signovital.paciente = this.form.value['paciente'];
        
    if (this.edicion) {
      //MODIFICAR
     
      this.signovitalService.modificar(signovital).pipe(switchMap(() => {
        return this.signovitalService.listar();
      }))
      .subscribe(data => {
        this.signovitalService.setSignoVitalCambio(data);
        this.signovitalService.setMensajeCambio('SE MODIFICO');
      });

    } else {
      //REGISTRAR
      this.signovitalService.registrar(signovital).pipe(switchMap(() => {
        return this.signovitalService.listar();
      }))
      .subscribe(data => {
        this.signovitalService.setSignoVitalCambio(data);
        this.signovitalService.setMensajeCambio('SE REGISTRO');
      });
   
    }

    this.router.navigate(['signovital']);

  }

 
}
