import { Injectable } from '@angular/core';
import { MaestrosService } from './maestros.service';
import { firstValueFrom } from 'rxjs';
import { Maestro } from '../model/maestro.model';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private _monedaActiva: Maestro | null = null;
  private readonly defaultMoneda = { codigo: 'PEN', valor: 'S/' };

  constructor(private maestrosService: MaestrosService) { }

  async loadConfig(): Promise<void> {
    try {
      const monedas = await firstValueFrom(this.maestrosService.obtenerMaestrosPorGrupo('MONEDA'));
      if (monedas && monedas.length > 0) {
        this._monedaActiva = {
          codigo: monedas[0].codigo || this.defaultMoneda.codigo,
          valor: monedas[0].valor || this.defaultMoneda.valor
        } as Maestro;
      }
    } catch (error) {
      console.warn('Error cargando maestro MONEDA, usando default', error);
      this._monedaActiva = { codigo: this.defaultMoneda.codigo, valor: this.defaultMoneda.valor } as Maestro;
    }
  }

  get monedaActiva(): { codigo: string; valor: string } {
    if (!this._monedaActiva) {
      return this.defaultMoneda;
    }
    return {
      codigo: this._monedaActiva.codigo || this.defaultMoneda.codigo,
      valor: this._monedaActiva.valor || this.defaultMoneda.valor
    };
  }
}
