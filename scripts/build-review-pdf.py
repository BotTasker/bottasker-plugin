"""Build the supplementary review sheet from the packaged release metadata."""

import json
from functools import partial
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugins" / "bottasker-tasky"
manifest = json.loads((PLUGIN / "plugin.json").read_text())
settings = manifest["extensions"]["com.openai"]
video = settings["review"]["demo_recording_url"]
version = manifest["version"]
output = ROOT / "output" / "pdf" / "tasky-review.pdf"
output.parent.mkdir(parents=True, exist_ok=True)

blue = colors.HexColor("#2563EB")
ink = colors.HexColor("#172033")
muted = colors.HexColor("#546176")
styles = {
    "title": ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=26, leading=31, textColor=ink),
    "subtitle": ParagraphStyle("subtitle", fontName="Helvetica", fontSize=12, leading=18, textColor=muted),
    "heading": ParagraphStyle("heading", fontName="Helvetica-Bold", fontSize=13, leading=19, textColor=ink, spaceBefore=17, spaceAfter=7),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=10.5, leading=16, textColor=ink, alignment=TA_LEFT, spaceAfter=9),
    "link": ParagraphStyle("link", fontName="Helvetica-Bold", fontSize=12, leading=19, textColor=blue, spaceAfter=10),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=8.5, leading=12, textColor=muted),
}


def paragraph(text, style="body"):
    return Paragraph(text, styles[style])


story = [
    paragraph("Tasky by BotTasker", "title"),
    Spacer(1, 7),
    paragraph(f"Versión {escape(version)} | Ficha de revisión", "subtitle"),
    Spacer(1, 18),
    paragraph("Video de demostración", "heading"),
    paragraph(f'<a href="{escape(video, quote=True)}" color="#2563EB">{escape(video)}</a>', "link"),
    paragraph("El enlace de YouTube se incluye en los manifiestos de revisión del paquete. Debe estar accesible para el equipo revisor."),
    paragraph("Idiomas incluidos", "heading"),
]
labels = {"en-US": "Inglés", "es-PE": "Español", "pt-BR": "Portugués de Brasil"}
rows = [["Idioma", "Código de publicación"]]
rows.extend([labels.get(locale, locale), locale] for locale in settings["publication"]["translations"])
table = Table(rows, colWidths=[280, 210], hAlign="LEFT")
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFF6FF")),
    ("TEXTCOLOR", (0, 0), (-1, -1), ink),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
    ("FONTSIZE", (0, 0), (-1, -1), 10),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ("TOPPADDING", (0, 0), (-1, -1), 10),
    ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#DCE4EF")),
]))
story.extend([
    table,
    Spacer(1, 10),
    paragraph(f"Las {len(list((PLUGIN / 'skills').glob('*/SKILL.md')))} skills siguen el idioma solicitado. Los identificadores técnicos y los nombres existentes se conservan. La ficha incluye traducciones para los tres idiomas; su visualización en el directorio depende de OpenAI."),
    paragraph("Contenido de la entrega", "heading"),
    paragraph(f"Paquete: <b>bottasker-tasky-{escape(version)}-submission.zip</b><br/>MCP: https://api.bottasker.ai/mcp<br/>Autenticación: OAuth; permisos iniciales mcp:read y mcp:write."),
    paragraph("El paquete conserva la corrección de carga MCP de Codex. El ZIP de publicación incluye la configuración OAuth explícita y los casos de revisión positivos y negativos."),
    paragraph("Ubicación del enlace en el ZIP", "heading"),
    paragraph("plugin.json<br/>extensions.com.openai.review.demo_recording_url", "small"),
    Spacer(1, 12),
    paragraph("Esta ficha es material de apoyo. OpenAI importa el enlace y los idiomas desde los manifiestos del ZIP. El contenido del video y los resultados de evaluación deben ser revisados por separado.", "small"),
])


def decorate(canvas, doc):
    canvas.setFillColor(blue)
    canvas.rect(48, A4[1] - 35, A4[0] - 96, 4, fill=1, stroke=0)
    canvas.setFillColor(muted)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(48, 30, "BotTasker | bottasker.ai")
    canvas.drawRightString(A4[0] - 48, 30, f"{version} | {doc.page}")


SimpleDocTemplate(
    str(output), pagesize=A4, leftMargin=48, rightMargin=48,
    topMargin=53, bottomMargin=48, invariant=1, title=f"Tasky {version} - Revisión",
    author="BotTasker",
).build(story, onFirstPage=decorate, onLaterPages=decorate, canvasmaker=partial(Canvas, invariant=1))
print(output)
