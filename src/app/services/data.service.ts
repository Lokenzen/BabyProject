import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, timeout, switchMap } from 'rxjs/operators';

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
  // URL de l'API Google Apps Script (IMPORTANT: Configuration à vérifier)
  private readonly GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec';
  
  // Proxies CORS multiples (avec fallback)
  private readonly CORS_PROXIES = [
    'https://cors-anywhere.herokuapp.com/',  // Proxy CORS populaire
    'https://thingproxy.freeboard.io/fetch/', // Alternative stable
    'https://api.allorigins.win/raw?url='     // Fallback
  ];

  constructor(private http: HttpClient) { }

  /**
   * Convertir un objet en FormData
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
   * Encoder l'URL en fonction du proxy utilisé
   */
  private getProxyUrl(proxy: string, targetUrl: string): string {
    // Pour allorigins, utiliser le format ?url=
    if (proxy.includes('allorigins')) {
      return proxy + encodeURIComponent(targetUrl);
    }
    // Pour les autres, concaténer directement
    return proxy + encodeURIComponent(targetUrl);
  }

  /**
   * Envoyer les données via POST au Google Apps Script
   */
  sendData(data: ResponseData): Observable<any> {
    const formData = this.objectToFormData(data);
    
    return this.http.post<any>(this.GOOGLE_APPS_SCRIPT, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    }).pipe(
      timeout(10000), // 10 secondes timeout
      retry(1),
      catchError((error) => {
        console.error('Erreur lors de l\'envoi des données:', error);
        
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Timeout: Le serveur est trop lent'));
        }
        
        if (error.status === 0) {
          return throwError(() => new Error(
            'Erreur CORS ou connexion refusée. Vérifiez que le Google Apps Script est déployé correctement.'
          ));
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer les données via GET avec stratégie de fallback sur les proxies
   */
  getData(): Observable<ResponseData[]> {
    // Essayer le premier proxy
    return this.tryGetDataWithProxy(0);
  }

  /**
   * Essayer de récupérer les données avec un proxy spécifique
   */
  private tryGetDataWithProxy(proxyIndex: number): Observable<ResponseData[]> {
    if (proxyIndex >= this.CORS_PROXIES.length) {
      // Tous les proxies ont échoué, retourner un tableau vide
      console.warn('Tous les proxies CORS ont échoué');
      return of([]);
    }

    const proxy = this.CORS_PROXIES[proxyIndex];
    const proxyUrl = this.getProxyUrl(proxy, this.GOOGLE_APPS_SCRIPT);

    console.log(`Tentative de récupération des données avec proxy ${proxyIndex + 1}...`);

    return this.http.get<ResponseData[]>(proxyUrl, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    }).pipe(
      timeout(8000), // 8 secondes timeout par proxy
      retry(1),
      catchError((error) => {
        console.warn(`Proxy ${proxyIndex + 1} a échoué:`, error.message);
        // Essayer le proxy suivant
        return this.tryGetDataWithProxy(proxyIndex + 1);
      })
    );
  }

  /**
   * Mettre à jour une donnée via PUT
   */
  updateData(id: string, data: ResponseData): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this.http.put<any>(this.GOOGLE_APPS_SCRIPT, data, { params }).pipe(
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
