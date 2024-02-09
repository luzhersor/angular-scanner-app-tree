//history.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private searchHistory: string[] = [];

  pushToHistory(search: string){
    this.searchHistory.push(search);
  }

  popFromHistory(): string | undefined{
    return this.searchHistory.pop();
  }

  getHistory(): string[]{
    return [...this.searchHistory]
  }
}
