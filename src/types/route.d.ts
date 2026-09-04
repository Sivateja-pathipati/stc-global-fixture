export type RouteId =
  | 'home'
  | 'about'
  | 'services'
  | 'pricing'
  | 'events'
  | 'contact'
  | 'blog'
  | 'blog.article'
  | 'login'
  | 'account'
  | 'notFound'
  | 'serverError';

export type RouteParams = Readonly<Record<string, string>>;

/** One concrete page: a route id plus the params needed to build its path. */
export interface RouteInstance {
  readonly routeId: RouteId;
  readonly params?: RouteParams;
  /** Locale-less path, e.g. '/blog/scaling-globally'. */
  readonly path: string;
}
