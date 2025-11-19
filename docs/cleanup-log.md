# Cleanup Log

## 2025-11-16 — Initial docs consolidation

- Created `/docs` structure in the repo root.
- Moved top-level markdown reports (testing summaries, feature docs) into `/docs/`.
- Left PDFs in place pending a more careful reference audit.

### Next steps

- Audit the codebase and documentation to identify unreferenced PDFs.
- Remove redundant PDFs from the repo once confirmed unused.
- Optionally use `git filter-repo` to clean large historical artifacts after PDFs are pruned.