import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataService, ResponseData } from '../../services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading = false;
  selectedCategory: string = '';
  selectedImage: string = '';
  
  private destroy$ = new Subject<void>();

  // Images de sélection
  categoryImages = [
    { name: 'Personnelle', value: 'personal', icon: '👤', color: '#1976d2' },
    { name: 'Professionnelle', value: 'professional', icon: '💼', color: '#388e3c' },
    { name: 'Autre', value: 'other', icon: '📋', color: '#f57c00' }
  ];

  categories = this.categoryImages.map(img => ({ value: img.value, label: img.name }));

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Initialisation du composant
  }

  /**
   * Initialiser le formulaire réactif
   */
  initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9\\s\\-\\+\\(\\)]+$')]],
      category: ['', Validators.required]
    });
  }

  /**
   * Sélectionner une image de catégorie
   */
  selectImage(image: any): void {
    this.selectedImage = image.value;
    this.form.patchValue({ category: image.value });
  }

  /**
   * Vérifier si le formulaire est valide
   */
  isFormValid(): boolean {
    return this.form.valid && this.selectedImage !== '';
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showSnackBar('Veuillez remplir tous les champs correctement', 'error');
      return;
    }

    this.isLoading = true;
    const formData: ResponseData = {
      ...this.form.value,
      imageUrl: this.selectedImage,
      timestamp: new Date()
    };

    this.dataService.sendData(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSnackBar('Données envoyées avec succès!', 'success');
          this.form.reset();
          this.selectedImage = '';
          // Redirection vers les résultats
          setTimeout(() => {
            this.router.navigate(['/results']);
          }, 500);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur lors de l\'envoi:', error);
          this.showSnackBar('Erreur lors de l\'envoi des données', 'error');
        }
      });
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.form.reset();
    this.selectedImage = '';
  }

  /**
   * Afficher une notification
   */
  private showSnackBar(message: string, type: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
