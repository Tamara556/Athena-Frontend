import { Component, input } from '@angular/core';

/**
 * The Athena "thinking" loader — the same animated mark shown while a new account's
 * roadmap is being generated. Reused wherever the local model is working and the
 * user needs to wait (e.g. generating a learning session's materials).
 */
@Component({
  selector: 'app-athena-loader',
  standalone: true,
  template: `
    <div class="ath-loader" role="status" aria-live="polite" aria-label="Loading Athena">
      <div class="ath-stage">
        <div class="ath-glow" aria-hidden="true"></div>
        <div class="ath-ring ath-track" aria-hidden="true"></div>
        <div class="ath-ring ath-comet" aria-hidden="true"></div>
        <svg class="ath-mark" viewBox="0 0 120 120" aria-hidden="true">
          <mask id="athStarCutL"><rect x="0" y="0" width="120" height="120" fill="#fff"/><path d="M60 38 Q63.5 56.5 82 60 Q63.5 63.5 60 82 Q56.5 63.5 38 60 Q56.5 56.5 60 38 Z" fill="#000"/></mask>
          <clipPath id="athFlowerClipL"><circle cx="60" cy="26" r="20"/><circle cx="89.4" cy="43" r="20"/><circle cx="89.4" cy="77" r="20"/><circle cx="60" cy="94" r="20"/><circle cx="30.6" cy="77" r="20"/><circle cx="30.6" cy="43" r="20"/><circle cx="60" cy="60" r="33"/></clipPath>
          <g clip-path="url(#athFlowerClipL)" mask="url(#athStarCutL)">
            <rect x="0" y="0" width="120" height="120" fill="#A855F7"/>
            <g class="ath-aurora" filter="url(#athBlobBlurL)">
              <circle cx="60" cy="16" r="30" fill="#8B5CF6"/><circle cx="98" cy="36" r="30" fill="#F472B6"/>
              <circle cx="100" cy="80" r="30" fill="#FB923C"/><circle cx="62" cy="102" r="30" fill="#A3E635"/>
              <circle cx="22" cy="82" r="30" fill="#2DD4BF"/><circle cx="18" cy="38" r="30" fill="#60A5FA"/>
              <circle cx="44" cy="14" r="22" fill="#7C3AED"/>
            </g>
          </g>
          <filter id="athBlobBlurL"><feGaussianBlur stdDeviation="11"/></filter>
        </svg>
      </div>
      <div class="ath-copy">
        <p class="ath-title">{{ title() }}</p>
        <p class="ath-sub">{{ sub() }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host{display:flex;justify-content:center;padding:48px 0}
    .ath-loader{display:flex;flex-direction:column;align-items:center;gap:30px}
    .ath-stage{position:relative;width:112px;height:112px;display:grid;place-items:center}
    .ath-glow{
      position:absolute;inset:-26%;border-radius:50%;
      background:radial-gradient(circle, rgba(139,92,246,.34), rgba(34,211,238,.12) 45%, transparent 70%);
      filter:blur(14px);animation:athGlow 2.8s ease-in-out infinite;
    }
    .ath-ring{position:absolute;inset:-19px;border-radius:50%}
    .ath-ring.ath-track{
      background:conic-gradient(rgba(139,92,246,.14) 0 100%);
      -webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 3px));
              mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 3px));
    }
    .ath-ring.ath-comet{
      background:conic-gradient(from 90deg,transparent 0 52%,var(--aqua) 70%,var(--violet) 84%,var(--pink) 95%,transparent 100%);
      -webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 3px));
              mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 3px));
      animation:athSpin 1.35s linear infinite;
    }
    .ath-mark{
      width:104px;height:104px;display:block;position:relative;
      filter:drop-shadow(0 14px 30px rgba(139,92,246,.30));
      animation:athBreathe 2.8s ease-in-out infinite;will-change:transform;
    }
    .ath-mark .ath-aurora{transform-box:view-box;transform-origin:60px 60px;animation:athSwirl 6s linear infinite;will-change:transform}
    @keyframes athSpin{to{transform:rotate(360deg)}}
    @keyframes athSwirl{to{transform:rotate(360deg)}}
    @keyframes athBreathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.05)}}
    @keyframes athGlow{0%,100%{opacity:.55;transform:scale(.95)}50%{opacity:1;transform:scale(1.06)}}
    @keyframes athTextPulse{0%,100%{opacity:.72}50%{opacity:1}}
    .ath-copy{display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center}
    .ath-title{font-family:var(--display);font-weight:600;font-size:clamp(16px,2.4vw,19px);letter-spacing:-.015em;color:var(--ink);animation:athTextPulse 2.8s ease-in-out infinite;margin:0}
    .ath-sub{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint);margin:0}
    @media (prefers-reduced-motion:reduce){
      .ath-ring.ath-comet,.ath-mark .ath-aurora,.ath-title{animation:none}
      .ath-mark{animation:athBreathe 2.4s ease-in-out infinite}
    }
  `],
})
export class AthenaLoaderComponent {
  readonly title = input('Please wait a moment');
  readonly sub = input('Athena is working…');
}
