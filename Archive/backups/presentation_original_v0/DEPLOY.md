# Publishing the C-ARMAGOTCHI website

This is a static site, like TALOS. **No build system, npm install, or backend required**.

## Show from a laptop (offline)

Open `pitch/index.html` in Chrome, Edge or Firefox. Press `F` for fullscreen; use the arrow keys or a clicker. `N` shows speaker notes, `A` opens the technical Q&A appendix and `?` shows the complete controls. Downloaded images are included locally.

## Presenter + speaker notes sync

For two-window synchronization, open a local terminal in this folder:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/pitch/` on the projector and `http://localhost:8000/teleprompter/` on the speaker's screen using the same browser profile. When a scene changes, the teleprompter follows. `file://` tabs may not synchronize reliably because some browsers treat local files as different origins.

## GitHub Pages

1. Create a new **public or Pages-enabled** GitHub repository.
2. Copy the contents of this folder (not the enclosing folder) to its main branch.
3. In the repository's Settings → Pages, choose Deploy from a branch, branch `main`, folder `/ (root)`.
4. Your website will appear at `https://<username>.github.io/<repository>/` with its deck at `/pitch/` and speaker notes at `/teleprompter/`.
5. Test both views from the exact same hosted origin and pre-download the archive as a fallback.

## Assets and claims

All dashboard records and physical robot-to-C-arm service interactions are simulated. The character artwork is original, adapted from the images made in this conversation. The TALOS repository is referenced only for the presentation interaction pattern, not copied in source or visual styling. The Siemens Healthineers and PUDU marks appear as illustrative references, not as endorsements.
