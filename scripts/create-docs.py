from pathlib import Path
import re
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

root=Path(__file__).resolve().parent.parent
out=root/'docs'/'word'
out.mkdir(parents=True, exist_ok=True)
inputs=[('docs/PROJECT.md','TONG_QUAN_DU_AN.docx'),('backend/README.md','TAI_LIEU_BACKEND.docx'),('frontend/README.md','TAI_LIEU_FRONTEND.docx'),('backend/sql/README.md','CO_SO_DU_LIEU_MYSQL.docx')]
def clean(s):
    return re.sub(r'\[([^]]+)\]\([^)]+\)',r'\1',s).replace('`','').replace('**','')
def make_table(doc, rows):
    if not rows:return
    n=max(len(r) for r in rows)
    t=doc.add_table(rows=0, cols=n)
    t.autofit=False
    usable=16.6
    widths=([4.2,12.4] if n==2 else [usable/n]*n)
    for c,w in zip(t.columns,widths):c.width=Cm(w)
    for i,row in enumerate(rows):
        cells=t.add_row().cells
        for c,w in zip(cells,widths):c.width=Cm(w)
        for j,val in enumerate(row):
            p=cells[j].paragraphs[0];p.paragraph_format.space_after=Pt(4);p.paragraph_format.space_before=Pt(4)
            r=p.add_run(clean(val));r.font.size=Pt(9.5);r.bold=i==0
        trPr=t.rows[-1]._tr.get_or_add_trPr()
        cant=OxmlElement('w:cantSplit');trPr.append(cant)
        if i==0:trPr.append(OxmlElement('w:tblHeader'))
        for cell in cells:
            pr=cell._tc.get_or_add_tcPr()
            shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'E2EAF1' if i==0 else ('F7F9FB' if i%2==0 else 'FFFFFF'));pr.append(shade)
            margins=OxmlElement('w:tcMar')
            for side in ['top','left','bottom','right']:
                v=OxmlElement('w:'+side);v.set(qn('w:w'),'70');v.set(qn('w:type'),'dxa');margins.append(v)
            pr.append(margins)
    borders=OxmlElement('w:tblBorders')
    for side in ['top','left','bottom','right','insideH','insideV']:
        el=OxmlElement('w:'+side);el.set(qn('w:val'),'single');el.set(qn('w:sz'),'4');el.set(qn('w:color'),'D9D9D9');borders.append(el)
    t._tbl.tblPr.append(borders)
    doc.add_paragraph().paragraph_format.space_after=Pt(0)
for source,name in inputs:
    doc=Document();sec=doc.sections[0]
    sec.page_width=Cm(21);sec.page_height=Cm(29.7)
    sec.top_margin=Cm(2);sec.bottom_margin=Cm(2);sec.left_margin=Cm(2.2);sec.right_margin=Cm(2.2)
    sec.header_distance=Cm(.8);sec.footer_distance=Cm(.8)
    normal=doc.styles['Normal'];normal.font.name='Arial';normal.font.size=Pt(10.5);normal.paragraph_format.space_after=Pt(7);normal.paragraph_format.line_spacing=1.12
    for style,size in [('Title',23),('Heading 1',15),('Heading 2',12)]:
        st=doc.styles[style];st.font.name='Arial';st.font.size=Pt(size);st.font.color.rgb=RGBColor(0,0,0)
        st.paragraph_format.keep_with_next=True;st.paragraph_format.space_before=Pt(12);st.paragraph_format.space_after=Pt(7)
    for el in list(doc.styles.element.iter(qn('w:pBdr'))): el.getparent().remove(el)
    for el in list(doc.element.iter(qn('w:pBdr'))): el.getparent().remove(el)
    header=sec.header.paragraphs[0];header.text='GYM LC    |    TÀI LIỆU PHÁT TRIỂN';header.runs[0].font.size=Pt(8)
    footer=sec.footer.paragraphs[0];footer.alignment=2;footer.add_run('Trang ').font.size=Pt(8)
    field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)
    lines=(root/source).read_text(encoding='utf8').splitlines();i=0
    while i<len(lines):
        line=lines[i].strip()
        if not line:i+=1;continue
        if line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+',c or '-') for c in cells):rows.append(cells)
                i+=1
            make_table(doc,rows);continue
        if line.startswith('```'):
            code=[];i+=1
            while i<len(lines) and not lines[i].startswith('```'):code.append(lines[i]);i+=1
            # SQL is presented as wrapped readable definitions.
            p=doc.add_paragraph();p.paragraph_format.space_after=Pt(6);p.paragraph_format.line_spacing=1;p.paragraph_format.keep_together=True
            r=p.add_run('\n'.join(code));r.font.name='Consolas';r.font.size=Pt(8.5)
            i+=1;continue
        if line.startswith('# '):doc.add_paragraph(clean(line[2:]),'Title')
        elif line.startswith('### '):doc.add_paragraph(clean(line[4:]).replace('_',' '),'Heading 2')
        elif line.startswith('## '):doc.add_paragraph(clean(line[3:]),'Heading 1')
        else:doc.add_paragraph(clean(line))
        i+=1
    doc.save(out/name)
    print(name)
