import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClickSparkComponent } from './shared/click-spark/click-spark.component';
import { TourOverlayComponent } from './shared/tour/tour-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ClickSparkComponent, TourOverlayComponent],
  template: `<router-outlet /><app-click-spark></app-click-spark><app-tour-overlay />`,
})
export class App {}
