import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
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
    MatRadioModule,
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
  hairsColorsSelected: string = this.form?.get('babyHairColor')?.value || '';
  hairsTypesSelected: string = this.form?.get('babyHairType')?.value || '';
  eyesColorsSelected: string = this.form?.get('babyEyesColor')?.value || '';

  private destroy$ = new Subject<void>();

  // Options pour le sexe du bébé
  sexOptions = [
    { label: 'Fille', value: 'F', icon: '👧' },
    { label: 'Garçon', value: 'M', icon: '👦' }
  ];
  
  // Options pour les couleurs de cheveux
  hairColors = [
    { label: 'Blond', value: 'Blond', image: 'Blond.png' },
    { label: 'Brun', value: 'Brun', image: 'Brun.png' },
    { label: 'Châtain', value: 'Chatain', image: 'Chatain.png' },
    { label: 'Roux', value: 'Roux', image: 'Roux.png' },
    { label: 'Comme Papa', value: 'commePapa', image: 'commePapa.png' },
  ];
  
  // Options pour le type de cheveux
  hairTypes = [
    { label: 'Chauve', value: 'Chauve', image: 'cChauve.png' },
    { label: 'Duvet', value: 'Duvet', image: 'cDuvet.png' },
    { label: 'Chevelu', value: 'Chevelu', image: 'cChevelu.png' }
  ];

  // Options pour les couleurs de yeux
  eyesColors = [
    { label: 'Bleus', value: 'Bleus', image: 'yBleu.png' },
    { label: 'Marrons', value: 'Marrons', image: 'yMarron.png' },
    { label: 'Verts', value: 'Verts', image: 'yVert.png' },
    { label: 'Noirs', value: 'Noirs', image: 'yNoir.png' }
  ];

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
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      babySex: ['', Validators.required],
      babyName: ['', [Validators.required, Validators.minLength(2)]],
      babyEyesColor: ['', Validators.required],
      babyHairColor: ['', Validators.required],
      babyBirthDate: ['', Validators.required],
      babyHairType: ['', Validators.required],
      babyWeight: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]]
    });
  }

  onChange(colorLabel: string): void {
    this.hairsColorsSelected = colorLabel;
    console.log('Couleur des cheveux sélectionnée:', this.hairsColorsSelected);
  }

  onEyeColorChange(colorLabel: string): void {
    this.eyesColorsSelected = colorLabel;
    console.log('Couleur des yeux sélectionnée:', this.eyesColorsSelected);
  }

  onHairTypeChange(typeLabel: string): void {
    this.hairsTypesSelected = typeLabel;
    console.log('Type de cheveux sélectionné:', this.hairsTypesSelected);
  }

  onHairColorChange(colorLabel: string): void {
    this.hairsColorsSelected = colorLabel;
    console.log('Couleur des cheveux sélectionnée:', this.hairsColorsSelected);
  }

  /**
   * Vérifier si le formulaire est valide
   */
  isFormValid(): boolean {
    return this.form.valid;
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
      ...this.form.value
    };

    this.dataService.sendData(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSnackBar('Données envoyées avec succès!', 'success');
          this.form.reset();
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
