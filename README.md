// file-search.component.ts
import { FileSearchService } from '../file-search.service';
import { MatPaginator } from '@angular/material/paginator';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, inject } from '@angular/core';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HistoryService } from '../history.service';
// Importa las clases y módulos necesarios
import { OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator'

@Component({
  selector: 'app-file-search',
  templateUrl: './file-search.component.html'
})
export class FileSearchComponent {

  constructor(private fileSearchService: FileSearchService, private historyService: HistoryService) { }

  searchData = {
    dir: '',
    filter: '',
    ext: ''
  };

  // Variables para paginación infinita
  currentPage: number = 1;
  pageSize: number = 10; // Ajusta según tus necesidades
  totalResults: number = 0;


  // Variables para paginación infinita NO IMPLEMENTADO
  /*   currentPage: number = 1;
    pageSize: number = 10; // Ajusta según tus necesidades
    scrollDistance = 10; // Puedes ajustar este valor según tus necesidades
   */

  //Variable para manejar la carga
  loading: boolean = false;
  noResults: boolean = false;

  //Guardar la busqueda actual en el historial
  searchResults: any[] = [];
  totalFiles: number = 0;
  totalOccurrences: number = 0;
  extensionCounts: any;
  highlightedRow: any;
  extensionChips: string[] = [];
  previousResults: any[] = [];
  searchingFinished: boolean = false;



  // Método para manejar el cambio de página
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    // Realiza la carga de resultados para la nueva página
    this.loadMore();
  }


  //Funcion para obtener extensiones unicas para Chips
  getUniqueExtensions(files: any[]): string[] {
    const extensionSet = new Set<string>();
    files.forEach(f => {
      const fileExt = f.file.split('.').pop().toLocaleLowerCase();
      if (fileExt) extensionSet.add(fileExt);
    });
    return Array.from(extensionSet);
  }

  searchFiles() {

    /*  this.currentPage = 1; // Reiniciar la página al realizar una nueva búsqueda
     this.searchResults = []; // Reiniciar los resultados al realizar una nueva búsqueda
     this.loadMore(); // Cargar los primeros resultados */

    this.currentPage = 1; // Reiniciar la página al realizar una nueva búsqueda
    this.searchResults = []; // Reiniciar los resultados al realizar una nueva búsqueda
    //this.loading = true;
    this.loadMore(); // Cargar los primeros resultados

    if (this.searchingFinished) {
      console.log("Busqueda recursiva finalizada, resultados iguales")
      return
    }

    this.noResults = false;
    this.loading = true;

    //Guardar la busqueda actual en el historial
    this.historyService.pushToHistory(this.searchData.filter)

    //Realiza la busqueda
    this.fileSearchService.searchFiles(this.searchData).subscribe({
      next: (result) => {
        console.log('Search result:', result);
        this.searchResults = result.result;
        this.totalFiles = result.totalFiles;
        this.totalOccurrences = result.totalOccurrences;
        this.highlightedRow = result.highlightedRow;


        // Restablecer la variable searchingFinished según sea necesario
        this.searchingFinished = this.searchResults.length === 0;

        // Incrementar la página actual para la próxima carga
        this.currentPage++;

        this.extensionChips = this.getUniqueExtensions(this.searchResults);
        console.log(this, this.extensionChips);

        //Marca como no cargando despues de recibir los resultados
        this.loading = false;
        this.noResults = this.searchResults.length === 0;

        // Verificar la condición de finalización
         if (this.previousResults.length > 0 && JSON.stringify(this.previousResults) === JSON.stringify(result)) {
          console.log("Búsqueda recursiva finalizada: resultados iguales");
          this.searchingFinished = true;
          this.previousResults = [];
          return;
        }

        this.previousResults = result.result;
      }
    });

  }

  /*   loadMore() {
      // Si la búsqueda ya ha finalizado, no cargar más
      if (this.searchingFinished) {
        return;
      }

      // Realiza la búsqueda paginada
      this.fileSearchService.searchFiles({
        ...this.searchData,
        page: this.currentPage,
        pageSize: this.pageSize,
      }).subscribe({
        next: (result) => {
          // @ts-ignore
          const newResults = result.result.filter((newResult) =>
            !this.searchResults.some(existingResult => existingResult.file === newResult.file)
          );

          // Agrega los nuevos resultados a la lista existente
          this.searchResults.push(...newResults);

          // Ajusta la variable searchingFinished según sea necesario
          this.searchingFinished = newResults.length === 0 || this.searchResults.length === 0;

          // Incrementa la página actual para la próxima carga
          this.currentPage++;
        },
        error: error => {
          console.error('Error:', error);
          // Handle errors
        }
      });
    }
   */

  // Método para cargar más resultados
  /*  loadMore(): void {
    if (!this.searchingFinished) { // Solo cargar más si la búsqueda no ha finalizado
      // Lógica para cargar más resultados según la página actual y el tamaño de la página
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const additionalResults = this.previousResults.slice(startIndex, endIndex);

      // Verificar si hay más resultados a cargar
      if (additionalResults.length > 0) {
        // Agregar los nuevos resultados a la lista existente
        this.searchResults.push(...additionalResults);

        // Incrementar la página actual para la próxima carga
        this.currentPage++;
      }
    }
  } */

  // Método para cargar más resultados
  loadMore(): void {
    // Si la búsqueda ya ha finalizado o no hay resultados, no cargar más
    if (this.searchingFinished || this.searchResults.length === 0) {
      return;
    }

    // Lógica para cargar más resultados según la página actual y el tamaño de la página
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const additionalResults = this.searchResults.slice(startIndex, endIndex);

    // Verificar si hay más resultados a cargar
    if (additionalResults.length > 0) {
      // Agregar los nuevos resultados a la lista existente
      this.searchResults.push(...additionalResults);

      // Incrementar la página actual para la próxima carga
      this.currentPage++;
    } else {
      // Si no hay más resultados, marcar la búsqueda como finalizada
      this.searchingFinished = true;
    }
  }


  searchRecursively(row: any, parentIndex: number | null = null, depth: number = 1) {
    // Extrae solo el nombre del archivo con la extensión
    const fileNameWithExt = row.file.split('\\').pop();
    // Usa el nombre del archivo como nuevo filtro
    this.searchData.filter = fileNameWithExt;

    this.fileSearchService.searchFiles(this.searchData).subscribe({
      next: (result) => {
        row.result = result.result;

        // Realiza búsquedas recursivas para cada resultado de la búsqueda actual
        if (result.result && result.result.length > 0) {
          row.children = result.result.map((nestedResult: any, index: number) => {
            nestedResult.index = index + 1;
            nestedResult.parent = row;
            nestedResult.depth = depth;
            return nestedResult;
          });

          // Recursivamente para cada resultado anidado hasta el cuarto nivel
          if (depth < 4) {
            row.children.forEach((childResult: any) => {
              this.searchRecursively(childResult, depth + 1);
            });
          }
        }

      }
    })



  }
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

<!--  file-search.component.ts -->

<div class="container-md">

  <div>
    <mat-form-field appearance="fill">
      <mat-label for="dir">Directory:</mat-label>
      <input matInput id="dir" [(ngModel)]="searchData.dir" />
    </mat-form-field>
  </div>

  <div>
    <mat-form-field appearance="fill">
      <mat-label for="filter">Filter:</mat-label>
      <input matInput id="filter" [(ngModel)]="searchData.filter" />
    </mat-form-field>
  </div>

  <div>
    <mat-form-field appearance="fill">
      <mat-label for="ext">Extension Opcional:</mat-label>
      <input matInput id="ext" [(ngModel)]="searchData.ext" />
    </mat-form-field>
  </div>
  <!-- <label for="ext">Extension:</label>
  <input id="ext" [(ngModel)]="searchData.ext" /> -->

  <button mat-fab extended color="primary" (click)="searchFiles()">Buscar archivos</button>

  <mat-progress-spinner *ngIf="loading" mode="indeterminate"></mat-progress-spinner>

  <div class="mt-5" *ngIf="noResults">
    <strong>No hay coincidencia, intenta en otra carpeta</strong>
  </div>

  <div>
    <h3>Historial de búsqueda</h3>
    <ul>
      <li *ngFor="let search of getFullHistory()">
        {{search}}
      </li>
    </ul>
  </div>

  <div *ngIf="searchResults.length > 0" class="result-container">
    <h3 class="mt-5">Resultados</h3>
    <p>Archivos totales: {{totalFiles}}, Ocurrencias totales: {{totalOccurrences}}</p>

    <mat-form-field class="example-chip-list">
      <mat-label>Extensiones existentes</mat-label>
      <mat-chip-grid #chipGrid aria-label="Enter exts">

        <mat-chip-row *ngFor="let ext of extensionChips; let i = index" (removed)="remove(ext)" [editable]="true"
          (edited)="edit(ext, $event)" [aria-description]="'press enter to edit ' + ext">
          {{ext}}
          <button matChipRemove [attr.aria-label]="'remove ' + ext">
            <mat-icon>cancel</mat-icon>
          </button>
        </mat-chip-row>

        <input placeholder="New fruit..." [matChipInputFor]="chipGrid"
          [matChipInputSeparatorKeyCodes]="separatorKeysCodes" [matChipInputAddOnBlur]="addOnBlur"
          (matChipInputTokenEnd)="add($event)" />
      </mat-chip-grid>
    </mat-form-field>


    <!-- Lista de Resultados -->

    <ul>
      <mat-list-item *ngFor="let result of searchResults;  let i = index" class="list-group-item">

        {{i + 1}}. <a [href]="getFileUrl(result.file)" target="_blank">{{ result.file }}</a>, LINEA {{result.line}},
        COLUMNA: {{result.column}}
        <div [innerHTML]="result.highlightedRow"></div>
        <p>(Ocurrencias en el archivo: {{result.occurrencesInFile}}) <br></p>

        <button mat-raised-button color="primary" (click)="searchRecursively(result)">Buscar Recursivamente</button>

        <!-- Mostrar resultados anidados si existen -->
        <ul *ngIf="result.children && result.children.length > 0">
          <li *ngFor="let childResult of result.children">

            {{childResult.index}}. <a [href]="getFileUrl(childResult.file)" target="_blank">{{ childResult.file }}</a>,
            LINEA {{childResult.line}}, COLUMNA: {{childResult.column}}
            <div [innerHTML]="childResult.highlightedRow"></div>
            <p>(Ocurrencias en el archivo: {{childResult.occurrencesInFile}}) <br></p>

            <!-- Mostrar subresultados anidados si existen -->
            <ul *ngIf="childResult.children && childResult.children.length > 0">
              <li *ngFor="let subResult of childResult.children">

                {{subResult.index}}. <a [href]="getFileUrl(subResult.file)" target="_blank">{{ subResult.file }}</a>,
                LINEA {{subResult.line}}, COLUMNA: {{subResult.column}}
                <div [innerHTML]="subResult.highlightedRow"></div>
                <p>(Ocurrencias en el archivo: {{subResult.occurrencesInFile}}) <br></p>

                <!-- Mostrar subresultados adicionales si existen -->
                <ul *ngIf="subResult.children && subResult.children.length > 0">
                  <li *ngFor="let additionalResult of subResult.children">
                    {{additionalResult.index}}. <a [href]="getFileUrl(additionalResult.file)" target="_blank">{{
                      additionalResult.file }}</a>,
                    LINEA {{additionalResult.line}}, COLUMNA: {{additionalResult.column}}

                    <div [innerHTML]="additionalResult.highlightedRow"></div>
                    <p>(Ocurrencias en el archivo: {{additionalResult.occurrencesInFile}}) <br></p>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>

      </mat-list-item>
    </ul>

    <!-- Paginador -->
    <!-- <mat-paginator [length]="totalFiles" [pageSize]="pageSize" [pageSizeOptions]="[10, 25, 50, 100]"(page)="onPageChange($event)">

    </mat-paginator> -->
    <mat-paginator [pageSize]="pageSize" [pageIndex]="currentPage - 1" [length]="totalResults"
      (page)="onPageChange($event)"></mat-paginator>

  </div>
</div>
