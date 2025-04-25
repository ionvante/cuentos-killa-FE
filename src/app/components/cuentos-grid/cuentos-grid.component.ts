import { Component, OnInit  } from '@angular/core';
import { CuentoService } from '../../services/cuento.service';
import { Cuento } from '../../model/cuento.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cuentos-grid',
  templateUrl: './cuentos-grid.component.html',
  styleUrls: ['./cuentos-grid.component.scss'
  ],})

export class CuentosGridComponent implements OnInit {

  cuentos: Cuento[] = [];
  constructor(private cuentoService: CuentoService,private router: Router) {}
  ngOnInit(): void {
    this.cuentoService.obtenerCuentos().subscribe(data => {
      this.cuentos = data;
    });
  }
  
  verDetalle(id: number) {
    this.router.navigate(['/cuento', id]);
  }  
}  

  





