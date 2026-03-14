import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AppConfigService } from '../services/app-config.service';

@Pipe({
  name: 'appCurrency',
  standalone: true
})
export class AppCurrencyPipe implements PipeTransform {

  constructor(
    private appConfigService: AppConfigService,
    private currencyPipe: CurrencyPipe
  ) {}

  transform(value: number | string | null | undefined, digitsInfo: string = '1.2-2'): string | null {
    if (value == null) return null;
    
    const moneda = this.appConfigService.monedaActiva;
    const val = typeof value === 'string' ? parseFloat(value) : value;

    // En formato 'es-PE' o general: 'S/ ' para dar el espacio
    const displayValue = moneda.valor.endsWith(' ') ? moneda.valor : `${moneda.valor} `;
    
    return this.currencyPipe.transform(val, moneda.codigo, displayValue, digitsInfo, 'es-PE');
  }

}
