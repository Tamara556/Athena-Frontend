import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StreaksApi } from './streaks.api';
import {
  buildAchievements,
  buildHeatmap,
  buildMonthly,
  buildWeekly,
  buildYearly,
  firstActiveDate,
  fromIso,
  summarize,
  toActivityMap,
} from './streaks.logic';

@Injectable({ providedIn: 'root' })
export class StreaksStore {
  private readonly api = inject(StreaksApi);
  private readonly activity = toSignal(this.api.getActivity(), { initialValue: null });

  readonly loading = computed(() => this.activity() === null);
  readonly hasData = computed(() => (this.activity()?.days.length ?? 0) > 0);

  readonly today = computed(() => {
    const reference = this.activity()?.referenceDate;
    return reference ? fromIso(reference) : new Date();
  });
  readonly activityByDate = computed(() => toActivityMap(this.activity()?.days ?? []));
  readonly firstActiveDate = computed(() => firstActiveDate(this.activity()?.days ?? []));

  readonly achievements = computed(() => buildAchievements(this.activity()?.days ?? []));
  readonly summary = computed(() => summarize(this.activity()?.days ?? [], this.today(), this.achievements().length));
  readonly heatmap = computed(() => buildHeatmap(this.activityByDate(), this.today()));
  readonly weekly = computed(() => buildWeekly(this.activityByDate(), this.today()));
  readonly monthly = computed(() => buildMonthly(this.activity()?.days ?? [], this.today()));
  readonly yearly = computed(() => buildYearly(this.activity()?.days ?? [], this.today()));
}
