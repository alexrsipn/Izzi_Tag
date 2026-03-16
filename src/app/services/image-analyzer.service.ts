import {Injectable} from '@angular/core';
import {Image, ImageKind} from 'image-js';
import Graph from 'graphology';
import {AppConfig, ComplexityLevel} from "./app-config.service";

@Injectable({
  providedIn: 'root'
})
export class ImageAnalyzerService {
  private currentComplexitySettings: ComplexityLevel | undefined;
  private complexityCatalog: ComplexityLevel[] = [];

  constructor(private appConfig: AppConfig) {
    this.complexityCatalog = this.appConfig.getComplexityCatalog();
    if (!this.complexityCatalog || this.complexityCatalog.length === 0) {
      console.warn('ImageAnalizerService: No complexity catalog found.')
    }
  }

  setComplexityGrade(grade: number): void {
    if (!this.complexityCatalog || this.complexityCatalog.length === 0) {
      console.error('El catálogo de complejidad no está cargado. No se puede establecer el grado de complejidad.');
      this.currentComplexitySettings = {grade: 0, neighbor: 1, intersectionCount: 0};
      return;
    }
    this.currentComplexitySettings = this.complexityCatalog.find(level => level.grade === grade);
    if (!this.currentComplexitySettings) {
      console.warn(`Grado de complejidad ${grade} no encontrado en el catálogo. Usando valores por defecto`);
      this.currentComplexitySettings = this.complexityCatalog.find(level => level.grade === 0) || {
        grade: grade,
        neighbor: 1,
        intersectionCount: 0
      };
      /*console.warn('Usando fallback para el nivel de complejidad: ', this.currentComplexitySettings);*/
    }
/*    else {
      console.log('Nivel de complejidad establecido: ', this.currentComplexitySettings);
    }*/
  }

  async getBinaryImage(blob: Blob): Promise<Image> {
    const objectURL = URL.createObjectURL(blob);
    try {
      const img = await Image.load(objectURL);
      const greyAlphaImage = img.grey({keepAlpha: true}).resize({ width: 600 }); // Optimization size
      const binaryImage = new Image(greyAlphaImage.width, greyAlphaImage.height, { kind: 'GREY' as ImageKind });
      const isAlphaPresent = greyAlphaImage.alpha;
      for (let y = 0; y < greyAlphaImage.height; y++) {
        for (let x = 0; x < greyAlphaImage.width; x++) {
          const pixelData = greyAlphaImage.getPixelXY(x, y);
          const greyValue = pixelData[0];
          let treatAsTransparent = false;
          if (isAlphaPresent) {
            const alphaValue = pixelData[1];
            if (alphaValue < 128) {
              treatAsTransparent = true;
            }
          }
          if (treatAsTransparent) {
            binaryImage.setPixelXY(x, y, [255]);
          } else {
            binaryImage.setPixelXY(x, y, greyValue < 128 ? [0] : [255]);
          }
        }
      }
      return binaryImage;
    } finally {
      URL.revokeObjectURL(objectURL);
    }
  }

  extractPixels(binaryImage: Image): number[][] {
    const pixels: number[][] = [];
    for (let y = 0; y < binaryImage.height; y++) {
      for (let x = 0; x < binaryImage.width; x++) {
        const pixelValue = binaryImage.getPixelXY(x, y)[0];
        if (pixelValue === 0) {
          pixels.push([x, y]); // Only black pixels in the array
        }
      }
    }
    return pixels;
  }

  buildGraph(pixels: number[][]): Graph {
    const graph = new Graph();
    pixels.forEach(([x, y]) => { // From the black pixels, add nodes
      const id = `${x},${y}`;
      graph.addNode(id, { x, y });
    });

    pixels.forEach(([x, y]) => { // Check if the current pixel has black pixels around
      const id = `${x},${y}`;
      const neighbors = [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
        [x - 1, y - 1], [x + 1, y + 1], [x - 1, y + 1], [x + 1, y - 1]
      ];
      neighbors.forEach(([nx, ny]) => {
        const neighborId = `${nx},${ny}`;
        if (graph.hasNode(neighborId) && !graph.hasEdge(id, neighborId)) {
          graph.addEdge(id, neighborId);
        }
      });
    });
    return graph;
  }

  analyzeGraph(graph: Graph): {text: string, result: boolean, quality: number} {
    let intersectionCount = 0;
    graph.forEachNode((node) => {
      const neighbors = graph.degree(node);
      if (neighbors > this.currentComplexitySettings!.neighbor) {
        intersectionCount++;
      }
    });
    /*console.log(intersectionCount);*/
    return intersectionCount >= this.currentComplexitySettings!.intersectionCount ? {text: 'Válido', result: true, quality: intersectionCount} : {text: 'No válido', result: false, quality: intersectionCount};
  }
}
