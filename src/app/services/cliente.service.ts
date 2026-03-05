import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../model/user.model';
import { Address } from '../model/address.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
    private userUrl = `${environment.apiBaseUrl}/users`;
    private dirUrl = `${environment.apiBaseUrl}/direcciones`;

    constructor(private http: HttpClient) { }

    // ── Perfil ──
    getProfile(uid: number): Observable<User> {
        return this.http.get<any>(`${this.userUrl}/perfil`, { params: { uid: uid.toString() } }).pipe(
            map(res => res.data ?? res)
        );
    }

    updateProfile(uid: number, data: Partial<User>): Observable<User> {
        return this.http.put<any>(`${this.userUrl}/perfil`, data, { params: { uid: uid.toString() } }).pipe(
            map(res => res.data ?? res)
        );
    }

    // ── Direcciones ──
    getAddresses(uid: number): Observable<Address[]> {
        return this.http.get<any>(`${this.dirUrl}/usuario/${uid}`).pipe(
            map(res => res.data ?? res)
        );
    }

    createAddress(data: Address): Observable<Address> {
        return this.http.post<any>(this.dirUrl, data).pipe(
            map(res => res.data ?? res)
        );
    }

    updateAddress(id: number, data: Address): Observable<Address> {
        return this.http.put<any>(`${this.dirUrl}/${id}`, data).pipe(
            map(res => res.data ?? res)
        );
    }

    deleteAddress(id: number): Observable<void> {
        return this.http.delete<any>(`${this.dirUrl}/${id}`).pipe(
            map(res => res.data ?? res)
        );
    }
}
