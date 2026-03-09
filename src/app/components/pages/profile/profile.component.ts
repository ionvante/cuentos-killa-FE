import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';
import { MaestrosService } from '../../../services/maestros.service';
import { User } from '../../../model/user.model';
import { Address } from '../../../model/address.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { normalizeUser } from '../../../utils/user-normalizer';

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
    loadingDepartamentos = false;
    loadingProvincias = false;
    loadingDistritos = false;
    addressErrors: Partial<Record<'tipoDireccion' | 'calle' | 'departamento' | 'provincia' | 'distrito', string>> = {};

    constructor(
        private authService: AuthService,
        private clienteService: ClienteService,
        private maestrosService: MaestrosService,
        private cdr: ChangeDetectorRef,
        private elementRef: ElementRef<HTMLElement>
    ) { }

    ngOnInit(): void {
        this.user = normalizeUser(this.authService.getUser() as any);
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
            documentoNumero: this.user?.documentoNumero || ''
        };
        this.profileSubmitted = false;
        this.editingProfile = true;
    }

    cancelEditProfile(): void {
        this.profileSubmitted = false;
        this.editingProfile = false;
    }

    isProfileInvalid(): boolean {
        return !this.profileForm.nombre || !this.profileForm.apellido || !this.profileForm.documentoNumero || !this.profileForm.documentoTipo;
    }

    shouldShowProfileError(field: 'nombre' | 'apellido' | 'documentoNumero' | 'documentoTipo' | 'telefono'): boolean {
        return this.profileSubmitted && !this.profileForm[field];
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
                this.showToast('No pudimos actualizar tu perfil. Inténtalo nuevamente.', 'error');
                this.cdr.markForCheck();
            }
        });
    }

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
        this.addressErrors = {};
        this.showAddressModal = true;
        setTimeout(() => this.focusAddressField('calle'));
    }

    openEditAddress(addr: Address): void {
        this.editingAddress = addr;
        this.addressForm = { ...addr };
        this.addressErrors = {};
        this.showAddressModal = true;
        setTimeout(() => this.focusAddressField('calle'));

        if (this.addressForm.departamento) {
            this.onDepartamentoChange(this.addressForm.departamento, true);
        }
    }

    closeAddressModal(): void {
        this.showAddressModal = false;
        this.editingAddress = null;
        this.addressErrors = {};
    }

    saveAddress(): void {
        if (!this.user?.id) return;

        if (!this.validateAddressForm()) {
            this.showToast('Revisa el formulario y completa los campos obligatorios para guardar la dirección.', 'error');
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
                this.showToast(this.editingAddress ? 'Dirección actualizada' : 'Dirección agregada', 'success');
                this.loadAddresses();
            },
            error: () => {
                this.savingAddress = false;
                this.showToast('No pudimos guardar la dirección. Verifica los datos e inténtalo nuevamente.', 'error');
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
                this.showToast('No pudimos eliminar la dirección. Inténtalo nuevamente.', 'error');
                this.cdr.markForCheck();
            }
        });
    }

    loadDepartamentos(): void {
        this.loadingDepartamentos = true;
        this.maestrosService.obtenerDepartamentos().subscribe({
            next: (data) => {
                this.departamentos = data;
                this.loadingDepartamentos = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.loadingDepartamentos = false;
                this.cdr.markForCheck();
            }
        });
    }

    loadTiposDocumento(): void {
        this.maestrosService.obtenerMaestrosPorGrupo('TIPO_DOCUMENTO').subscribe({
            next: (data) => {
                this.tiposDocumento = data || [];
                this.cdr.markForCheck();
            },
            error: () => {
                this.tiposDocumento = [];
                this.cdr.markForCheck();
            }
        });
    }

    getTipoDocumentoDisplay(codigo: string | undefined): string {
        if (!codigo) return '—';
        const tipo = this.tiposDocumento.find(t => t.codigo === codigo);
        return tipo ? (tipo.valor || tipo.descripcion || codigo) : codigo;
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

    @HostListener('document:keydown.escape')
    onEscapeKey(): void {
        if (this.showAddressModal) {
            this.closeAddressModal();
        }
    }

    private validateAddressForm(): boolean {
        this.addressErrors = {
            calle: this.addressForm.calle ? '' : 'Completa la calle o dirección para continuar.',
            departamento: this.addressForm.departamento ? '' : 'Selecciona un departamento para continuar.',
            provincia: this.addressForm.provincia ? '' : 'Selecciona una provincia para continuar.',
            distrito: this.addressForm.distrito ? '' : 'Selecciona un distrito para continuar.'
        };

        const firstInvalid = (['tipoDireccion', 'calle', 'departamento', 'provincia', 'distrito'] as const)
            .find((field) => !!this.addressErrors[field]);

        if (firstInvalid) {
            this.focusAddressField(firstInvalid);
            this.cdr.markForCheck();
            return false;
        }

        return true;
    }

    private focusAddressField(field: 'tipoDireccion' | 'calle' | 'departamento' | 'provincia' | 'distrito'): void {
        const el = this.elementRef.nativeElement.querySelector<HTMLElement>(`#address-${field}`);
        el?.focus();
    }

    getAddressDescribedBy(field: 'tipoDireccion' | 'calle' | 'departamento' | 'provincia' | 'distrito', helpId: string): string {
        return this.addressErrors[field] ? `${helpId} ${field}-error` : helpId;
    }

    shouldShowAddressError(field: 'tipoDireccion' | 'calle' | 'departamento' | 'provincia' | 'distrito'): boolean {
        return !!this.addressErrors[field];
    }

    private emptyAddress(): Address {
        return {
            tipoDireccion: 'CASA',
            calle: '', ciudad: '', departamento: '', provincia: '',
            distrito: '', referencia: '', codigoPostal: '',
            esPrincipal: false, esFacturacion: false
        };
    }

    getDireccionTipoLabel(codigo: string | undefined): string {
        if (!codigo) return '';
        const tipo = this.tiposDireccion.find(t => t.codigo === codigo);
        return tipo ? tipo.descripcion : codigo;
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
