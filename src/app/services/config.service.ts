import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConfigCategory } from '../model/config-category.model';
import { ConfigItem } from '../model/config-item.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private apiUrl = `${environment.apiBaseUrl}/config/category`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ConfigCategory[]> {
    return this.http.get<ConfigCategory[]>(this.apiUrl);
  }

  getCategory(id: number): Observable<ConfigCategory> {
    return this.http.get<ConfigCategory>(`${this.apiUrl}/${id}`);
  }

  createCategory(data: Partial<ConfigCategory>): Observable<ConfigCategory> {
    return this.http.post<ConfigCategory>(this.apiUrl, data);
  }

  updateCategory(id: number, data: Partial<ConfigCategory>): Observable<ConfigCategory> {
    return this.http.put<ConfigCategory>(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getItems(categoryId: number): Observable<ConfigItem[]> {
    return this.http.get<ConfigItem[]>(`${this.apiUrl}/${categoryId}/item`);
  }

  getItem(categoryId: number, id: number): Observable<ConfigItem> {
    return this.http.get<ConfigItem>(`${this.apiUrl}/${categoryId}/item/${id}`);
  }

  createItem(categoryId: number, data: Partial<ConfigItem>): Observable<ConfigItem> {
    return this.http.post<ConfigItem>(`${this.apiUrl}/${categoryId}/item`, data);
  }

  updateItem(categoryId: number, id: number, data: Partial<ConfigItem>): Observable<ConfigItem> {
    return this.http.put<ConfigItem>(`${this.apiUrl}/${categoryId}/item/${id}`, data);
  }

  deleteItem(categoryId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${categoryId}/item/${id}`);
  }
}
