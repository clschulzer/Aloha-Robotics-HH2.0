# Hosting C-ARMAGOTCHI as a website

This is a static site: no build command, package manager or external data connection is required.

## Local rehearsals

From the project root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/pitch/` and `http://localhost:8000/teleprompter/` on the **same browser origin**. They synchronize slide/step state via `BroadcastChannel` with a localStorage fallback. Do not open the two pages under different domains or ports if you expect synchronization.

## GitHub Pages

1. Create a repository.
2. Upload **the contents** of the ZIP's `CARMAGOTCHI_Web_Pitch/` directory to the repository root.
3. Under **Settings → Pages**, choose Deploy from a branch, `main`, `/ (root)`.
4. Open `https://<owner>.github.io/<repo>/pitch/` after publishing.

The included `.nojekyll` file prevents Jekyll from interfering with the static asset paths.

## Final show checklist

- Replace three placeholder teammate names/portraits in `pitch/index.html`.
- Confirm the attached 40-second `pitch/media/chaos_intro.mp4` plays on the actual projector browser and routes its audio correctly.
- Test `F`, arrow keys, `S`, `P`, `V`, `N` and `A`.
- Check the 14 scenes and the two appendix scenes at 1920 × 1080, plus a smaller 16:9 display.
- Keep a local offline copy in case the event Wi-Fi is unreliable.

Everything rendered by the simulator is synthetic; this project does not connect to real medical devices.
