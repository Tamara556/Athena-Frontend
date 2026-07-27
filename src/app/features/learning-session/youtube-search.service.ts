import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface YoutubeSearchResponse {
  items?: { id?: { videoId?: string } }[];
}

/**
 * Resolves a real, embeddable YouTube video id for a search phrase via the
 * YouTube Data API v3. This is the reliable way to embed lesson videos in-site:
 * the AI's guessed ids are often fake, and YouTube no longer allows keyless
 * search-embeds. Requires `environment.youtubeApiKey` to be set.
 */
@Injectable({ providedIn: 'root' })
export class YoutubeSearchService {
  private readonly http = inject(HttpClient);
  private readonly apiKey = environment.youtubeApiKey;

  get enabled(): boolean {
    return !!this.apiKey;
  }

  /** Returns the top embeddable video id for the query, or null if none/unavailable. */
  searchVideoId(query: string): Observable<string | null> {
    const params = new HttpParams()
      .set('part', 'snippet')
      .set('type', 'video')
      .set('videoEmbeddable', 'true')
      .set('maxResults', '1')
      .set('q', query)
      .set('key', this.apiKey);
    return this.http
      .get<YoutubeSearchResponse>('https://www.googleapis.com/youtube/v3/search', { params })
      .pipe(map((res) => res.items?.[0]?.id?.videoId ?? null));
  }
}
