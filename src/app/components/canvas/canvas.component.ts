import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [MatCardModule, NgIf],
  templateUrl: './canvas.component.html',
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
  /*@Input() techResult?: {text: string, result: boolean} = {text: '', result: false}*/
  @Input() clientResult?: string = '';
  /*@ViewChild('techSignatureCanvas', {static: false}) techCanvasRef!: ElementRef<HTMLCanvasElement>;*/
  @ViewChild('clientSignatureCanvas', {static: false}) clientCanvasRef!: ElementRef<HTMLCanvasElement>;

  /*private techContext!: CanvasRenderingContext2D;*/
  private clientContext!: CanvasRenderingContext2D;

  private isDrawing: boolean = false;
  private activeContext: CanvasRenderingContext2D | null = null;
  private eventListeners: {canvas: HTMLCanvasElement, type: keyof HTMLElementEventMap, listener: EventListenerOrEventListenerObject }[] = [];

  public clientHasContent: boolean = false;
  /*public techHasContent: boolean = false;*/

/*  public getTechSignAsBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (this.techCanvasRef && this.techCanvasRef.nativeElement) {
        this.techCanvasRef.nativeElement.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      } else {
        resolve(null);
      }
    });
  }*/

  public getClientSignAsBlob(): Promise<Blob | null>{
    return new Promise((resolve) => {
      if (this.clientCanvasRef && this.clientCanvasRef.nativeElement) {
        this.clientCanvasRef.nativeElement.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      } else {
        resolve(null);
      }
    });
  };

/*  public clearTechCanvas(): void {
    if (this.techContext && this.techCanvasRef?.nativeElement) {
      this.techContext.clearRect(0,0,this.techCanvasRef.nativeElement.width, this.techCanvasRef.nativeElement.height);
      this.techHasContent = false;
    }
  }*/

  public clearClientCanvas(): void {
    if (this.clientContext && this.clientCanvasRef?.nativeElement) {
      this.clientContext.clearRect(0,0,this.clientCanvasRef.nativeElement.width, this.clientCanvasRef.nativeElement.height);
      this.clientHasContent = false;
    }
  }

  ngAfterViewInit() {
    /*if (!this.techCanvasRef || !this.techCanvasRef.nativeElement || !this.clientCanvasRef || !this.clientCanvasRef.nativeElement) {*/
    if (!this.clientCanvasRef || !this.clientCanvasRef.nativeElement) {
      console.log("Uno o ambos elementos canvas no se encuentran disponibles en el DOM.");
      return;
    }

    /*const techCtx = this.techCanvasRef.nativeElement.getContext('2d');*/
    const clientCtx = this.clientCanvasRef.nativeElement.getContext('2d');

/*    if (!techCtx) {
      console.log("No se pudo obtener el contexto 2D del canvas.");
      return;
    }*/
    if (!clientCtx) {
      console.log("No se pudo obtener el contexto 2D del canvas.");
      return;
    }

    /*this.techContext = techCtx;*/
    this.clientContext = clientCtx;
    /*this.setupCanvas(this.techCanvasRef.nativeElement, this.techContext, 1);*/
    this.setupCanvas(this.clientCanvasRef.nativeElement, this.clientContext, 1);
  }

  private setupCanvas (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, lineWidth: number) {
    context.lineCap = 'round';
    context.lineWidth = lineWidth;
    context.strokeStyle = 'black';

    const startDrawingListener = (event: PointerEvent) => this.startDrawing(event, context);
    const drawListener = (event: PointerEvent) => this.draw(event, context);
    const stopDrawingListener = (event: PointerEvent) => this.stopDrawing(event);

    this.addManagedEventListener(canvas, 'pointerdown', startDrawingListener as EventListener);
    this.addManagedEventListener(canvas, 'pointermove', drawListener as EventListener);
    this.addManagedEventListener(canvas, 'pointerup', stopDrawingListener as EventListener);
    this.addManagedEventListener(canvas, 'pointerout', stopDrawingListener as EventListener);
  }

  private addManagedEventListener(canvas: HTMLCanvasElement, type: keyof HTMLElementEventMap, listener: EventListener) {
    canvas.addEventListener(type, listener);
    this.eventListeners.push({ canvas, type, listener });
  }

  private startDrawing (event: PointerEvent, context: CanvasRenderingContext2D) {
    if (event.isPrimary) {
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }
    /*if (event.target !== context.canvas) return;*/

    this.isDrawing = true;
    this.activeContext = context;

    this.activeContext.beginPath();
    this.activeContext.moveTo(event.offsetX, event.offsetY);
  }

  private draw (event: PointerEvent, context: CanvasRenderingContext2D) {
    if (!this.isDrawing || this.activeContext !== context || event.target !== context.canvas) return;

    this.activeContext.lineTo(event.offsetX, event.offsetY);
    this.activeContext.stroke();
  }

  private stopDrawing (event?: PointerEvent) {
    if (this.isDrawing && this.activeContext) {
      this.activeContext.stroke();
      this.activeContext.closePath();
      if (this.activeContext.canvas === this.clientCanvasRef?.nativeElement) {
        this.clientHasContent = true;
      }
/*      else if (this.activeContext.canvas === this.techCanvasRef?.nativeElement) {
        this.techHasContent = true;
      }*/
    }
    if (event && event.isPrimary && (event.target as HTMLElement).hasPointerCapture(event.pointerId)) {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }
    this.isDrawing = false;
    this.activeContext = null;
  }

  ngOnDestroy() {
    try {
      this.eventListeners.forEach(entry => {
        if (entry?.canvas) {
          entry.canvas.removeEventListener(entry.type, entry.listener);
        }
      })
    } catch (error) {
      console.log("Error cleaning up event listeners: ", error);
    } finally {
      this.eventListeners = [];
    }
  }
}
