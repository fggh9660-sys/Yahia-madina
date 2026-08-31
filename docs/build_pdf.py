# -*- coding: utf-8 -*-
"""Render M4_Narrative_Design.md -> styled HTML for PDF printing."""
import markdown, pathlib

HERE = pathlib.Path(__file__).parent
md_text = (HERE / "M4_Narrative_Design.md").read_text(encoding="utf-8")

html_body = markdown.markdown(
    md_text,
    extensions=["tables", "fenced_code", "sane_lists", "toc"],
)

CSS = """
@page { size: A4; margin: 18mm 16mm 20mm 16mm; }
* { box-sizing: border-box; }
body {
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  font-size: 10.5pt; line-height: 1.55; color: #1f2933;
  max-width: 100%; margin: 0; padding: 0;
}
/* Arabic glyph support */
:lang(ar), [dir="rtl"] { font-family: "Segoe UI", "Traditional Arabic", "Tahoma", serif; }
h1 {
  font-size: 22pt; color: #15324f; margin: 0 0 4pt;
  border-bottom: 3px solid #c9a227; padding-bottom: 6pt; line-height: 1.2;
}
h2 {
  font-size: 15pt; color: #15324f; margin: 22pt 0 6pt;
  border-bottom: 1px solid #d6dee6; padding-bottom: 4pt;
  page-break-after: avoid;
}
h3 {
  font-size: 12pt; color: #1d4ed8; margin: 16pt 0 4pt;
  page-break-after: avoid;
}
h1 + p, h2 + p { margin-top: 4pt; }
p, li { margin: 4pt 0; }
strong { color: #0f2436; }
blockquote {
  margin: 8pt 0; padding: 6pt 12pt; background: #f6f8fb;
  border-left: 4px solid #c9a227; color: #2b3a4a; border-radius: 0 4px 4px 0;
}
blockquote p { margin: 3pt 0; }
code {
  font-family: "Cascadia Code", "Consolas", monospace; font-size: 9pt;
  background: #eef2f6; padding: 1px 4px; border-radius: 3px; color: #b3306b;
}
pre {
  background: #0f2436; color: #e6edf3; padding: 12pt; border-radius: 6px;
  overflow-x: auto; font-size: 8.5pt; line-height: 1.4;
  page-break-inside: avoid; white-space: pre;
}
pre code { background: none; color: inherit; padding: 0; font-size: 8.5pt; }
table {
  border-collapse: collapse; width: 100%; margin: 10pt 0; font-size: 9pt;
  page-break-inside: avoid;
}
th, td { border: 1px solid #cdd7e1; padding: 5pt 7pt; text-align: left; vertical-align: top; }
th { background: #15324f; color: #fff; font-weight: 600; }
tr:nth-child(even) td { background: #f6f8fb; }
hr { border: none; border-top: 1px solid #d6dee6; margin: 18pt 0; }
ul, ol { padding-left: 20pt; }
a { color: #1d4ed8; text-decoration: none; }
.cover-meta { color: #5b6b7b; font-size: 9.5pt; }
"""

html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>M4 Narrative Design Document</title>
<style>{CSS}</style>
</head>
<body>
{html_body}
</body>
</html>"""

out = HERE / "M4_Narrative_Design.html"
out.write_text(html_doc, encoding="utf-8")
print("wrote", out)
