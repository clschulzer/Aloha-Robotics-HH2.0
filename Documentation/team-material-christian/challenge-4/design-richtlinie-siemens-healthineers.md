# Designrichtlinie Siemens Healthineers für den Prototyp

Stand: 12.11.2026. Recherche öffentlicher Quellen, damit der Prototyp für Challenge 4 nach
Siemens Healthineers aussieht, ohne geschützte Assets zu kopieren. Kein Rechtsrat.

## Kurzfassung

- Es gibt **zwei** Designsysteme. **SHUI** (Siemens Healthineers User Interface) ist das System für
  Produkte und Geräte-UIs, also auch für einen C-Bogen. Es ist **nicht öffentlich** [geprüft].
  **UI MarCom** ist öffentlich dokumentiert, aber für Websites und Marketing gedacht [geprüft].
- Für den Prototyp nutzen wir **Farben, Abstände, Schatten und Grundregeln aus UI MarCom** als
  Orientierung und bauen damit eine **eigene, angelehnte Oberfläche**. Das ist realistisch, weil
  eine Geräte-UI ohnehin nicht wie eine Marketing-Website aussieht.
- **Nicht verwenden:** Logo, die Schriften Siemens Sans und SH-Bree, das Icon-Font von UI MarCom,
  den Namen als Absender. Die Terms of Use verbieten Kopieren und Weitergeben ohne schriftliche
  Erlaubnis [geprüft].
- **Schrift-Ersatz:** frei lizenzierte Schriften, die die Richtlinie selbst als Fallback nennt
  (Open Sans, Roboto) oder Systemschriften.
- **Fertige Komponenten:** Siemens iX (Siemens AG, nicht Healthineers) ist MIT-lizenziert und
  hat einen Dark-Mode für Bedienoberflächen [geprüft]. Gute Abkürzung, wenn wir React,
  Angular, Vue oder Web Components nehmen. Nur das Theme `classic`, nicht das Brand-Theme.
- **Rückfrage lohnt sich:** Am 13.11. im Siemens Training Center fragen, ob wir für die Demo
  Logo, Schrift oder SHUI-Screens nutzen dürfen. Ein Ja würde den Look deutlich näher an echte
  Geräte bringen.

## Die Quellen im Überblick

| Quelle | Was es ist | Öffentlich? | Für uns |
|---|---|---|---|
| [Markenseite](https://www.siemens-healthineers.com/deu/company/brand) | Markenwerte, Farbnamen, Schriftnamen | ja | Prinzipien, Farbwelt |
| [UI MarCom 3](https://ux.siemens-healthineers.com/ui-marcom/3/fundamentals/index.html) | Designsystem für Websites, Newsletter, Marketing-Apps | Doku ja, Code und Schriften über privates npm | Farb-Hexwerte, Raster, Schatten, Komponentenliste |
| [UI MarCom Startseite](https://ux.siemens-healthineers.com/ui-marcom) | Versionen (v4 aktuell, v3 läuft Ende FY26 aus) | ja | Überblick, Ansprechpartner |
| SHUI ([Red Dot 2018](https://red-dot.org/project/shui-siemens-healthineers-user-interface-25965), [UX Design Awards 2018](https://ux-design-awards.com/winners/shui)) | Designsystem für alle Produkt- und Geräte-UIs, mit IDEO entwickelt | nein, intern | nur Prinzipien |
| [Siemens iX](https://ix.siemens.io/docs/home/overview) | Open-Source-Designsystem der Siemens AG für industrielle Bedienoberflächen | ja, MIT | fertige Komponenten, Dark-Mode |
| [Terms of Use](https://www.siemens-healthineers.com/terms-of-use) | Nutzungsbedingungen der Website | ja | Grenzen |

UI MarCom sagt selbst, es passe, wenn ein Projekt „more about communication measures and less
about functionality for the end-user“ ist [geprüft]. Für Geräte verweist die UX-Seite auf SHUI,
„including user interfaces embedded into hardware products“ [geprüft].

## Markenprinzipien, die wir übernehmen können

Aus Markenseite und dem Artikel [Medical Technology Design as a Strategic Success Factor](https://www.siemens-healthineers.com/perspectives/mso-medical-technology-design-as-success-factor.html) (2019):

- **Weiß dominiert**, steht für Sauberkeit, Präzision, High-Tech [geprüft].
- **Schwarz als Bühne für medizinische Bilder** [geprüft]. In UI MarCom ist Schwarz nur für
  Key Visuals und klinische Bilder gedacht [geprüft]. Für ein Display am C-Bogen ist ein dunkles
  Theme daher plausibel; SHUI kann laut Award-Texten je nach Raumlicht zwischen hell und dunkel
  wechseln [geprüft].
- **Healthy Orange** ist die Signaturfarbe, **Siemens Petrol** die Akzentfarbe [geprüft].
- Design für **kritische klinische Entscheidungssituationen**, eine **einheitliche Designsprache**
  über Hardware, Software und Service, gleiche Bedienung auf allen Geräten [geprüft].

## Design-Tokens (aus UI MarCom 3, Farben-Seite)

Alle Hexwerte stammen von der [Farben-Seite](https://ux.siemens-healthineers.com/ui-marcom/3/fundamentals/colors/index.html) [geprüft].
Farbwerte selbst sind nicht urheberrechtlich geschützt; wir nutzen sie als Orientierung, ohne
uns als Siemens Healthineers auszugeben.

### Marke

| Token (Vorschlag) | Name bei SH | Hex | Einsatz laut Richtlinie |
|---|---|---|---|
| `--brand-orange` | Healthy Orange | `#ec6602` | Primäre Aktionen, aktive Zustände |
| `--brand-orange-accessible` | Accessible Orange | `#cf4b00` | Orange für Text und kleine Flächen (Kontrast) |
| `--brand-orange-50` | Healthy Orange (50) | `#f9b591` | |
| `--brand-orange-25` | Healthy Orange (25) | `#fdddcb` | |
| `--brand-petrol` | Siemens Petrol | `#009999` | Kleinere Elemente, Akzente |
| `--brand-petrol-accessible` | Accessible Petrol | `#02787d` | Petrol für Text (Kontrast) |
| `--brand-petrol-50` | Siemens Petrol (50) | `#87d2d2` | |
| `--brand-petrol-25` | Siemens Petrol (25) | `#c8e6e6` | |

### Grautöne und Hintergründe

| Hex | Name | Einsatz |
|---|---|---|
| `#ffffff` | SH Black (0) / white | Standardhintergrund |
| `#f2f2f2` | black-5 | |
| `#ededed` | black-7 | heller Alternativhintergrund |
| `#e6e6e6` | black-10 | Text auf Dunkel |
| `#cccccc` | black-20 | |
| `#b3b3b3` | black-30 | |
| `#999999` | black-40 | gedämpfter Text und Icons auf Dunkel |
| `#808080` | SH Black (50) | |
| `#666666` | SH Black (60) | gedämpfter Text und Icons auf Hell |
| `#4d4d4d` | black-70 | |
| `#333333` | black-80 | |
| `#1a1a1a` | SH Black (90) | Standardtext auf Hell |
| `#000000` | SH Black (100) | Hintergrund für Bilder |

### Funktionsfarben (Status)

| Token (Vorschlag) | Name | Hex | Barrierearm |
|---|---|---|---|
| `--status-error` | SH Red | `#e7001d` | Accessible Red `#d9001d` |
| `--status-success` | SH Green | `#009a38` | Accessible Green `#197c3a` |
| `--status-warning` | SH Yellow | `#ffd200` | (nur mit dunklem Text) |

Funktionsfarben werden laut Richtlinie nie abgetönt [geprüft]. Zusatzfarben (Cyan `#3abfed`,
Berry `#7a162d`, Blue `#2b2483`) nur für Diagramme [geprüft].

Regeln: Auf dunklem Grund nur Weiß und Hellgrau für Text. Akzentfarben sparsam. Ziel WCAG 2.2 AA
[geprüft].

### Abstände, Raster, Schatten

- **10-px-Raster**, Icons und Schrift auf 5-px-Raster, alle Maße Vielfache von 5 px [geprüft].
- **12-spaltiges** fluides Raster; Fließtext maximal 8 Spalten breit [geprüft].
- **Grundschriftgröße 18 px**, Komponenten 16 px, Minimum 14 px nur in Ausnahmen [geprüft].
  Für ein Touch-Display am C-Bogen eher größer (siehe unten).
- **Schatten** ([Elevation](https://ux.siemens-healthineers.com/ui-marcom/3/fundamentals/elevation/index.html)) [geprüft]:

```css
/* Auf hellem Grund; auf dunklem Grund Alpha-Werte verdoppeln */
--shadow-flat:    0 0 0 1px rgba(0,0,0,.10);                                /* Karten */
--shadow-raised:  0 2px 4px 0 rgba(0,0,0,.10), 0 -1px 2px 0 rgba(0,0,0,.05); /* Karte bei Hover */
--shadow-nav:     0 4px 8px 0 rgba(0,0,0,.10);                              /* Navigationsleiste */
--shadow-overlay: 0 4px 8px 0 rgba(0,0,0,.10), 0 -1px 4px 0 rgba(0,0,0,.05); /* Dialog, Dropdown */
```

Eckenradius, Schriftgewichte und Zeilenhöhen stehen nicht im öffentlichen Text.

## Schriften: was geht und was nicht

- Marke: **SH-Bree Headline** für Überschriften, **Siemens Sans** für Text [geprüft]. Beide sind
  proprietär, liegen nur im privaten npm-Paket von UI MarCom, und die Doku sagt ausdrücklich:
  „Do not download the font files manually from another source.“ [geprüft]
- Die offizielle Fallback-Kette lautet `'Siemens Sans', 'SH-Bree-Text', 'Open Sans', 'Roboto',
  'Droid Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif` [geprüft].
- **Für uns:** die Kette ab `'Open Sans'` nehmen. Open Sans und Roboto stehen unter der SIL Open
  Font License bzw. Apache 2.0 und dürfen eingebettet werden. Wegen der Offline-Pflicht die
  Schriftdateien lokal ins Projekt legen, nicht von Google Fonts laden.

```css
--font-sans: 'Open Sans', 'Roboto', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
```

## Komponenten

UI MarCom 3 hat 53 Komponenten (u. a. Application Bar, Alerts, Button, Cards, Modal Dialog,
Progress, Steps Bar, Tabs, Toggle Switch, Loading Animation) [geprüft]. Code und Icons kommen nur
über das private npm-Paket, also nicht nutzbar. Die Liste taugt als Checkliste, welche Bausteine
ein SH-Nutzer kennt.

Zwei Wege für den Prototyp:

1. **Siemens iX** ([Doku](https://ix.siemens.io/docs/home/overview), [GitHub](https://github.com/siemens/ix)),
   MIT-Lizenz für `@siemens/ix`, `@siemens/ix-react`, `@siemens/ix-icons` [geprüft]. Fertige
   Komponenten für Bedienoberflächen, Hell/Dunkel über
   `<html data-ix-theme="classic" data-ix-color-schema="dark">`. Ist industriell (Siemens AG),
   nicht Healthineers, und hat keine Orange-Akzente; Akzentfarbe per CSS-Variable auf Healthy
   Orange setzen. Nur das Open-Source-Theme `classic` nutzen; die Brand-Assets und die
   Brand-Figma-Bibliothek sind Siemens-intern [geprüft]. MIT-Lizenzhinweis beibehalten.
2. **Eigenes schlankes CSS** mit den Tokens oben, falls wir ohne Framework bauen. Weniger
   Abhängigkeiten, läuft sicher offline.

Empfehlung: Weg 2, wenn die Demo aus wenigen Screens besteht (Gerätedisplay plus ein
Service-Dashboard); Weg 1, wenn wir viele Formulare und Tabellen brauchen [Annahme].

## Vorschlag für den Prototyp-Look

- **Gerätedisplay am C-Bogen:** dunkles Theme (Schwarz/`#1a1a1a`, Text `#e6e6e6`), Orange nur für
  die eine Hauptaktion (z. B. „Update jetzt“; „Später“ als neutraler Button), Petrol für Statusinfos, Funktionsfarben für
  Zustände. Große Touch-Ziele und Schrift ab 18 px, weil die OP-Pflege mit Handschuhen und aus
  Abstand bedient [Annahme].
- **Service- oder Admin-Ansicht:** helles Theme (Weiß, `#ededed` für Flächen, Text `#1a1a1a`).
- **Kritische Meldungen** bleiben stehen, bis sie bestätigt sind (Regel aus
  `.claude/rules/gesundheitsdaten.md`).
- **Kennzeichnung:** im Footer „Hackathon-Prototyp, kein Produkt von Siemens Healthineers, kein
  Medizinprodukt“. Platzhalter statt Logo, z. B. Teamname.

## Rechtliche Grenzen

Aus den [Terms of Use](https://www.siemens-healthineers.com/terms-of-use), deutsches Recht [geprüft]:

- §4.4: „The User shall not distribute the Siemens Healthineers Contents to third parties, or make
  them available in any other way.“
- §5.1: „any brand names and other Siemens Healthineers Contents … may not be modified, copied,
  reproduced, sold, rented, supplemented or used in any other way without the prior written
  permission of Siemens Healthineers.“

Daraus folgt für uns:

| Element | Nutzen? |
|---|---|
| Farbwerte, Abstände, Schatten als Orientierung | ja |
| Freie Ersatzschriften (Open Sans, Roboto) | ja |
| Siemens iX, Theme `classic` | ja, MIT |
| Logo, Name als Absender, „Healthineers“-Punkte | nein, ohne Erlaubnis |
| Siemens Sans, SH-Bree, UI-MarCom-Icon-Font, Bilder aus Brandville | nein |
| Screenshots echter SH-Geräte-UIs nachbauen | nein |
| Figma-Doku von UI MarCom (Passwort steht öffentlich auf der Startseite) | lesen ja, Assets nicht übernehmen |

Ansprechpartner für UI MarCom laut Doku: `ui-marcom.team@siemens-healthineers.com`. Einfacher
ist die Frage an die Challenge-Geber vor Ort.

## Was öffentlich nicht zu finden war

SHUI-Spezifikationen, Eckenradius, Schriftgewichte und Zeilenhöhen, Spacing-Tokens als Zahlen
(nur als Bild), Inhalte von UI MarCom 4 (nur Storybook-Hülle), Mindestgröße und Schutzzone des
Logos (stehen in Brandville, Login nötig).
