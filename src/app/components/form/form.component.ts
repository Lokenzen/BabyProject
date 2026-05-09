import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSliderModule} from '@angular/material/slider';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { DataService, ResponseData } from '../../services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { LOCALE_ID } from '@angular/core';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeFr);
import { DateAdapter, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

interface TabConfig {
  title: string;
  fields: string[];
}

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
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSliderModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
  animations: [
    trigger('stepAnimation', [
      transition(':increment', [ // Quand on fait "Suivant"
        group([
          query(':enter', [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ], { optional: true }),
        ])
      ]),
      transition(':decrement', [ // Quand on fait "Précédent"
        group([
          query(':enter', [
            style({ opacity: 0, transform: 'translateY(-20px)' }),
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ], { optional: true }),
        ])
      ])
    ])
  ]
})
export class FormComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  
  form!: FormGroup;
  isLoading = false;
  currentStepIndex = 0;
  hairsColorsSelected: string = this.form?.get('babyHairColor')?.value || '';
  hairsTypesSelected: string = this.form?.get('babyHairType')?.value || '';
  eyesColorsSelected: string = this.form?.get('babyEyesColor')?.value || '';

  private destroy$ = new Subject<void>();

  // Configuration des étapes
  steps: TabConfig[] = [
    { title: 'Bienvenue', fields: [] },
    { title: 'Sexe du Bébé', fields: ['babySex'] },
    { title: 'Défi', fields: [] },
    { title: 'Prénom', fields: ['babyNameGirl', 'babyNameBoy'] },
    { title: 'Yeux', fields: ['babyEyesColor'] },
    { title: 'CheveuxColor', fields: ['babyHairColor'] },
    { title: 'CheveuxType', fields: ['babyHairType'] },
    { title: 'Mensurations', fields: ['babyWeight', 'babyHeight'] }, // taille et poids
    { title: 'Date de Naissance', fields: ['babyBirthDate'] },
    { title: 'Heure de Naissance', fields: ['babyBirthHour', 'babyBirthMinute'] },
    { title: 'Lieux', fields: ['mommyPlace', 'daddyPlace'] },
    { title: 'Vos Infos', fields: ['firstName', 'lastName', 'message'] }
  ];

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
    private snackBar: MatSnackBar,
    private _adapter: DateAdapter<any>
  ) {
    this._adapter.setLocale('fr-FR');
    this.initializeForm();
  }

  ngOnInit(): void {
    // Initialisation du composant
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Mise à jour réactive
      });
  }

  /**
   * Aller à l'étape suivante
   */
  goToNextStep(): void {
    if (this.stepper && this.isStepValid(this.currentStepIndex)) {
      this.currentStepIndex++;
      this.stepper.next();
    } else {
      this.showSnackBar('Veuillez remplir cette étape correctement', 'error');
    }
  }

  /**
   * Aller à l'étape précédente
   */
  goToPreviousStep(): void {
    if (this.stepper) {
      this.currentStepIndex--;
      this.stepper.previous();
    }
  }

  /**
   * Vérifier si on est à la dernière étape
   */
  isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }

  /**
   * Vérifier si on est à la première étape
   */
  isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }

  /**
   * Initialiser le formulaire réactif
   */
  initializeForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      babySex: ['', Validators.required],
      babyNameGirl: ['', [Validators.required, Validators.minLength(2)]],
      babyNameBoy: ['', [Validators.required, Validators.minLength(2)]],
      babyEyesColor: ['', Validators.required],
      babyHairColor: ['', Validators.required],
      babyBirthDate: [new Date(2026, 9, 11), Validators.required],
      babyHairType: ['', Validators.required],
      babyWeight: [3.4, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      babyHeight: [48, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      babyBirthHour: [12, Validators.required],
      babyBirthMinute: [0, Validators.required],
      daddyPlace: [''],
      mommyPlace: [''],
      message: ['']
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

  adjustTime(unit: 'hour' | 'minute', amount: number) {
    const controlName = unit === 'hour' ? 'babyBirthHour' : 'babyBirthMinute';
    const control = this.form.get(controlName);
    let newValue = control?.value + amount;

    if (unit === 'hour') {
      if (newValue > 23) newValue = 0;
      if (newValue < 0) newValue = 23;
    } else {
      if (newValue > 55) newValue = 0;
      if (newValue < 0) newValue = 55;
    }

    control?.setValue(newValue);
  }

  /**
   * Vérifier si une étape est valide
   */
  isStepValid(stepIndex: number): boolean {
    const step = this.steps[stepIndex];
    if (step != undefined && step.fields != null) {
      if (step.fields.length === 0) {
        return true; // L'étape de bienvenue est toujours valide
      }
      
      for (const field of step.fields) {
        const control = this.form.get(field);
        if (!control || control.invalid) {
          return false;
        }
      }
    }
    
    return true;
  }


  get progressValue(): number {
    // Si le stepper n'est pas encore prêt, on affiche 0%
    if (!this.stepper) {
      return 0;
    }
    
    const totalSteps = this.stepper.steps.length;
    const currentStep = this.stepper.selectedIndex + 1;
    return (currentStep / totalSteps) * 100;
  }

  /**
   * Obtenir le label de l'étape
   */
  getStepLabel(stepIndex: number): string {
    return this.steps[stepIndex]?.title || '';
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

  formatWeightLabel(value: number): string {
    return `${value}kg`;
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
