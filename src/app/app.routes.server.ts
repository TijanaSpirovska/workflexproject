import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'trip/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // Example: Return a promise resolving to an array of IDs to prerender
      return Promise.resolve([{ id: '1' }, { id: '2' }, { id: '3' }]);
    },
  },
];
