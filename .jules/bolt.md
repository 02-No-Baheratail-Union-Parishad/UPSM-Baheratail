# Bolt's Performance Journal

Critical learnings and codebase-specific optimization guidelines for 02 No. Baheratail Union Parishad (UPSM 2.0).

## 2025-05-18 - Certificate Catalog Filtering Bottleneck in Form
**Learning:** `CertificateForm` contains many form state variables (e.g., name, father, mother, nid, etc.). Unmemoized array filtering over 47 certificate catalog items ran on every single keystroke across form inputs. Memoizing `filteredTypes` and `selectedTypeObj` with `useMemo` avoids redundant iteration and string lowercasing operations on every render.
**Action:** Always wrap array transformations/filtering in form components in `useMemo` if the form state triggers frequent re-renders on keystrokes.
