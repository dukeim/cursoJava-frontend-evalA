
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap } from 'rxjs/operators';
import { SignoVital } from './../../_model/signovital';
import { SignoVitalService } from 'src/app/_service/signovital.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signovital',
  templateUrl: './signovital.component.html',
  styleUrls: ['./signovital.component.css']
})
export class SignovitalComponent implements OnInit {

  displayedColumns = ['fecha', 'nombresPaciente', 'apellidosPaciente', 'acciones'];
  dataSource: MatTableDataSource<SignoVital>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  cantidad: number = 0;

  constructor(
    private signoVitalService: SignoVitalService,
    private snackBar: MatSnackBar,
    public route: ActivatedRoute
  ) { }


  ngOnInit(): void {
      this.signoVitalService.listarPageable(0, 10).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.configSorting();
      this.configFiletering();
     
    })

    this.signoVitalService.getSignoVitalCambio().subscribe(data => {
      this.crearTabla(data);
    });

    this.signoVitalService.getMensajeCambio().subscribe(data => {
      this.snackBar.open(data, 'AVISO', { duration: 2000 });
    });
  }

  configFiletering(){
    this.dataSource.filterPredicate = (data, filter) => {
      return data['paciente'].nombres.toLowerCase().indexOf(filter) != -1 || 
        data['paciente'].apellidos.toLowerCase().indexOf(filter) != -1 ||
        data.fecha.indexOf(filter) != -1;
    }
  }
  configSorting(){
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch(property) {
        case 'nombresPaciente': return item.paciente.nombres;
        case 'apellidosPaciente': return item.paciente.apellidos;
        default: return item[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
    
  }

  eliminar(idPaciente: number) {
    this.signoVitalService.eliminar(idPaciente).pipe(switchMap(() => {
      return this.signoVitalService.listar();
    }))
      .subscribe(data => {
        this.signoVitalService.setSignoVitalCambio(data);
        this.signoVitalService.setMensajeCambio('SE ELIMINO');
      });

  }
  crearTabla(data: SignoVital[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  mostrarMas(e: any) {
    this.signoVitalService.listarPageable(e.pageIndex, e.pageSize).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });
  }

}
