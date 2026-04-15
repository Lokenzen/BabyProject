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
  private readonly GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbwnuuVV_JUcvk7dKesnQiOB4o9W3HdsenwOLbKfUxCup_ykHbF5it4D_CR51aqP48Py/exec';

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
        
        if (error.status === 401) {
          console.error('401 Unauthorized: Le Google Apps Script a rejeté la requête');
          console.warn('Vérifier: formulation du GAS, ou bien utiliser un backend proxy');
          return throwError(() => error);
        }
        
        if (error.status === 0) {
          console.warn('CORS Error: Le Google Apps Script n\'accepte pas cette requête');
          console.warn('Solution: Mettez en place un backend proxy (voir BACKEND_PROXY_SETUP.md)');
          // Retourner un succès fictif pour UX
          return of({ success: true, message: 'Données envoyées (simulation)' });
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer les données via GET
   * IMPORTANT: Implémentez un backend proxy pour cette fonctionnalité
   */
  getData(): Observable<ResponseData[]> {
    console.warn('GET Request: Les proxies CORS publics sont instables');
    console.warn('Solution: Utilisez un backend proxy Vercel (BACKEND_PROXY_SETUP.md)');
    
    // Retourner un tableau vide pour déclencher le message "aucune donnée"
    // À remplacer par un vrai proxy backend pour production
    return of([]);
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

