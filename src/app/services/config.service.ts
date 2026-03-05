import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ConfigCategory } from '../model/config-category.model';
import { ConfigItem } from '../model/config-item.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private apiUrl = `${environment.apiBaseUrl}/config/category`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<ConfigCategory[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data ?? res)
    );
  }

  getCategory(id: number): Observable<ConfigCategory> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  createCategory(data: Partial<ConfigCategory>): Observable<ConfigCategory> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(res => res.data ?? res)
    );
  }

  updateCategory(id: number, data: Partial<ConfigCategory>): Observable<ConfigCategory> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res.data ?? res)
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  getItems(categoryId: number): Observable<ConfigItem[]> {
    return this.http.get<any>(`${this.apiUrl}/${categoryId}/item`).pipe(
      map(res => res.data ?? res)
    );
  }

  getItem(categoryId: number, id: number): Observable<ConfigItem> {
    return this.http.get<any>(`${this.apiUrl}/${categoryId}/item/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  createItem(categoryId: number, data: Partial<ConfigItem>): Observable<ConfigItem> {
    return this.http.post<any>(`${this.apiUrl}/${categoryId}/item`, data).pipe(
      map(res => res.data ?? res)
    );
  }

  updateItem(categoryId: number, id: number, data: Partial<ConfigItem>): Observable<ConfigItem> {
    return this.http.put<any>(`${this.apiUrl}/${categoryId}/item/${id}`, data).pipe(
      map(res => res.data ?? res)
    );
  }

  deleteItem(categoryId: number, id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${categoryId}/item/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  getItemConfig<T>(cat: number, id2: number): Observable<ConfigItem<T>> {
    return this.http
      .get<any>(`${this.apiUrl}/${cat}/item/${id2}`)
      .pipe(
        map((res: any) => {
          const item = res.data ?? res;
          // Normalizamos item.data
          const parsed = typeof item.data === 'string'
            ? JSON.parse(item.data)
            : (item.data ?? {});

          return { ...item, data: parsed } as ConfigItem<T>;
        })
      );
  }
}
