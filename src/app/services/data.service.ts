import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface pour typer les données de réponse
 */
export interface ResponseData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  imageUrl?: string;
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // URL de l'API Google Apps Script (à remplacer par votre URL)
  private readonly API_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercallback';

  constructor(private http: HttpClient) { }

  /**
   * Envoyer les données via POST
   * @param data Données à envoyer
   * @returns Observable de la réponse du serveur
   */
  sendData(data: ResponseData): Observable<any> {
    return this.http.post<any>(this.API_URL, data);
  }

  /**
   * Récupérer les données via GET
   * @returns Observable du tableau de données
   */
  getData(): Observable<ResponseData[]> {
    return this.http.get<ResponseData[]>(this.API_URL);
  }

  /**
   * Mettre à jour une donnée via PUT
   * @param id Identifiant de la donnée
   * @param data Données à mettre à jour
   * @returns Observable de la réponse du serveur
   */
  updateData(id: string, data: ResponseData): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Supprimer une donnée via DELETE
   * @param id Identifiant de la donnée
   * @returns Observable de la réponse du serveur
   */
  deleteData(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`);
  }
}
