import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, computed, inject, viewChild } from '@angular/core';
import { ThemeService } from '../../core/theme';

interface Spark {
  x: number;
  y: number;
  angle: number;
  start: number;
}

const SPARK_COUNT = 8;
const DURATION = 420;
const RADIUS = 18;
const SIZE = 11;
const LINE_WIDTH = 2;

@Component({
  selector: 'app-click-spark',
  standalone: true,
  template: `<canvas #canvas class="click-spark" aria-hidden="true"></canvas>`,
  styles: [`.click-spark{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999}`],
})
export class ClickSparkComponent implements AfterViewInit, OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly themeService = inject(ThemeService);
  private readonly color = computed(() => (this.themeService.theme() === 'light' ? '#15151F' : '#FFFFFF'));

  private ctx: CanvasRenderingContext2D | null = null;
  private sparks: Spark[] = [];
  private raf = 0;

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef().nativeElement.getContext('2d');
    this.resize();
    this.raf = requestAnimationFrame(this.draw);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
  }

  @HostListener('window:resize')
  resize(): void {
    const canvas = this.canvasRef().nativeElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const now = performance.now();
    for (let i = 0; i < SPARK_COUNT; i++) {
      this.sparks.push({ x: event.clientX, y: event.clientY, angle: (2 * Math.PI * i) / SPARK_COUNT, start: now });
    }
  }

  private readonly draw = (timestamp: number): void => {
    const ctx = this.ctx;
    if (!ctx) {
      this.raf = requestAnimationFrame(this.draw);
      return;
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = this.color();
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';

    this.sparks = this.sparks.filter((spark) => {
      const progress = Math.min(Math.max((timestamp - spark.start) / DURATION, 0), 1);
      if (progress >= 1) {
        return false;
      }
      const eased = progress * (2 - progress);
      const distance = eased * RADIUS;
      const lineLength = SIZE * (1 - eased);
      const cos = Math.cos(spark.angle);
      const sin = Math.sin(spark.angle);
      ctx.globalAlpha = 1 - eased;
      ctx.beginPath();
      ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin);
      ctx.lineTo(spark.x + (distance + lineLength) * cos, spark.y + (distance + lineLength) * sin);
      ctx.stroke();
      return true;
    });

    ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(this.draw);
  };
}
