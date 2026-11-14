import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { UiStateService } from './core/services/ui-state.service';

@Component({
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly ui = inject(UiStateService);
  readonly auth = inject(AuthService);
  searchTerm = '';

  onSearch(value: string): void {
    this.searchTerm = value;
    this.ui.setSearch(value);
  }

  salir(): void {
    this.auth.logout();
  }
}
