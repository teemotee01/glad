import { jsPDF } from 'jspdf'

export function exportPDF({ category, measurements, color, aiResult }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, M = 18
  let y = M

  // Header band
  doc.setFillColor(7, 7, 10)
  doc.rect(0, 0, W, 36, 'F')
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(200, 169, 110)
  doc.text('NEXUS', M, 16)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 165, 140)
  doc.text('Fashion & Design Platform — Sewing Pattern Sheet', M, 24)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, M, 30)
  y = 46

  // Title
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 40)
  doc.text(`${capitalize(category)} — Sewing Pattern`, M, y); y += 10

  // Color swatch
  const rgb = hexToRgb(color)
  if (rgb) {
    doc.setFillColor(rgb.r, rgb.g, rgb.b)
    doc.roundedRect(M, y, 12, 7, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text(`Fabric color: ${color}`, M + 16, y + 5)
    y += 13
  }

  // Measurements
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 40)
  doc.text('Measurements', M, y); y += 7
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const mRows = [
    ['Height', `${measurements.height} cm`],
    ['Chest',  `${measurements.chest} cm`],
    ['Waist',  `${measurements.waist} cm`],
    ['Hips',   `${measurements.hips} cm`],
    ['Shoe',   `EU ${measurements.shoe}`],
  ]
  mRows.forEach(([l, v]) => {
    doc.setTextColor(90)
    doc.text(l, M + 4, y)
    doc.setTextColor(30)
    doc.setFont('helvetica', 'bold')
    doc.text(v, M + 45, y)
    doc.setFont('helvetica', 'normal')
    y += 5.5
  })
  y += 4

  // Divider
  doc.setDrawColor(200, 169, 110)
  doc.setLineWidth(0.3)
  doc.line(M, y, W - M, y)
  y += 7

  // AI Result
  if (aiResult) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30)
    doc.text('AI Design Notes', M, y); y += 6
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    const lines = doc.splitTextToSize(aiResult.replace(/[^\x00-\x7F]/g, ''), W - M * 2)
    lines.forEach(line => {
      if (y > 265) { doc.addPage(); y = M }
      doc.text(line, M, y); y += 5
    })
    y += 6
    doc.setDrawColor(200, 169, 110)
    doc.line(M, y, W - M, y)
    y += 8
  }

  // Pattern diagram grid
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30)
  doc.text('Pattern Pieces (1 square = 6cm)', M, y); y += 6
  const gL = M, gT = y, gW = W - M * 2, gH = 60, cell = 6
  doc.setDrawColor(220, 215, 205)
  doc.setLineWidth(0.12)
  for (let x = 0; x <= gW; x += cell) doc.line(gL + x, gT, gL + x, gT + gH)
  for (let gy = 0; gy <= gH; gy += cell) doc.line(gL, gT + gy, gL + gW, gT + gy)
  doc.setFillColor(200, 169, 110, 0.1)
  doc.setDrawColor(200, 169, 110)
  doc.setLineWidth(0.5)
  const pieces = getPieces(category)
  let px = gL + 6
  pieces.forEach(({ label, w, h }) => {
    doc.rect(px, gT + 6, w, h, 'FD')
    doc.setFontSize(6.5)
    doc.setTextColor(100, 80, 20)
    doc.text(label, px + 3, gT + 6 + h / 2)
    px += w + 4
  })
  y += gH + 8

  // Assembly steps
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30)
  doc.text('Assembly Instructions', M, y); y += 6
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60)
  getSteps(category).forEach((step, i) => {
    if (y > 262) { doc.addPage(); y = M }
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 169, 110)
    doc.text(`${i + 1}.`, M, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    const wrapped = doc.splitTextToSize(step, W - M * 2 - 10)
    wrapped.forEach((l, j) => doc.text(l, M + 8, y + j * 5))
    y += wrapped.length * 5 + 2
  })

  // Footer
  doc.setFillColor(7, 7, 10)
  doc.rect(0, 282, W, 15, 'F')
  doc.setFontSize(7)
  doc.setTextColor(100, 90, 70)
  doc.text('NEXUS Platform — nexus.app — All seam allowances 1.5cm unless stated', M, 290)
  doc.setTextColor(200, 169, 110)
  doc.text('Page 1', W - M, 290, { align: 'right' })

  doc.save(`nexus-${category}-pattern.pdf`)
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null
}
function getPieces(cat) {
  const map = {
    shirt:   [{ label:'FRONT',  w:36, h:48 }, { label:'BACK',   w:36, h:48 }, { label:'SLEEVE', w:18, h:36 }, { label:'COLLAR', w:16, h:8 }],
    dress:   [{ label:'BODICE F',w:30,h:40 }, { label:'BODICE B',w:30,h:40 }, { label:'SKIRT F', w:40,h:50 }, { label:'SKIRT B', w:40,h:50 }],
    trousers:[{ label:'FRONT', w:34, h:54 }, { label:'BACK',    w:34, h:54 }, { label:'WAISTBAND',w:50,h:8  }],
    shoes:   [{ label:'UPPER', w:36, h:28 }, { label:'LINING',  w:36, h:28 }, { label:'SOLE',    w:30, h:18 }],
    bag:     [{ label:'EXT F', w:36, h:30 }, { label:'EXT B',   w:36, h:30 }, { label:'LINING',  w:36, h:30 }, { label:'BASE',    w:36, h:12 }],
    blazer:  [{ label:'FRONT', w:32, h:52 }, { label:'BACK',    w:32, h:52 }, { label:'SLEEVE',  w:20, h:42 }, { label:'COLLAR',  w:20, h:10 }],
  }
  return map[cat] || map.shirt
}
function getSteps(cat) {
  const map = {
    shirt:   ['Cut all pieces with 1.5cm seam allowance on all sides.','Interface collar and cuffs per manufacturer instructions.','Sew shoulder seams together. Press open.','Attach collar to neckline, matching notches carefully.','Set in sleeves, easing fullness evenly around armhole.','Sew side seams and sleeve underarm seams in one pass.','Attach cuffs. Sew button placket. Hem bottom edge.','Attach buttons and sew buttonholes. Press finished shirt.'],
    dress:   ['Cut bodice, skirt, and facing pieces. Mark all notches.','Construct bodice: sew darts, attach lining if required.','Sew bodice side and shoulder seams. Press all seams.','Prepare skirt: sew centre back, leave zip opening.','Gather or pleat skirt top to match bodice waist.','Join bodice to skirt at waistline. Press toward bodice.','Insert invisible zip in back. Attach facing or waistband.','Hem skirt to desired length. Press and finish all edges.'],
    trousers:['Cut fronts, backs, waistband, and pocket pieces.','Sew pocket bags to fronts. Topstitch in place.','Join front and back crotch seams. Clip curves.','Sew inner leg seams from hem to hem. Press.','Sew outer side seams. Insert zip in left side or fly.','Attach waistband, enclosing all raw edges neatly.','Hem trouser legs to correct length. Add belt loops.','Press thoroughly. Attach button and work buttonhole.'],
    shoes:   ['Trace and cut upper, lining, and insole pieces.','Skive all edges that will be joined to reduce bulk.','Cement and stitch upper pieces. Allow adhesive to cure.','Last upper over shoe last, pulling firmly and evenly.','Attach insole to lasted upper with cement.','Roughen and cement joining surfaces of outsole.','Press outsole firmly. Stitch welt if applicable.','Finish edges, attach heel. Polish to complete.'],
    bag:     ['Cut exterior, lining, interfacing, and pocket pieces.','Fuse interfacing to all exterior pieces for structure.','Construct interior pockets. Attach to lining.','Sew exterior panels. Install hardware (rings, clasps).','Attach handles securely, reinforcing stress points.','Assemble lining, leaving a gap for turning.','Join exterior and lining at top, right sides together.','Turn through gap. Edgestitch top. Topstitch handles flat.'],
    blazer:  ['Cut all pieces: fronts, back, sleeves, collar, facings.','Interface fronts, collar, and pocket areas.','Construct welt pockets and flaps. Press carefully.','Sew shoulder seams of outer and lining separately.','Attach under-collar to neckline. Shape with steam.','Set in two-piece sleeves, easing at sleeve head.','Join outer to lining around fronts and collar. Grade seams.','Pad stitch lapel roll. Press finished blazer over tailor\'s ham.'],
  }
  return map[cat] || map.shirt
}
