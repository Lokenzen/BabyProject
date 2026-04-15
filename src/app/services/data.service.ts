import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

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
  [key: string]: any; // Pour les propriétés additionnelles
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // URL de l'API Google Apps Script
  private readonly GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec';
  
  // Proxy CORS gratuit pour contourner les restrictions CORS
  private readonly CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  constructor(private http: HttpClient) { }

  /**
   * Convertir un objet en paramètres d'URL (format x-www-form-urlencoded)
   */
  private objectToFormData(obj: any): FormData {
    const formData = new FormData();
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        formData.append(key, obj[key]);
      }
    }
    return formData;
  }

  /**
   * Envoyer les données via POST au Google Apps Script
   * @param data Données à envoyer
   * @returns Observable de la réponse du serveur
   */
  sendData(data: ResponseData): Observable<any> {
    // Convertir les données en FormData pour le Google Apps Script
    const formData = this.objectToFormData(data);
    
    return this.http.post<any>(this.GOOGLE_APPS_SCRIPT, formData, {
      headers: {
        // Let Angular set the correct content type for FormData
      }
    }).pipe(
      retry(1),
      catchError((error) => {
        console.error('Erreur lors de l\'envoi des données:', error);
        // Si la requête CORS échoue, on tente une approche alternative
        if (error.status === 0 || error.statusText === 'Unknown Error') {
          return throwError(() => new Error('Erreur CORS: Le serveur n\'autorise pas cette requête. Vérifiez la configuration du Google Apps Script.'));
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer les données via GET avec proxy CORS
   * @returns Observable du tableau de données
   */
  getData(): Observable<ResponseData[]> {
    const proxyUrl = this.CORS_PROXY + encodeURIComponent(this.GOOGLE_APPS_SCRIPT);
    
    return this.http.get<ResponseData[]>(proxyUrl).pipe(
      retry(2),
      catchError((error) => {
        console.error('Erreur lors de la récupération des données:', error);
        return throwError(() => new Error('Impossible de récupérer les données. Vérifiez votre connexion internet.'));
      })
    );
  }

  /**
   * Mettre à jour une donnée via PUT
   * @param id Identifiant de la donnée
   * @param data Données à mettre à jour
   * @returns Observable de la réponse du serveur
   */
  updateData(id: string, data: ResponseData): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this.http.put<any>(this.GOOGLE_APPS_SCRIPT, data, { params }).pipe(
      retry(1),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprimer une donnée via DELETE
   * @param id Identifiant de la donnée
   * @returns Observable de la réponse du serveur
   */
  deleteData(id: string): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<any>(this.GOOGLE_APPS_SCRIPT, { params }).pipe(
      retry(1),
      catchError((error) => {
        console.error('Erreur lors de la suppression:', error);
        return throwError(() => error);
      })
    );
  }
}
