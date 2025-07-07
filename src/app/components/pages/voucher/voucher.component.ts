import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../services/pedido.service';
import { ToastService } from '../../../services/toast.service';
import { ModalComponent } from '../../app-modal/modal.component';

@Component({
  selector: 'app-voucher',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.scss']
})
export class VoucherComponent implements OnInit {
  @Input() pedidoId = 0;
  @Output() uploaded = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isImage = false;
  isPdf = false;
  isUploading = false;
  uploadComplete = false;
  isMobile = false;

  constructor(private pedidoService: PedidoService, private toast: ToastService) {}

  ngOnInit(): void {
    this.onResize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 600;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.toast.show('Formato no permitido', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.toast.show('El archivo supera los 5 MB', 'error');
        return;
      }
      this.selectedFile = file;
      this.isImage = file.type.startsWith('image/');
      this.isPdf = file.type === 'application/pdf';
      if (this.isImage) {
        const reader = new FileReader();
        reader.onload = e => (this.previewUrl = (e.target as FileReader).result as string);
        reader.readAsDataURL(file);
      } else {
        this.previewUrl = null;
      }
    }
  }

  uploadVoucher(): void {
    if (!this.selectedFile) {
      this.toast.show('Selecciona un archivo', 'error');
      return;
    }
    this.isUploading = true;
    this.pedidoService.uploadVoucher(this.pedidoId, this.selectedFile).subscribe({
      next: () => {
        this.uploadComplete = true;
        this.toast.show('Voucher enviado correctamente', 'success');
        this.uploaded.emit();
      },
      error: () => this.toast.show('Error al subir el voucher', 'error'),
      complete: () => (this.isUploading = false)
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
