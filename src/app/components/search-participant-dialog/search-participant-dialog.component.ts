import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-search-participant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './search-participant-dialog.component.html',
  styleUrl: './search-participant-dialog.component.scss'
})
export class SearchParticipantDialogComponent {
  form: FormGroup;
  isSearching = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    public dialogRef: MatDialogRef<SearchParticipantDialogComponent>
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSearch(): void {
    if (!this.form.valid) {
      return;
    }

    this.isSearching = true;
    this.errorMessage = '';

    const firstName = this.form.get('firstName')?.value.trim();
    const lastName = this.form.get('lastName')?.value.trim();

    this.dataService.searchParticipant(firstName, lastName).subscribe({
      next: (result) => {
        this.isSearching = false;
        // Vérifier si le résultat contient une erreur
        if (result && result.error) {
          this.errorMessage = result.error;
        } else if (result) {
          // Succès - retourner les données
          this.dialogRef.close({ success: true, data: result, firstName, lastName });
        } else {
          this.errorMessage = 'Personne non trouvée';
        }
      },
      error: (error) => {
        this.isSearching = false;
        console.error('Erreur de recherche:', error);
        this.errorMessage = 'Erreur lors de la recherche. Veuillez réessayer.';
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (control?.hasError('required')) {
      return `${field === 'firstName' ? 'Prénom' : 'Nom'} requis`;
    }
    if (control?.hasError('minlength')) {
      return `Au moins 2 caractères`;
    }
    return '';
  }
}
