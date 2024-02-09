// file-search.component.ts
import { FileSearchService } from '../file-search.service';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, inject} from '@angular/core';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { HistoryService } from '../history.service';

@Component({
  selector: 'app-file-search',
  templateUrl: './file-search.component.html'
})
export class FileSearchComponent {

  constructor(private fileSearchService: FileSearchService, private historyService: HistoryService) {}

  searchData = {
    dir: '',
    filter: '',
    ext: ''
  };

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
  //searchForm: any; era para el required, pero resetea angular material

  //Funcion para obtener extensiones unicas para Chips
  getUniqueExtensions (files: any[]): string[] {
    const extensionSet = new Set<string>();
    files.forEach(f => {
      const fileExt = f.file.split('.').pop().toLocaleLowerCase();
      if (fileExt) extensionSet.add(fileExt);
    });
    return Array.from(extensionSet);
  }

  searchFiles() {

      if(this.searchingFinished){
        console.log("Busqueda recursiva finalizada, resultados iguales")
        return
      }

      this.noResults = false;
      this.loading = true;

      //Guardar la busqueda actual en el historial
      this.historyService.pushToHistory(this.searchData.filter)

      //Realiza la busqueda
      /* this.fileSearchService.searchFiles(this.searchData).subscribe({
        next: (result) => {
          console.log('Search result:', result); */
        this.fileSearchService.searchFiles(this.searchData, []).subscribe({
            next: (result) => {
              console.log('Search result:', result);
              this.searchResults = result.result;
              // ... (otro código)

          this.totalFiles = result.totalFiles;
          this.totalOccurrences = result.totalOccurrences;
          this.highlightedRow = result.highlightedRow;

          this.extensionChips = this.getUniqueExtensions(this.searchResults);
          console.log(this,this.extensionChips);

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

        },

        error: error => {
          console.error('Error:', error);
          // Handle errors
        }
      });

  }


  searchRecursively(row: any) {
    // Extrae solo el nombre del archivo con la extensión
    const fileNameWithExt = row.file.split('\\').pop();
    // Usa el nombre del archivo como nuevo filtro
    this.searchData.filter = fileNameWithExt;
    // Realiza la búsqueda con el nuevo filtro
    this.searchFiles();

  }


  getFullHistory(): string[]{
    return this.historyService.getHistory();
  }

  getFileUrl(filePath: string): string{
    return `http://localhost:3000/static/${filePath}`;
  }

  // Función para resaltar el filtro en la fila
  highlightFilter(row: string, filter: string): string {
    return row.replace(new RegExp(filter, 'gi'), match => `<span class="highlight">${match}</span>`);
  }


  //Funciones para chips
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.extensionChips.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(ext: string): void {
    const index = this.extensionChips.indexOf(ext);

    if (index >= 0) {
      this.extensionChips.splice(index, 1);

      this.announcer.announce(`Removed ${ext}`);
    }
  }

  edit(ext: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(ext);
      return;
    }

    // Edit existing fruit
    const index = this.extensionChips.indexOf(ext);
    if (index >= 0) {
      this.extensionChips[index] = value;
    }
  }

}

