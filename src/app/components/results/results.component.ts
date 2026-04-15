import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { DataService, ResponseData } from '../../services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit, OnDestroy {
  // Colonnes en accord avec les données du formulaire
  displayedColumns: string[] = ['name', 'email', 'phone', 'category', 'actions'];
  dataSource!: MatTableDataSource<ResponseData>;
  isLoading = false;
  filterValue = '';

  private destroy$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Charger les données depuis le service
   */
  loadData(): void {
    this.isLoading = true;
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: ResponseData[]) => {
          this.dataSource = new MatTableDataSource<ResponseData>(data);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des données:', error);
          this.isLoading = false;
          // Afficher un tableau vide en cas d'erreur
          this.dataSource = new MatTableDataSource<ResponseData>([]);
        }
      });
  }

  /**
   * Filtrer les données
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.filterValue;
  }

  /**
   * Trier les données
   */
  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      return;
    }

    const data = this.dataSource.data.slice();
    data.sort((a: any, b: any) => {
      const aValue = this.getValueByProperty(a, sort.active);
      const bValue = this.getValueByProperty(b, sort.active);

      let compareValue = 0;
      if (aValue < bValue) {
        compareValue = -1;
      } else if (aValue > bValue) {
        compareValue = 1;
      }

      return sort.direction === 'asc' ? compareValue : -compareValue;
    });

    this.dataSource = new MatTableDataSource<ResponseData>(data);
  }

  /**
   * Récupérer la valeur d'une propriété imbriquée
   */
  private getValueByProperty(obj: any, property: string): any {
    return obj[property];
  }

  /**
   * Naviguer vers le formulaire
   */
  goToForm(): void {
    this.router.navigate(['/']);
  }

  /**
   * Supprimer une ligne
   */
  deleteRow(id: string | undefined): void {
    if (!id) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement?')) {
      this.dataService.deleteData(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadData();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
