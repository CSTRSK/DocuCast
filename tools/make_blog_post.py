# -*- coding: utf-8 -*-
"""DocuCast: Blog-Eintrag (blog.json), JSON-LD + Nav (blog.html), Katalog (apps/index.html)."""
import json, re

SLUG = "docucast-dokumente-zu-podcast"
TITEL = "DocuCast: PDF und Word werden zum Audiopodcast"
CAT = "Tool"
DATUM = "4. Okt 2026"
TAGS = ["Audio", "Tool", "Bildung", "PWA", "Offline", "Datenschutz"]
EXCERPT = ("Dokument ablegen, Stil wählen, zuhören: DocuCast liest PDF und Word im Browser vor, "
           "erzeugt ein Dialogskript und speichert die Tonspur als WAV — rein lokal.")

BODY = """<p>Ein Whitepaper, ein Strategiepapier, ein Meeting-Protokoll: Gelesen h&auml;tte man es in zehn Minuten &ndash; nur passiert es selten. <strong>DocuCast</strong> dreht den Weg um. Dokument hineinziehen, Format und Stimmen w&auml;hlen, Dialog erzeugen &ndash; und dann h&ouml;rt man zu. Entscheidend dabei: Die Datei verl&auml;sst das Ger&auml;t nicht. Die Texterkennung l&auml;uft im Browser, es gibt keinen Upload, kein Konto und keinen Server, der etwas speichert.</p>

<h3>Drei Schritte, kein Konto</h3>
<p>Die App ist als Einweg-Werkzeug gebaut, nicht als Plattform:</p>
<table>
<tr><th>Schritt</th><th>Was passiert</th></tr>
<tr><td>1. Dokument ablegen</td><td>Datei antippen oder hineinziehen &ndash; oder eines der drei Beispieldokumente nutzen (Whitepaper, Strategiepapier, Briefing)</td></tr>
<tr><td>2. Format w&auml;hlen</td><td>Erz&auml;hlstil, Titel, Namen der beiden Sprecher und Sprache (Deutsch oder Englisch)</td></tr>
<tr><td>3. Dialog erzeugen</td><td>Aus den Abschnitten des Dokuments entsteht ein Zwei-Sprecher-Skript mit Einstieg, Hauptteil und Schluss</td></tr>
</table>
<p>Danach verteilt sich die Arbeit auf drei Ansichten: das <strong>Skript</strong> zum Nachlesen und Nachbessern, der <strong>Player</strong> zum H&ouml;ren und <strong>die Bibliothek</strong> als Ablage. In der Bibliothek landet alles automatisch im lokalen Speicher des Browsers &ndash; dort kann man Podcasts auch als Favoriten markieren und wieder l&ouml;schen.</p>

<h3>Die Analyse bleibt im Ger&auml;t</h3>
<p>PDF-Dateien liest die Bibliothek pdf.js direkt im Browser aus, Word-Dateien (.docx) zerlegt mammoth in Text samt Absatzstruktur; reine Textdateien (.txt, .md) gehen direkt durch. Damit die Oberfl&auml;che dabei nicht einfriert, l&auml;uft die Analyse in einem eigenen Hintergrund-Arbeiter (Web Worker): Das Dokument wird also verarbeitet, w&auml;hrend die App bedienbar bleibt.</p>
<table>
<tr><th>Dokumenttyp</th><th>Verarbeitung</th></tr>
<tr><td>PDF (.pdf)</td><td>pdf.js, seitenweise, im Hintergrund-Arbeiter</td></tr>
<tr><td>Word (.docx)</td><td>mammoth, Abs&auml;tze und &Uuml;berschriften bleiben erhalten</td></tr>
<tr><td>Text (.txt, .md)</td><td>direkt, Zeilenumbr&uuml;che und Abs&auml;tze bleiben Struktur</td></tr>
</table>
<p>Wichtig f&uuml;r alle, die mit vertraulichen Unterlagen arbeiten: Es gibt in der App <em>keinen</em> einzigen Netzwerkaufruf f&uuml;r ein Dokument. Kein Dienst bekommt den Text, kein Zwischenspeicher liegt auf einem Server. Was man hochzieht, bleibt im Browser.</p>

<h3>Vom Text zum Dialog</h3>
<p>Der Skriptgenerator arbeitet regelbasiert &ndash; er fragt keinen KI-Dienst, sondern liest die Struktur des Dokuments: &Uuml;berschriften werden zu Themenbl&ouml;cken, die wichtigsten Abs&auml;tze zu Beitr&auml;gen, und daraus entsteht ein Gespr&auml;ch zwischen zwei Sprechern mit Einstieg, &Uuml;berg&auml;ngen und Schluss. Vier Erz&auml;hlstile stehen zur Wahl:</p>
<table>
<tr><th>Stil</th><th>L&auml;nge</th><th>Charakter</th></tr>
<tr><td>Deep Dive</td><td>~5&ndash;8 Min</td><td>Ausf&uuml;hrliche Diskussion aller Abschnitte</td></tr>
<tr><td>Kompakt (TL;DR)</td><td>~2&ndash;3 Min</td><td>Nur die Kernaussagen, schnelle Zusammenfassung</td></tr>
<tr><td>Experten-Interview</td><td>~4&ndash;6 Min</td><td>Ein Sprecher fragt nach, der andere erkl&auml;rt</td></tr>
<tr><td>Diskussion &amp; Story</td><td>~5&ndash;7 Min</td><td>Lockerer Gedankenaustausch mit Beispielen</td></tr>
</table>
<p>Ein gemessener Durchlauf mit dem beiliegenden Beispiel-Whitepaper (&bdquo;KI in der Medizin&ldquo;, vier erkannte Abschnitte): 22 Dialogzeilen, 702 W&ouml;rter, rund f&uuml;nf Minuten gesch&auml;tzte Sprechzeit. Die Sch&auml;tzung steckt auch in der Fortschrittsanzeige des Players, sodass man vor dem H&ouml;ren wei&szlig;, wie lang es wird.</p>

<h3>Vorlesen: die Stimmen kommen vom Ger&auml;t</h3>
<p>DocuCast benutzt die Sprachausgabe des Browsers (Web Speech API) &ndash; es wird also nichts gestreamt und nichts berechnet, was nicht schon da ist. Die App sucht automatisch passende Stimmen f&uuml;r die gew&auml;hlte Sprache und gibt Host A und Host B unterschiedliche Stimmen, sofern das Ger&auml;t mindestens zwei in dieser Sprache anbietet. Tempo und Tonh&ouml;he sind einstellbar, im Player gibt es Sprungkn&ouml;pfe von 15 Sekunden und Geschwindigkeiten von 0,75- bis 2-fach.</p>
<p>Der laufende Beitrag wird im Transkript hervorgehoben und mitgezogen; ein Tipp auf eine beliebige Zeile springt dorthin. Das ist praktisch, um noch einmal nachzuh&ouml;ren, was in Abschnitt zwei gesagt wurde &ndash; ohne die Stelle zu suchen.</p>
<p>Eine Einschr&auml;nkung geh&ouml;rt dazu, weil sie den Eindruck stark bestimmt: <strong>Die Stimmen sind die des Ger&auml;ts.</strong> Windows, Android, iOS, macOS und Linux klingen unterschiedlich gut, und ohne installierte Sprachausgabe bleibt es still. DocuCast kann keine Stimme mitbringen &ndash; die kommt vom System. Auf einem aktuellen Handy klingt das Ergebnis deutlich nat&uuml;rlicher als auf einem nackten Linux-Desktop.</p>

<h3>Audio speichern: was in der WAV-Datei wirklich steckt</h3>
<p>Hier ist Ehrlichkeit wichtiger als ein sch&ouml;ner Knopf. Eine Aufnahme der echten Sprechstimmen kann der Browser nicht erzeugen: Die systemeigene Sprachausgabe l&auml;sst sich nicht mitschneiden. Der Export liefert deshalb die <em>Tonspur des Dialogverlaufs</em>, die die App selbst berechnet:</p>
<table>
<tr><th>Bestandteil</th><th>Details</th></tr>
<tr><td>Intro-Gong</td><td>Kurzer Zweiklang zu Beginn</td></tr>
<tr><td>Sprecher-Tonh&ouml;hen</td><td>Host A bei 130 Hz, Host B bei 210 Hz, bandpassgefiltert mit Intonationsverlauf &ndash; damit die beiden Sprecher unterscheidbar bleiben</td></tr>
<tr><td>&Uuml;bergangst&ouml;ne</td><td>Zwischen den Beitr&auml;gen, je nach Sprecher unterschiedlich</td></tr>
<tr><td>L&auml;nge</td><td>Exakt die gesch&auml;tzte Sprechzeit des Skripts</td></tr>
</table>
<p>Gemessen: F&uuml;r ein Skript mit rund f&uuml;nf Minuten entsteht eine <strong>7,85 MB gro&szlig;e WAV-Datei</strong> (22,05 kHz, mono) mit g&uuml;ltigem RIFF/WAVE-Kopf &ndash; abspielbar in jedem Player, aber eben mit T&ouml;nen statt Worten. Wer die Worte mitschneiden will, nimmt am Rechner ein Aufnahmeger&auml;t mit, das den Systemklang abgreift; die App selbst kann es nicht. Zus&auml;tzlich l&auml;sst sich das Skript als Textdatei oder als Markdown exportieren &ndash; f&uuml;r eigene Nachbearbeitung.</p>

<h3>Alles bleibt auf dem Ger&auml;t</h3>
<p>Gespeichert wird in der Datenbank des Browsers (IndexedDB), in drei getrennten Ablagen:</p>
<table>
<tr><th>Ablage</th><th>Inhalt</th></tr>
<tr><td>Podcasts</td><td>Skript, Segmente, Format, Titel, Favoriten-Status</td></tr>
<tr><td>Audiodateien</td><td>erzeugte WAV-Dateien</td></tr>
<tr><td>Dokumente</td><td>der extrahierte Text der hochgeladenen Dateien</td></tr>
</table>
<p>Es gibt kein Konto, keine Anmeldung und keine Synchronisation. Der Preis daf&uuml;r ist ebenfalls klar: Wird der Browser-Speicher geleert oder das Ger&auml;t gewechselt, sind die Podcasts weg. F&uuml;r alles, was bleiben soll, ist der Export gedacht.</p>

<h3>Offline und installierbar</h3>
<p>Die App bringt einen Service Worker mit, der die Programmdateien beim ersten Besuch ablegt &ndash; auch den vergleichsweise gro&szlig;en PDF-Arbeiter mit 1,26 MB. Danach l&auml;uft DocuCast ohne Netz: Dokumente einlesen, Skripte erzeugen, vorlesen und exportieren funktionieren auch im Flugmodus. Installieren l&auml;sst es sich als App (eigenes Symbol, Portrait, dunkler Systemrahmen); der Service Worker ist ausdr&uuml;cklich auf <code>/DocuCast/</code> beschr&auml;nkt und r&uuml;hrt andere Seiten der Domain nicht an.</p>

<h3>Technik und Grenzen</h3>
<table>
<tr><th>Kennzahl</th><th>Wert</th></tr>
<tr><td>B&uuml;ndel</td><td>1.062 KB JavaScript (322 KB komprimiert), 63 KB CSS (9,5 KB komprimiert)</td></tr>
<tr><td>PDF-Arbeiter</td><td>1.264 KB, wird nur bei Bedarf geladen</td></tr>
<tr><td>Module</td><td>1.925</td></tr>
<tr><td>Bauzeit</td><td>1,95 Sekunden</td></tr>
<tr><td>Lizenz</td><td>AGPL-3.0</td></tr>
</table>
<p>Und die Grenzen, ungeschminkt: Die Qualit&auml;t des Vorlesens h&auml;ngt am Ger&auml;t, nicht an der App. Die WAV-Datei enth&auml;lt T&ouml;ne, keine Sprache. Sehr lange Dokumente erzeugen sehr viele Beitr&auml;ge &ndash; daf&uuml;r ist der Stil &bdquo;Kompakt&ldquo; gedacht. Und wer den Browser-Speicher aufr&auml;umt, verliert die Bibliothek.</p>

<h3>Fazit</h3>
<p>DocuCast ist der k&uuml;rzeste Weg von einem Dokument zum H&ouml;rbuch-Abend: ablegen, Stil w&auml;hlen, zuh&ouml;ren. Es ist kein Studio &ndash; die Stimmen kommen vom Ger&auml;t und die WAV-Datei ist eine Tonspur, keine Sprachaufnahme. Daf&uuml;r passiert alles auf dem eigenen Rechner, ohne Konto, ohne Upload, und funktioniert nach dem ersten Besuch auch offline.</p>
<p><a href="https://cstrsk.de/DocuCast/">DocuCast &ouml;ffnen &rarr;</a></p>"""


def main():
    posts = json.load(open("/tmp/blog.json", encoding="utf-8"))
    assert not any(p["slug"] == SLUG for p in posts), "Slug existiert schon"
    neu = {"slug": SLUG, "date": DATUM, "title": TITEL, "excerpt": EXCERPT,
           "tags": TAGS, "cat": CAT, "body": BODY}
    posts.insert(0, neu)
    json.dump(posts, open("/tmp/dc-blog.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"blog.json: {len(posts)} Posts (vorher {len(posts)-1})")
    print(f"  Titel {len(TITEL)} | Excerpt {len(EXCERPT)} | Body {len(BODY)} | H3 {BODY.count('<h3>')} | Tabellen {BODY.count('<table')} | Tags {len(TAGS)}")

    # --- blog.html: JSON-LD + Nav-Links ---
    h = open("/tmp/blog.html", encoding="utf-8").read()
    eintrag = ('      {"@type": "BlogPosting", "headline": "' + TITEL + '", "description": "' + EXCERPT +
               '", "datePublished": "2026-10-04", "url": "https://cstrsk.de/blog.html#' + SLUG +
               '", "author": {"@type": "Organization", "name": "CSTRSK"}},')
    anker = '"@graph": [\n'
    assert h.count(anker) == 1
    h = h.replace(anker, anker + eintrag + "\n", 1)
    desktop = '<a href="/PokePrice/">PokéPrice</a>'
    assert h.count(desktop) == 1
    h = h.replace(desktop, desktop + '   <a href="/DocuCast/">DocuCast</a>')
    mobil = '<a href="/PokePrice/" onclick="closeMobile()">PokéPrice</a>'
    assert h.count(mobil) == 1
    h = h.replace(mobil, mobil + '\n          <a href="/DocuCast/" onclick="closeMobile()">DocuCast</a>')
    open("/tmp/dc-blog.html", "w", encoding="utf-8").write(h)
    anzahl_bp = h.count('"@type": "BlogPosting"')
    anzahl_nav = h.count("DocuCast")
    print(f"blog.html: BlogPostings {anzahl_bp} | DocuCast-Nennungen {anzahl_nav}")

    # --- apps/index.html: Katalog ---
    a = open("/tmp/apps-index.html", encoding="utf-8").read()
    katalog = ("  {slug:'docucast',name:'DocuCast',icon:'🎧',desc:'PDF- und Word-Dokumente im Browser in "
               "Zwei-Sprecher-Audiopodcasts umwandeln: Text im Gerät lesen, Dialogskript erzeugen, vorlesen und "
               "als WAV speichern — ohne Upload.',tags:['Audio','Bildung','PWA'],cat:'Tool',url:'https://cstrsk.de/DocuCast/'},\n")
    marker = "var apps = [\n"
    assert a.count(marker) == 1, "Katalog-Marker nicht gefunden"
    a = a.replace(marker, marker + katalog, 1)
    open("/tmp/dc-apps.html", "w", encoding="utf-8").write(a)
    print(f"Katalog: {a.count(chr(123)+'slug:')} Eintraege")


if __name__ == "__main__":
    main()
