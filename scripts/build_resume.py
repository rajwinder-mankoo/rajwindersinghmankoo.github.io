from pathlib import Path
import json
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from xml.sax.saxutils import escape
p=Path(__file__).resolve().parents[1] / 'src'
profile=json.loads((p/'_data/profile.json').read_text())
fontroot=Path('/System/Library/Fonts/Supplemental')
pdfmetrics.registerFont(TTFont('Resume',str(fontroot/'Arial.ttf')))
pdfmetrics.registerFont(TTFont('ResumeBold',str(fontroot/'Arial Bold.ttf')))
pdfmetrics.registerFontFamily('Resume',normal='Resume',bold='ResumeBold')
red=HexColor('#c22a2a'); ink=HexColor('#161616'); muted=HexColor('#555555')
styles={
'name':ParagraphStyle('name',fontName='ResumeBold',fontSize=27,leading=30,textColor=ink),
'intro':ParagraphStyle('intro',fontName='Resume',fontSize=10,leading=14,textColor=muted),
'heading':ParagraphStyle('heading',fontName='ResumeBold',fontSize=10,leading=14,textColor=red,spaceBefore=14,spaceAfter=5),
'role':ParagraphStyle('role',fontName='ResumeBold',fontSize=9.3,leading=12,textColor=ink),
'meta':ParagraphStyle('meta',fontName='Resume',fontSize=8.2,leading=11,textColor=muted),
'body':ParagraphStyle('body',fontName='Resume',fontSize=9,leading=12,textColor=ink,spaceAfter=5),
}
P=lambda text,style='body':Paragraph(text,styles[style])
story=[P('Rajwinder Singh Mankoo','name'),Spacer(1,8),P('Cybersecurity student | Detection engineering &amp; purple-team operations','intro'),Spacer(1,6),P('<link href="mailto:rajwindersinghmankoo@gmail.com">rajwindersinghmankoo@gmail.com</link> · <link href="https://rajwindersinghmankoo.dev">rajwindersinghmankoo.dev</link>','meta'),P('<link href="https://www.linkedin.com/in/rajwinder-mankoo/">linkedin.com/in/rajwinder-mankoo</link> · <link href="https://github.com/rajwinder-mankoo">github.com/rajwinder-mankoo</link>','meta')]
story+=[P('EDUCATION','heading'),P('Southern Utah University | B.S. Cybersecurity, minor in Computer Science','role'),P('August 2023 - April 2027 (expected) · Cedar City, UT','meta')]
story+=[P('EXPERIENCE','heading')]
summaries=[
'Troubleshoot hardware, software, and networking for students, faculty, and staff. Support Windows, macOS, Microsoft 365, Wi-Fi, and printers; document tickets and assist with device deployment.',
'Progressed from event volunteering to challenge development. Design DFIR, packet-analysis, OSINT, and blue-team scenarios with challenge logic and flag validation.',
'Supported admissions processing and outreach; maintained student records in Banner and CRM Slate.',
'Delivered STEM outreach, analyzed project data, updated websites, and presented program outcomes.',
'Built and maintained front-end web pages in a professional studio environment.'
]
for i,r in enumerate(profile['experience']):
 meta=r['meta'].replace('–','-').replace('\u00a0',' ')
 story+=[KeepTogether([P(escape(r['title']),'role'),P(escape(meta),'meta'),P(summaries[i])])]
story+=[P('SELECTED PROJECT','heading'),P('c0mpl1cated.labs | Wazuh SIEM','role'),P('Deployed a single-node SIEM on Proxmox, connected a Linux agent, and validated 57 events in a 24-hour window. Documented installation troubleshooting and default MITRE ATT&amp;CK mapping.'),P('<link href="https://rajwindersinghmankoo.dev/writeups/project-01-wazuh-siem/">Read the deployment case study at rajwindersinghmankoo.dev</link>','meta')]
story+=[P('CERTIFICATIONS','heading'),P('CompTIA Security+ (2026) · ISC2 CC (2026) · CRTA (2026)<br/>CSEDP (2026) · Google IT Support Professional (2026) · CNSP (2025)')]
story+=[P('RESEARCH &amp; RECOGNITION','heading'),P('Co-author, <link href="https://doi.org/10.1007/978-3-032-14778-3_1">Introduction to Emotion Expression and AI</link> (Springer, 2026).<br/>Co-author, <link href="https://doi.org/10.1515/9783111264349-012">Quantum Blind Computing for Privacy-Preserving Medical Diagnosis</link> (De Gruyter, 2025).<br/>NCAE Cyber Games: Most Valuable Teammate, SUU team (2026). BSides CTF: 1st and 2nd place finishes.')]
story+=[P('TECHNICAL SKILLS','heading'),P('Wazuh · MITRE ATT&amp;CK · Log analysis · Proxmox · Linux · Windows · Networking<br/>Python · Bash · PowerShell · Git')]
def decorate(canvas,doc):
 canvas.setStrokeColor(red);canvas.setLineWidth(2);canvas.line(42,756,570,756)
 canvas.setFont('Resume',8);canvas.setFillColor(muted);canvas.drawString(42,27,'Rajwinder Singh Mankoo');canvas.drawRightString(570,27,str(doc.page))
out=p/'assets/rajwinder-mankoo-resume.pdf'
SimpleDocTemplate(str(out),pagesize=(612,792),leftMargin=42,rightMargin=42,topMargin=48,bottomMargin=40,title='Rajwinder Singh Mankoo | Résumé',author='Rajwinder Singh Mankoo').build(story,onFirstPage=decorate,onLaterPages=decorate)
print('Résumé created')
