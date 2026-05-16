import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { DataService, ResponseData } from '../../services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatGridListModule
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
  personData: ResponseData | null = null;
  isLoading = true;
  errorMessage = '';
  firstName = '';
  lastName = '';

  private destroy$ = new Subject<void>();
  imagePath: string = '';

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Récupérer les paramètres de la route (query params ou path params)
    this.dataService.selectedParticipant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('Données reçues pour le détail :', data);   
        if (data) {
          this.personData = data;
          this.imagePath = this.personData.babySex === 'Boy' 
            ? 'assets/Boy.png' 
            : 'assets/Fille.png';
          this.isLoading = false;
        } else {
          this.router.navigate(['']);
          // Optionnel : si l'utilisateur rafraîchit la page (F5), le service est vide.
          // Tu peux ici utiliser les queryParams pour refaire une petite recherche auto.
        }
      });
  }

  goBack(): void {
    this.router.navigate(['']);
  }

  getAdditionalKeys(): string[] {
    if (!this.personData) return [];
    
    const excludeKeys = [
      'firstName',
      'lastName',
      'babyNameGirl',
      'babyNameBoy',
      'babySex',
      'babyEyesColor',
      'babyHairColor',
      'babyBirthDate',
      'babyHairType',
      'babyWeight'
    ];

    return Object.keys(this.personData)
      .filter(key => !excludeKeys.includes(key) && this.personData?.[key] !== null && this.personData?.[key] !== '');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
