import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Store } from 'src/app/plugin.store';
import { CanvasComponent } from "../canvas/canvas.component";
import { MatStepper, MatStepperModule, StepperOrientation } from "@angular/material/stepper";
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { filter, first, map, Observable, Subject, takeUntil } from "rxjs";
import { BreakpointObserver } from "@angular/cdk/layout";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from "@angular/material/divider";
import { MatRadioModule } from "@angular/material/radio";

@Component({
  selector: 'app-complete',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSlideToggleModule, CanvasComponent, MatStepperModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatListModule, MatDividerModule, MatRadioModule],
  templateUrl: './complete.component.html',
})
export class CompleteComponent implements OnInit, OnDestroy{
  @ViewChild(CanvasComponent) canvasComponent!: CanvasComponent;
  @ViewChild(MatStepper) private stepper!: MatStepper;
  protected vm$ = this.store.vm$;

  private _formBuilder = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required]
  });
  secondFormGroup: FormGroup<{
    serviceConformityCtrl: FormControl<string | null>;
    satisfactionCtrl: FormControl<string | null>;
    checkedServicesCtrl: FormControl<string[] | null>;
    othersCtrl: FormControl<string | null>;
  }> = this._formBuilder.group({
    serviceConformityCtrl: [''],
    satisfactionCtrl: [''],
    checkedServicesCtrl: [[] as string[]],
    othersCtrl: ['']
  });

  stepperOrientation: Observable<StepperOrientation>;

  constructor(protected readonly store: Store) {
    const breakpointObserver = inject(BreakpointObserver);
    this.stepperOrientation = breakpointObserver.observe(['(min-width: 800px)']).pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));
  }

  // Lifecycle
  ngOnInit() {
    this.store.vm$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(vm => {
      // Service conformity section
      const serviceConformityCtrl = this.secondFormGroup.get('serviceConformityCtrl');
      if (vm.masterFlag === 'Y') {
        serviceConformityCtrl?.setValidators([Validators.required]);
      } else {
        serviceConformityCtrl?.clearValidators();
        serviceConformityCtrl?.setValue('');
      }
      serviceConformityCtrl?.updateValueAndValidity({emitEvent: false});

      // TC section
      const satisfactionCtrl = this.secondFormGroup.get('satisfactionCtrl');
      const checkedServicesCtrl = this.secondFormGroup.get('checkedServicesCtrl');
      if (vm.tcSectionVisibilitySettings) {
        satisfactionCtrl?.setValidators(Validators.required);
        this.applyCheckedServicesValidators(satisfactionCtrl?.value, checkedServicesCtrl);
        satisfactionCtrl?.valueChanges.pipe(
          takeUntil(this.destroy$)
        ).subscribe(satisfactionValue => {
          this.applyCheckedServicesValidators(satisfactionValue, checkedServicesCtrl);
          this.secondFormGroup.updateValueAndValidity();
        })
      } else {
        satisfactionCtrl?.clearValidators();
        satisfactionCtrl?.setValue(''); // Limpiar valor si se oculta
        checkedServicesCtrl?.clearValidators();
        checkedServicesCtrl?.setValue([]); // Limpiar valor si se oculta
      }
      satisfactionCtrl?.updateValueAndValidity({ emitEvent: false });
      checkedServicesCtrl?.updateValueAndValidity({ emitEvent: false});

      // Others
      const otherCtrl = this.secondFormGroup.get('othersCtrl');
      if (vm.othersVisibilitySettings) {
        /*otherCtrl?.setValidators(Validators.required);*/
        otherCtrl?.clearValidators();
      } else {
        otherCtrl?.clearValidators();
        otherCtrl?.setValue('');
      }
      otherCtrl?.updateValueAndValidity({ emitEvent: false });
      this.secondFormGroup.updateValueAndValidity();
      })
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helpers
  private applyCheckedServicesValidators(satisfactionValue: string | null | undefined, checkedServicesCtrl: AbstractControl | null) {
    if (checkedServicesCtrl) {
      if (satisfactionValue && satisfactionValue === 'Y') {
        checkedServicesCtrl.setValidators([Validators.required, (control: AbstractControl): {[key: string]: any} | null => {
          const value = control.value;
          return value && Array.isArray(value) && value.length > 0 ? null : { requiredSelection: true };
        }]);
      } else {
        checkedServicesCtrl.clearValidators();
        checkedServicesCtrl.setValue([]);
      }
      checkedServicesCtrl.updateValueAndValidity({emitEvent: false});
    }
  }

  async processDrawnSignatures() {
    if (this.canvasComponent) {
      const clientSignBlob = await this.canvasComponent.getClientSignAsBlob();
      /*const techSignBlob = await this.canvasComponent.getTechSignAsBlob();*/

      if (clientSignBlob) {
        this.store.processDrawnClientSignature(clientSignBlob);
        this.store.select(state => state.clientSignatureResult).pipe(
          filter(result => result !== undefined),
          first(),
          takeUntil(this.destroy$)
        ).subscribe(signatureResult => {
          if (signatureResult?.result === true) {
            if (this.firstFormGroup.get('firstCtrl')) {
              this.firstFormGroup.get('firstCtrl')!.setValue('signature_validated');
            }
            if (this.stepper && this.stepper.selected) {
              this.stepper.selected.completed = true;
              this.stepper.selected.editable = false;
              this.store.submitDrawnSignatures();
              this.stepper.next();
            }
          } else {
            /*console.log("La firma del cliente no es válida, no se avanzará en el flujo.");*/
            if (this.firstFormGroup.get('firstCtrl')) {
              this.firstFormGroup.get('firstCtrl')!.setValue('');
              this.firstFormGroup.get('firstCtrl')!.markAsTouched();
            }
          }
        })
      }
      /*if (techSignBlob) this.store.processDrawnTechSignature(techSignBlob);*/
      /*this.store.showValidationResults();*/
    } else {
      console.log("CanvasComponent no está disponible.");
    }
  }

  // Methods
  clearSignatures() {
    if (this.canvasComponent) {
      this.canvasComponent.clearClientCanvas();
      /*this.canvasComponent.clearTechCanvas();*/
      this.store.patchState({
        clientSignature: null,
        clientSignatureHandled: null,
        clientSignatureResult: undefined,
        technicianSignature: null,
        technicianSignatureHandled: null,
        technicianSignatureResult: undefined
      });
      this.firstFormGroup.reset({ firstCtrl: ''});
      if (this.stepper && this.stepper.steps.first) {
        this.stepper.steps.first.editable = true;
        this.stepper.steps.first.completed = false;
      }
    }
  }
  submit() {
    if (this.secondFormGroup.valid) {
      this.store.completeActivity(this.secondFormGroup.getRawValue());
    } else {
      Object.values(this.secondFormGroup.controls).forEach(control => {
        control.markAsTouched();
      });
      console.log("El formulario de encuesta no es válido");
    }
  }

  // Getters
  get canValidateSignatures(): boolean {
    /*return !!(this.canvasComponent?.clientHasContent && this.canvasComponent?.techHasContent);*/
    return !!(this.canvasComponent?.clientHasContent);
  }
  get canClearSignatures(): boolean {
    /*return !!(this.canvasComponent?.clientHasContent || this.canvasComponent?.techHasContent);*/
    return !!(this.canvasComponent?.clientHasContent);
  }
  get serviceConformityCtrlHasError() {
    return this.secondFormGroup.get('serviceConformityCtrl')?.hasError('required');
  }
  get satisfactionCtrlHasError() {
    return this.secondFormGroup.get('satisfactionCtrl')?.hasError('required')
  }
  get checkedServicesCtrlHasError() {
    return this.secondFormGroup.get('checkedServicesCtrl')?.hasError('requiredSelection');
  }
  get otherCtrlHasError() {
    return this.secondFormGroup.get('othersCtrl')?.hasError('required');
  }
}
