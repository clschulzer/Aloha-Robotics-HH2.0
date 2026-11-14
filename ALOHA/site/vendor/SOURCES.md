# Palm scene sources

The palm renderer uses browser-native WebGL. It has **no vendored library, downloaded model, image texture, font dependency, or runtime CDN request**.

`../palm.mjs` contains original procedural geometry, shaders, input handling, and lifecycle code written for ALOHA. `../palm-fallback.svg` is an original vector fallback.

The visual reference was [ibrahimify/talos](https://github.com/ibrahimify/talos), specifically the large central sculpture, restrained controls, accessible motion handling, and generous negative space. No TALOS code or geometry was copied.
