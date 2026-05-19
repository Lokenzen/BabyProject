import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

/**
 * Interface pour typer les données de réponse
 */
export interface ResponseData {
  firstName: string;
  lastName: string;
  babySex: string;
  babyNameGirl?: string;
  babyNameBoy?: string;
  babyEyesColor?: string;
  babyHairColor?: string;
  babyBirthDate?: string;
  babyBirthHour?: string;
  babyBirthMinute?: string;
  babyHairType?: string;
  babyWeight?: string;
  babyHeight?: string;
  createdDate?: string;
  mommyPlace?: string;
  daddyPlace?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // URL de l'API Google Apps Script
  private readonly GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbwMLjCjq6z3eUBCorMcMwj-IROb0GS_VcTU1VzCF1Lvbv_wKl_9kIMa5NSWGHM7d87e/exec';

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

sendData(data: ResponseData): Observable<any> {
  const formData = this.objectToFormData(data);
  
  // On ajoute { responseType: 'text' } car Google Apps Script 
  // fait une redirection que HttpClient n'aime pas en mode JSON
  return this.http.post(this.GOOGLE_APPS_SCRIPT, formData, { responseType: 'text' }).pipe(
    timeout(10000),
    retry(1),
    catchError((error) => {
      // Si la ligne arrive dans le sheet mais que status = 0, c'est un faux positif
      if (error.status === 0 || error.status === 200) {
        return of({ status: 'success' }); // On simule un succès
      }
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
   * Rechercher une personne par firstName et lastName
   */
  searchParticipant(firstName: string, lastName: string): Observable<any> {
  const url = `${this.GOOGLE_APPS_SCRIPT}?firstName=${firstName}&lastName=${lastName}`;
  
  return this.http.get(url).pipe(
    timeout(10000),
    catchError(error => {
      console.error('Erreur de recherche:', error);
      return throwError(() => error);
    })
  );
}

  /**
   * Mettre à jour une donnée via PUT
   */
  updateData(id: string, data: ResponseData) {
    const params = new HttpParams().set('id', id);
    const formData = this.objectToFormData(data);
    
    this.http.post(this.GOOGLE_APPS_SCRIPT, formData, { responseType: 'text' })
    .subscribe({
      next: (res) => console.log('Succès !', res),
      error: (err) => {
        // Si le status est 0 mais que la ligne apparaît dans Google Sheet, 
        // c'est juste le navigateur qui fait son timide.
        console.error('Erreur CORS mais vérifiez votre Sheet !', err);
      }
    });
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

  private selectedParticipantSource = new BehaviorSubject<ResponseData | null>(null);
  // Observable que le composant de détail va écouter
  selectedParticipant$ = this.selectedParticipantSource.asObservable();

  setParticipant(data: ResponseData) {
    this.selectedParticipantSource.next(data);
  }
}


