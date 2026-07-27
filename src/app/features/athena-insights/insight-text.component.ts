import { Component, input } from '@angular/core';
import { InsightSegment } from './insights.models';

@Component({
  selector: 'app-insight-text',
  standalone: true,
  template: `@for (s of segments(); track $index) {@switch (s.kind) {@case ('highlight') {<span class="hl">{{ s.text }}</span>}@case ('soft') {<span class="soft">{{ s.text }}</span>}@case ('bold') {<b>{{ s.text }}</b>}@default {{{ s.text }}}}}`,
})
export class InsightTextComponent {
  readonly segments = input.required<InsightSegment[]>();
}
