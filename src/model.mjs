/**
 * GhostFlow architecture model.
 * A teaching simulator derived from documented Ghost boundaries. It does NOT
 * connect to Ghost or estimate Ghost's real-world latency or throughput.
 */
export const NODES = Object.freeze({
  reader: {title: 'Public browser', zone: 'Untrusted', description: 'A visitor requests a public URL. No server-side permissions are inferred from client state.'},
  admin: {title: 'Admin browser', zone: 'Untrusted', description: 'The separately built Ghost Admin UI uses the Admin API. Current codebase combines React Admin with legacy Ember routes.'},
  headless: {title: 'Headless client', zone: 'Untrusted', description: 'A remote website or mobile app consumes Ghost\'s public Content API.'},
  portal: {title: 'Member browser', zone: 'Untrusted', description: 'The public member UI uses Ghost\'s supported member-facing interfaces.'},
  ingress: {title: 'NGINX / ingress', zone: 'Public edge', description: 'A conventional self-hosted Ghost deployment uses NGINX as a reverse proxy; other deployment topologies are possible.'},
  edgecache: {title: 'Optional CDN cache', zone: 'Public edge', description: 'Conceptual cache-hit optimization for cacheable public responses. Cache placement varies by deployment.'},
  theme: {title: 'Frontend / theme', zone: 'Ghost Core process', description: 'Ghost serves public routes and renders Handlebars templates on the server; it does not need to call Content API via external HTTP.'},
  adminapi: {title: 'Admin API', zone: 'Ghost Core process', description: 'Admin API endpoints validate requests, authenticate callers, check permissions, and perform writes through server services.'},
  contentapi: {title: 'Content API', zone: 'Ghost Core process', description: 'Content API routes expose content over HTTP for headless clients.'},
  members: {title: 'Member routes', zone: 'Ghost Core process', description: 'Member-facing routes are mounted in Ghost Core\'s frontend app.'},
  services: {title: 'Domain services', zone: 'Ghost Core process', description: 'In-process business logic shared by API and frontend interfaces; separate code modules do not imply microservices.'},
  database: {title: 'MySQL', zone: 'Persistence', description: 'The documented conventional production stack uses MySQL 8, accessed by Ghost Core.'},
  storage: {title: 'Media storage', zone: 'Persistence', description: 'Local files or a configured storage adapter hold images and other media. It is not a separate mandatory microservice.'},
  effects: {title: 'Email / webhooks', zone: 'External integrations', description: 'Optional effects and integrations may be triggered by domain behavior. They are not necessarily independent microservices.'}
});

export const SCENARIOS = Object.freeze({
  public: {label: 'Public page', method: 'GET', example: '/welcome/', summary: 'Theme-rendered public content: not an HTTP round-trip to Content API.', path: ['reader','ingress','theme','services','database']},
  publish: {label: 'Publish a post', method: 'POST', example: '/ghost/api/admin/posts/', summary: 'An authenticated staff action goes through Admin API and server-side policy checks.', path: ['admin','ingress','adminapi','services','database','effects']},
  headless: {label: 'Headless content', method: 'GET', example: '/ghost/api/content/posts/', summary: 'A headless client calls the Content API over HTTP.', path: ['headless','ingress','contentapi','services','database']},
  members: {label: 'Member signup', method: 'POST', example: '/members/api/send-magic-link/', summary: 'An illustrative member journey; exact route may vary by Ghost version and deployment.', path: ['portal','ingress','members','services','database','effects']}
});

const BASE_MS = Object.freeze({reader:3,admin:4,headless:3,portal:4,ingress:6,edgecache:5,theme:15,adminapi:12,contentapi:9,members:13,services:11,database:19,storage:13,effects:8});

export function validateRequestPath(raw) {
  if (typeof raw !== 'string') return {ok:false, error:'Enter a request path.'};
  const value = raw.trim();
  if (!value) return {ok:false, error:'Request path cannot be empty.'};
  if (value.length > 180) return {ok:false, error:'Request path must be 180 characters or fewer.'};
  if (!value.startsWith('/')) return {ok:false, error:'Request path must start with /.'};
  if (/[\s<>"'`\\]/.test(value)) return {ok:false, error:'Request path contains unsupported characters.'};
  if (!/^\/[A-Za-z0-9_./?=&%~:+#-]*$/.test(value)) return {ok:false, error:'Request path contains unsupported characters.'};
  return {ok:true, value};
}

export function getScenario(key) { return Object.hasOwn(SCENARIOS, key) ? SCENARIOS[key] : null; }

export function simulateRequest({scenario, requestPath, cacheHit = false} = {}) {
  const entry = getScenario(scenario);
  if (!entry) return {ok:false, error:'Select a supported scenario.'};
  const validation = validateRequestPath(requestPath);
  if (!validation.ok) return validation;
  const cacheAllowed = scenario === 'public' || scenario === 'headless';
  const effectiveCacheHit = cacheAllowed && cacheHit === true;
  const path = effectiveCacheHit ? [entry.path[0], 'ingress', 'edgecache'] : [...entry.path];
  const steps = path.map((key, index) => ({
    id: key, title: NODES[key].title, zone: NODES[key].zone,
    durationMs: BASE_MS[key] + (index % 3) * 2
  }));
  const totalMs = steps.reduce((sum, step) => sum + step.durationMs, 0);
  return {
    ok:true, scenario, requestPath:validation.value, method:entry.method,
    summary:entry.summary, cacheHit:effectiveCacheHit, path, steps, totalMs,
    kind:'Synthetic model - not real Ghost telemetry',
    status:scenario === 'publish' ? '200 (illustrative)' : '200 (illustrative)'
  };
}

export const AUDIT = Object.freeze([
  {id:'a', initial:'Ghost Admin is only an Ember.js single-page application.', corrected:'Current Ghost contains a React Admin application and legacy Ember Admin routes during the migration.', source:'https://github.com/TryGhost/Ghost/blob/main/docs/codebase/monorepo-structure.md', verdict:'Outdated assumption'},
  {id:'b', initial:'Ghost is a microservices application: every API and theme is independently deployed.', corrected:'Ghost Core is one Node.js process with frontend, API, and services as internal boundaries. Some optional Ghost 6 features have distinct services.', source:'https://github.com/TryGhost/Ghost/blob/main/docs/codebase/runtime-architecture.md', verdict:'Incorrect architecture'},
  {id:'c', initial:'A public Handlebars page must fetch its content using an HTTP Content API call.', corrected:'Ghost frontend/theme code uses in-process server capabilities; external Content API HTTP calls are not a required render step.', source:'https://github.com/TryGhost/Ghost/blob/main/docs/codebase/runtime-architecture.md', verdict:'Incorrect boundary'},
  {id:'d', initial:'All Ghost deployments require Redis, Kubernetes, and sharded databases.', corrected:'The conventional supported self-hosted production stack is Node.js, MySQL and NGINX. Ghost documents CDN and caching as a scaling path; sharding is not supported.', source:'https://docs.ghost.org/hosting/', verdict:'Invented infrastructure'}
]);

export const SOURCES = Object.freeze([
  {label:'Ghost runtime architecture (official source)',url:'https://github.com/TryGhost/Ghost/blob/main/docs/codebase/runtime-architecture.md'},
  {label:'Ghost monorepo structure (official source)',url:'https://github.com/TryGhost/Ghost/blob/main/docs/codebase/monorepo-structure.md'},
  {label:'Ghost hosting and scaling (official docs)',url:'https://docs.ghost.org/hosting/'},
  {label:'Ghost React Admin README (official source)',url:'https://github.com/TryGhost/Ghost/blob/main/apps/admin/README.md'}
]);
