import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-pago-exito',
    templateUrl: './pago-exito.component.html',
    styleUrls: ['./pago-exito.component.scss']
})
export class PagoExitoComponent implements OnInit {
    pedidoId: number = 0;
    showConfetti = false;

    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
        this.pedidoId = Number(this.route.snapshot.paramMap.get('id') ?? 0);
        // Trigger confetti animation after a brief delay
        setTimeout(() => { this.showConfetti = true; }, 100);
    }

    irAPedidos(): void { this.router.navigate(['/pedidos']); }
    seguirComprando(): void { this.router.navigate(['/cuentos']); }
}
