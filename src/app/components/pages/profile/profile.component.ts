import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';
import { MaestrosService } from '../../../services/maestros.service';
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
    profileSubmitted = false;

    tiposDocumento: any[] = [];
    tiposDireccion = [
        { codigo: 'CASA', descripcion: 'Casa' },
        { codigo: 'TRABAJO', descripcion: 'Trabajo' },
        { codigo: 'FAMILIAR', descripcion: 'Familiar' },
        { codigo: 'OTRO', descripcion: 'Otro' }
    ];

    // Address modal
    showAddressModal = false;
    editingAddress: Address | null = null;
    addressForm: Address = this.emptyAddress();
    savingAddress = false;
    addressSubmitted = false;

    // Delete confirmation
    addressToDelete: Address | null = null;

    // Toast
    toastMessage = '';
    toastType: 'success' | 'error' = 'success';
    toastVisible = false;

    // Ubigeo data
    departamentos: any[] = [];
    provincias: any[] = [];
    distritos: any[] = [];
    loadingProvincias = false;
    loadingDistritos = false;

    constructor(
        private authService: AuthService,
        private clienteService: ClienteService,
        private maestrosService: MaestrosService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
        if (this.user?.id) {
            this.loadProfile();
            this.loadAddresses();
            this.loadDepartamentos();
            this.loadTiposDocumento();
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
            documentoTipo: this.user?.documentoTipo || 'DNI',
            documento: this.user?.documento || this.user?.documentoNumero || ''
        };
        this.profileSubmitted = false;
        this.editingProfile = true;
    }

    cancelEditProfile(): void {
        this.profileSubmitted = false;
        this.editingProfile = false;
    }

    saveProfile(): void {
        if (!this.user?.id) return;
        this.profileSubmitted = true;

        if (this.isProfileInvalid()) {
            return;
        }

        this.savingProfile = true;
        this.clienteService.updateProfile(this.user.id, this.profileForm).subscribe({
            next: (updated) => {
                this.user = updated;
                this.authService.guardarUsuario(updated);
                this.profileSubmitted = false;
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
        this.provincias = [];
        this.distritos = [];
        this.addressSubmitted = false;
        this.showAddressModal = true;
    }

    openEditAddress(addr: Address): void {
        this.editingAddress = addr;
        this.addressForm = { ...addr, tipoDireccion: addr.tipoDireccion || 'CASA' };
        this.addressSubmitted = false;
        this.showAddressModal = true;

        // Cargar cascadas si hay valores
        if (this.addressForm.departamento) {
            this.onDepartamentoChange(this.addressForm.departamento, true);
        }
    }

    closeAddressModal(): void {
        this.showAddressModal = false;
        this.editingAddress = null;
        this.addressSubmitted = false;
    }

    saveAddress(): void {
        if (!this.user?.id) return;
        this.addressSubmitted = true;

        if (this.isAddressInvalid()) {
            return;
        }

        this.savingAddress = true;
        this.addressForm.usuarioId = this.user.id;

        const obs = this.editingAddress
            ? this.clienteService.updateAddress(this.editingAddress.id!, this.addressForm)
            : this.clienteService.createAddress(this.addressForm);

        obs.subscribe({
            next: () => {
                this.savingAddress = false;
                this.showAddressModal = false;
                this.addressSubmitted = false;
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


    private loadTiposDocumento(): void {
        this.maestrosService.obtenerMaestrosPorGrupo('TIPO_DOCUMENTO').subscribe({
            next: (tipos) => {
                this.tiposDocumento = tipos;
                this.cdr.markForCheck();
            },
            error: () => {
                this.maestrosService.obtenerMaestrosPorGrupo('TIPO_DOC').subscribe({
                    next: (tipos) => {
                        this.tiposDocumento = tipos;
                        this.cdr.markForCheck();
                    },
                    error: () => {
                        this.tiposDocumento = [
                            { codigo: 'DNI', descripcion: 'DNI' },
                            { codigo: 'CE', descripcion: 'Carnet de Extranjería' },
                            { codigo: 'RUC', descripcion: 'RUC' }
                        ];
                        this.cdr.markForCheck();
                    }
                });
            }
        });
    }

    private isProfileInvalid(): boolean {
        const nombre = (this.profileForm.nombre || '').trim();
        const apellido = (this.profileForm.apellido || '').trim();
        const telefono = (this.profileForm.telefono || '').trim();
        const documento = (this.profileForm.documento || '').trim();

        if (!nombre || !apellido) return true;
        if (telefono && !/^\d{9}$/.test(telefono)) return true;
        if (documento && !/^\d{8,12}$/.test(documento)) return true;

        return false;
    }

    private isAddressInvalid(): boolean {
        return !this.addressForm.tipoDireccion ||
            !this.addressForm.calle?.trim() ||
            !this.addressForm.departamento ||
            !this.addressForm.provincia ||
            !this.addressForm.distrito;
    }

    shouldShowProfileError(field: 'nombre' | 'apellido' | 'telefono' | 'documento'): boolean {
        if (!this.profileSubmitted) return false;

        const value = (this.profileForm[field] || '').toString().trim();
        if (field === 'nombre' || field === 'apellido') {
            return !value;
        }
        if (field === 'telefono') {
            return !!value && !/^\d{9}$/.test(value);
        }
        if (field === 'documento') {
            return !!value && !/^\d{8,12}$/.test(value);
        }

        return false;
    }

    shouldShowAddressError(field: 'tipoDireccion' | 'calle' | 'departamento' | 'provincia' | 'distrito'): boolean {
        if (!this.addressSubmitted) return false;

        if (field === 'calle') {
            return !this.addressForm.calle?.trim();
        }

        return !this.addressForm[field];
    }

    getDireccionTipoLabel(codigo?: string): string {
        return this.tiposDireccion.find(t => t.codigo === codigo)?.descripcion || 'Otro';
    }

    // ── Ubigeo Helpers ──────────────────────────────

    loadDepartamentos(): void {
        this.maestrosService.obtenerDepartamentos().subscribe({
            next: (data) => {
                this.departamentos = data;
                this.cdr.markForCheck();
            }
        });
    }

    onDepartamentoChange(nombre: string, isInitial = false): void {
        if (!isInitial) {
            this.addressForm.provincia = '';
            this.addressForm.distrito = '';
        }
        this.provincias = [];
        this.distritos = [];

        const depto = this.departamentos.find(d => d.nombre === nombre);
        if (depto) {
            this.loadingProvincias = true;
            this.maestrosService.obtenerProvincias(depto.id).subscribe({
                next: (data) => {
                    this.provincias = data;
                    this.loadingProvincias = false;
                    if (isInitial && this.addressForm.provincia) {
                        this.onProvinciaChange(this.addressForm.provincia, true);
                    }
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.loadingProvincias = false;
                    this.cdr.markForCheck();
                }
            });
        }
    }

    onProvinciaChange(nombre: string, isInitial = false): void {
        if (!isInitial) {
            this.addressForm.distrito = '';
        }
        this.distritos = [];

        const prov = this.provincias.find(p => p.nombre === nombre);
        if (prov) {
            this.loadingDistritos = true;
            this.maestrosService.obtenerDistritos(prov.id).subscribe({
                next: (data) => {
                    this.distritos = data;
                    this.loadingDistritos = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.loadingDistritos = false;
                    this.cdr.markForCheck();
                }
            });
        }
    }

    // ── Helpers ──────────────────────────────────────

    private emptyAddress(): Address {
        return {
            tipoDireccion: 'CASA',
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
