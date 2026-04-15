import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

/**
 * Interface pour typer les données de réponse
 */
export interface ResponseData {
  firstName: string;
  lastName: string;
  babySex: string;
  babyName?: string;
  babyEyesColor?: string;
  babyHairColor?: string;
  babyBirthDate?: string;
  babyHairType?: string;
  babyWeight?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // URL de l'API Google Apps Script
  private readonly GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbxEiQ8-aOtnPDm7VqvCukwOHaWK-mi2A24VIMuSGrAUsGuj0rCXGCWGaowq3NDK3Agv/exec';

  constructor(private http: HttpClient) { }

  /**
   * Convertir un objet en FormData - Exclure les valeurs null/undefined
   */
  private objectToFormData(obj: any): FormData {
    const formData = new FormData();
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] != null && obj[key] !== '') {
        // Convertir les dates au format ISO pour que le GAS les comprenne
        if (obj[key] instanceof Date) {
          formData.append(key, obj[key].toISOString());
        } else {
          formData.append(key, String(obj[key]));
        }
      }
    }
    return formData;
  }

  /**
   * Envoyer les données via POST au Google Apps Script
   * FormData contourne le préflight CORS
   */
  sendData(data: ResponseData): Observable<any> {
    const formData = this.objectToFormData(data);
    
    return this.http.post<any>(this.GOOGLE_APPS_SCRIPT, formData).pipe(
      timeout(10000),
      retry(1),
      catchError((error) => {
        console.error('Erreur lors de l\'envoi des données:', error);        
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer les données via GET
   * IMPORTANT: Implémentez un backend proxy pour cette fonctionnalité
   */
  getData(): Observable<ResponseData[]> {

    return this.http.get<any[]>(this.GOOGLE_APPS_SCRIPT);
  }

  /**
   * Mettre à jour une donnée via PUT
   */
  updateData(id: string, data: ResponseData): Observable<any> {
    const params = new HttpParams().set('id', id);
    const formData = this.objectToFormData(data);
    
    return this.http.put<any>(this.GOOGLE_APPS_SCRIPT, formData, { params }).pipe(
      timeout(10000),
      retry(1),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprimer une donnée via DELETE
   */
  deleteData(id: string): Observable<any> {
    const params = new HttpParams().set('id', id);
    
    return this.http.delete<any>(this.GOOGLE_APPS_SCRIPT, { params }).pipe(
      timeout(10000),
      retry(1),
      catchError((error) => {
        console.error('Erreur lors de la suppression:', error);
        return throwError(() => error);
      })
    );
  }
}

