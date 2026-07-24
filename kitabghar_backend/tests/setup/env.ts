// Runs via jest.config.js `setupFiles`, i.e. BEFORE any test file's own
// `import`s are evaluated. Several modules in src/ read process.env at
// module-load time (e.g. `user.service.ts` reads JWT_SECRET into a
// top-level const), so these values must exist before those modules
// are first required anywhere in the test run.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";