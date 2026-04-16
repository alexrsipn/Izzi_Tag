import {Component, Inject, Injectable} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  error(error: Error | string): Observable<void> {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: error,
    });
    return dialogRef.afterClosed();
  }

  success(message: string): Observable<void> {
    const dialogRef = this.dialog.open(SuccessDialogComponent, {
      data: message,
    });
    return dialogRef.afterClosed();
  }

  confirmAssign(apptNumber: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmAssignDialogComponent, {
      data: apptNumber,
      width: '320px',
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  confirm(message: string): Observable<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: message,
    });
    return dialogRef.afterClosed();
  }
}

@Component({
    selector: 'app-error-dialog',
    imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule],
    template: `
    <h1 mat-dialog-title style="margin-top: 1rem; display: flex">
      <span>Error </span>
      <span style="align-self: center;">
        <mat-icon aria-hidden="false" aria-label="Error icon" fontIcon="error" color="warn"></mat-icon>
      </span>
    </h1>
    <mat-dialog-content>
      <span *ngIf="data; else unidentifiedError">
        <p>{{data && data}}</p>
        <p>{{data.name && data.name}}</p>
        <p>{{data.message && data.message}}</p>
      </span>
      <ng-template #unidentifiedError>
        <p>Error no identificado</p>
      </ng-template>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button style="width: 100%;" mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `
})
export class ErrorDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Error) {}
}

@Component({
    selector: 'app-scc-dialog',
    imports: [MatIconModule, MatButtonModule, MatDialogModule],
    template: `
    <h1 mat-dialog-title style="margin-top: 1rem; display: flex">
      <span>Éxito </span>
      <span style="align-self: center;">
        <mat-icon aria-hidden="false" aria-label="Success icon" fontIcon="check_circle" color="primary"></mat-icon>
      </span>
    </h1>
    <mat-dialog-content>
      <p>{{data}}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button style="width: 100%;" mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `
})
export class SuccessDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Error) {}
}

@Component({
    selector: 'app-confirm-dialog',
    imports: [MatIconModule, MatButtonModule, MatDialogModule],
    template: `
    <h2 mat-dialog-title>Confirmar movimiento de recursos</h2>
    <mat-dialog-content>
      <p>{{data}}</p>
    </mat-dialog-content>
    <mat-dialog-actions style="display: flex; justify-content: space-around; align-items: center">
      <button style="width: 40%" mat-button mat-dialog-close [mat-dialog-close]="false">No</button>
      <button style="width: 40%" mat-flat-button [mat-dialog-close]="true" color="primary" cdkFocusInitial>Si</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Error) {
  }
}

@Component({
    selector: 'app-confirm-assign-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, CommonModule],
    template: `
    <div class="p-4">
      <h2 mat-dialog-title class="text-lg! font-bold! text-cyan-900! mb-2! text-center">Confirmar autoasignación de orden</h2>
      <mat-dialog-content class="text-center! pb-6!">
        <p class="text-sm text-gray-700">
          Se asignará la OS <b>{{data}}</b> a la ruta actual<br>
          <!--<span class="font-bold text-base text-black">{{ data }}</span>?-->
        </p>
      </mat-dialog-content>
      <mat-dialog-actions class="flex justify-between items-center gap-0">
        <button class="text-gray-500 font-bold! tracking-wider border rounded-sm w-1/2 py-2" [mat-dialog-close]="false">Cancelar</button>
        <button mat-flat-button color="primary" class="px-4! font-bold! tracking-wider bg-blue-500 border rounded-sm text-white w-1/2 py-2" [mat-dialog-close]="true">Continuar</button>
      </mat-dialog-actions>
    </div>
  `
})
export class ConfirmAssignDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}
}
