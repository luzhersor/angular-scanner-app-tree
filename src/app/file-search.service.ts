// file-search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, concatMap, forkJoin, from, last, map, mergeMap, of, scan, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileSearchService {
  private apiUrl = 'http://localhost:3000/checkStringInFiles';

  constructor(private http: HttpClient) { }

 /*  searchFiles(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  } */

  searchFiles(data: any, treePath: string[] = []): Observable<any> {
    return this.http.post(this.apiUrl, data).pipe(
      map((result: any) => {
        // Agrega el árbol al resultado
        const resultsWithTree = result.result.map((item: any) => ({
          ...item,
          tree: [...treePath, item.file]
        }));

        return {
          ...result,
          result: resultsWithTree
        };
      }),
      catchError((error: any) => {
        console.error('Error en la solicitud:', error);
        return throwError('Error en la solicitud. Por favor, inténtalo de nuevo.');
      })
    );
  }

  // ... (otro código)
}
