import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
import { Address } from '../model/address.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
    private userUrl = `${environment.apiBaseUrl}/user`;
    private dirUrl = `${environment.apiBaseUrl}/direcciones`;

    constructor(private http: HttpClient) { }

    // ── Perfil ──
    getProfile(uid: number): Observable<User> {
        return this.http.get<User>(`${this.userUrl}/perfil`, { params: { uid: uid.toString() } });
    }

    updateProfile(uid: number, data: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.userUrl}/perfil`, data, { params: { uid: uid.toString() } });
    }

    // ── Direcciones ──
    getAddresses(uid: number): Observable<Address[]> {
        return this.http.get<Address[]>(`${this.dirUrl}/usuario/${uid}`);
    }

    createAddress(data: Address): Observable<Address> {
        return this.http.post<Address>(this.dirUrl, data);
    }

    updateAddress(id: number, data: Address): Observable<Address> {
        return this.http.put<Address>(`${this.dirUrl}/${id}`, data);
    }

    deleteAddress(id: number): Observable<void> {
        return this.http.delete<void>(`${this.dirUrl}/${id}`);
    }
}
