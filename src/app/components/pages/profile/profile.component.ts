import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';
import { User } from '../../../model/user.model';
import { Address } from '../../../model/address.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('fadeSlideIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(16px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('modalAnim', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
            ])
        ])
    ]
})
export class ProfileComponent implements OnInit {
    user: User | null = null;
    addresses: Address[] = [];
    isLoading = true;
    isLoadingAddresses = true;

    // Profile editing
    editingProfile = false;
    profileForm: Partial<User> = {};
    savingProfile = false;

    // Address modal
    showAddressModal = false;
    editingAddress: Address | null = null;
    addressForm: Address = this.emptyAddress();
    savingAddress = false;

    // Delete confirmation
    addressToDelete: Address | null = null;

    // Toast
    toastMessage = '';
    toastType: 'success' | 'error' = 'success';
    toastVisible = false;

    constructor(
        private authService: AuthService,
        private clienteService: ClienteService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
        if (this.user?.id) {
            this.loadProfile();
            this.loadAddresses();
        } else {
            this.isLoading = false;
            this.isLoadingAddresses = false;
        }
    }

    // ── Profile ──────────────────────────────────────

    loadProfile(): void {
        this.clienteService.getProfile(this.user!.id!).subscribe({
            next: (u) => {
                this.user = u;
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    startEditProfile(): void {
        this.profileForm = {
            nombre: this.user?.nombre || '',
            apellido: this.user?.apellido || '',
            telefono: this.user?.telefono || '',
            documento: this.user?.documento || ''
        };
        this.editingProfile = true;
    }

    cancelEditProfile(): void {
        this.editingProfile = false;
    }

    saveProfile(): void {
        if (!this.user?.id) return;
        this.savingProfile = true;
        this.clienteService.updateProfile(this.user.id, this.profileForm).subscribe({
            next: (updated) => {
                this.user = updated;
                this.authService.guardarUsuario(updated);
                this.editingProfile = false;
                this.savingProfile = false;
                this.showToast('Perfil actualizado correctamente', 'success');
                this.cdr.markForCheck();
            },
            error: () => {
                this.savingProfile = false;
                this.showToast('Error al actualizar el perfil', 'error');
                this.cdr.markForCheck();
            }
        });
    }

    // ── Addresses ────────────────────────────────────

    loadAddresses(): void {
        this.clienteService.getAddresses(this.user!.id!).subscribe({
            next: (addrs) => {
                this.addresses = addrs;
                this.isLoadingAddresses = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoadingAddresses = false;
                this.cdr.markForCheck();
            }
        });
    }

    openNewAddress(): void {
        this.editingAddress = null;
        this.addressForm = this.emptyAddress();
        this.showAddressModal = true;
    }

    openEditAddress(addr: Address): void {
        this.editingAddress = addr;
        this.addressForm = { ...addr };
        this.showAddressModal = true;
    }

    closeAddressModal(): void {
        this.showAddressModal = false;
        this.editingAddress = null;
    }

    saveAddress(): void {
        if (!this.user?.id) return;
        this.savingAddress = true;
        this.addressForm.usuarioId = this.user.id;

        const obs = this.editingAddress
            ? this.clienteService.updateAddress(this.editingAddress.id!, this.addressForm)
            : this.clienteService.createAddress(this.addressForm);

        obs.subscribe({
            next: () => {
                this.savingAddress = false;
                this.showAddressModal = false;
                this.showToast(
                    this.editingAddress ? 'Dirección actualizada' : 'Dirección agregada',
                    'success'
                );
                this.loadAddresses();
            },
            error: () => {
                this.savingAddress = false;
                this.showToast('Error al guardar la dirección', 'error');
                this.cdr.markForCheck();
            }
        });
    }

    confirmDelete(addr: Address): void {
        this.addressToDelete = addr;
    }

    cancelDelete(): void {
        this.addressToDelete = null;
    }

    deleteAddress(): void {
        if (!this.addressToDelete?.id) return;
        this.clienteService.deleteAddress(this.addressToDelete.id).subscribe({
            next: () => {
                this.addressToDelete = null;
                this.showToast('Dirección eliminada', 'success');
                this.loadAddresses();
            },
            error: () => {
                this.addressToDelete = null;
                this.showToast('Error al eliminar la dirección', 'error');
                this.cdr.markForCheck();
            }
        });
    }

    // ── Helpers ──────────────────────────────────────

    private emptyAddress(): Address {
        return {
            calle: '', ciudad: '', departamento: '', provincia: '',
            distrito: '', referencia: '', codigoPostal: '',
            esPrincipal: false, esFacturacion: false
        };
    }

    private showToast(message: string, type: 'success' | 'error'): void {
        this.toastMessage = message;
        this.toastType = type;
        this.toastVisible = true;
        this.cdr.markForCheck();
        setTimeout(() => {
            this.toastVisible = false;
            this.cdr.markForCheck();
        }, 3000);
    }

    getUserInitial(): string {
        return this.user?.nombre?.charAt(0)?.toUpperCase() || 'U';
    }
}
