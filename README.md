# Roof Truss Calculator

MDI & Associates preliminary roof truss calculator (single-file index.html, GitHub Pages).

## Truss types
Common/Fink, Howe, King Post, Queen Post, Attic, Mono, Vaulted Ceiling (Scissor), and **Architectural (heavy timber)**: exposed patio/porch trusses in 4x6 through 8x12 timbers. The architectural type covers:
- **Patterns:** king post, king post with struts, queen post, or Howe open web.
- **Spacing:** trusses at 4–12 ft o.c., with purlins bracing the top chord.
- **NDS 2018 values:**
  - 4x members are dimension lumber (Table 4A/4B, with size factor C_F).
  - 5x5 and larger are Beams & Stringers or Posts & Timbers (Table 4D).
  - Dressed sizes come from NDS Table 1B.
- **Service:** an exposed/wet-service toggle applies the wet-service factor C_M.
- **Peak point load:** for example, a ridge beam bearing on the truss.
- **Connections:** a simple check of bolted steel side plates or a knife plate (NDS §12.3 yield limit, double shear). The final connection design is by the Engineer of Record.

## Tests
Serve the repo root (`python3 -m http.server 8765`) and run `node tests/<name>.test.js` (requires puppeteer-core and Chrome).
