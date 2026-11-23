import {
  FIELD_HEIGHT as H, FIELD_WIDTH as W, cavityPoint, markStrength, surfaceY,
  type TissueCell, type TissueChannel, type TissueField,
} from "../core/tissue.js";

export interface FieldView { x: number; y: number; width: number; height: number }

export function fieldView(zoom: boolean, focus?: TissueCell): FieldView {
  const scale = zoom ? 2 : 1;
  const width = W / scale, height = H / scale;
  return {
    width, height, x: Math.max(0, Math.min(W - width, (focus?.x ?? W / 2) - width / 2)),
    y: Math.max(0, Math.min(H - height, (focus?.y ?? H / 2) - height / 2)),
  };
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, angle: number, fill: string) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, angle, 0, 2 * Math.PI); ctx.fillStyle = fill; ctx.fill();
}

function tissueBackground(ctx: CanvasRenderingContext2D, field: TissueField) {
  ctx.fillStyle = field.cancer === "liver" ? "#ecbbba" : "#e7b7cb";
  ctx.fillRect(0, 0, W, H);
  // A fixed fibrillar texture introduces orientation without moving the specimen between frames.
  for (let i = 0; i < 105; i++) {
    const x = ((i * 109) % 390) - 60, y = (i * 53) % H;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 20, y + 12 * Math.sin(i), x + 52, y - 8, x + 86, y + 4 * Math.cos(i));
    ctx.strokeStyle = i % 2 ? "#b86c9b36" : "#fff1f34d"; ctx.lineWidth = 1.5 + i % 3; ctx.stroke();
  }
  if (field.cancer === "melanoma" || field.cancer === "oral") {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0);
    for (let x = W; x >= 0; x -= 2) ctx.lineTo(x, surfaceY(field.cancer, x) + 4);
    ctx.closePath(); ctx.fillStyle = field.cancer === "oral" ? "#eeaec2" : "#d9abc7"; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0);
    for (let x = W; x >= 0; x -= 2) ctx.lineTo(x, surfaceY(field.cancer, x) - (field.cancer === "oral" ? 100 : 84));
    ctx.closePath(); ctx.fillStyle = "#fff1ef"; ctx.fill();
  }
  for (const cavity of field.cavities) {
    ctx.beginPath();
    for (let i = 0; i <= 55; i++) {
      const pt = cavityPoint(cavity, i / 55 * Math.PI * 2);
      if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle = field.cancer === "liver" ? "#e499a2" : "#fff3f1"; ctx.fill();
    ctx.lineWidth = cavity.kind === "fat" ? 1.2 : 2;
    ctx.strokeStyle = cavity.kind === "fat" ? "#d99caf" : "#b67aab"; ctx.stroke();
    if (field.cancer === "prostate" && cavity.x % 3 < 1) {
      ellipse(ctx, cavity.x, cavity.y, cavity.rx * .28, cavity.ry * .25, cavity.angle, "#d78e98");
      ellipse(ctx, cavity.x, cavity.y, cavity.rx * .17, cavity.ry * .13, cavity.angle, "#f2bdc1");
    }
  }
}

function drawCell(ctx: CanvasRenderingContext2D, cell: TissueCell) {
  const { x, y, rx, ry, angle, tone, role } = cell;
  if (role === "support") {
    ellipse(ctx, x, y, rx * 1.15, ry, angle, "#975b99");
    return;
  }
  const clone = role === "clone";
  ellipse(ctx, x, y, rx, ry, angle, clone ? "#a36eaa" : tone > .5 ? "#d29bc0" : "#deabc6");
  ctx.lineWidth = .45; ctx.strokeStyle = clone ? "#8b547e" : "#aa7ba0"; ctx.stroke();
  ellipse(ctx, x + rx * .07, y - ry * .05, rx * (clone ? .67 : .48), ry * (clone ? .67 : .52), angle, clone ? "#502954" : tone > .6 ? "#794273" : "#955785");
  if (tone > .25 || clone) ellipse(ctx, x + .65, y - .48, .52, .45, 0, clone ? "#efbad7" : "#c78ab5");
  if (role === "pigment") {
    ctx.strokeStyle = "#795e45"; ctx.lineWidth = .8;
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + tone; ctx.beginPath(); ctx.moveTo(x + 2 * Math.cos(a), y + 2 * Math.sin(a));
      ctx.lineTo(x + 7 * Math.cos(a), y + 7 * Math.sin(a)); ctx.stroke();
    }
  }
}

function drawMark(ctx: CanvasRenderingContext2D, cell: TissueCell, channel: TissueChannel, strength: number, selected: boolean) {
  const { x, y, rx, ry } = cell;
  ctx.globalAlpha = strength * (selected ? .95 : .8);
  ctx.strokeStyle = channel.color; ctx.fillStyle = channel.color; ctx.lineWidth = selected ? 1.4 : 1.05;
  ctx.beginPath();
  switch (channel.symbol) {
    case "ring":
      ctx.ellipse(x, y, Math.max(2.4, rx * .85), Math.max(1.7, ry * .83), cell.angle, 0, Math.PI * 2); ctx.stroke(); break;
    case "arc":
      ctx.arc(x, y, Math.max(3, (rx + ry) * .54), .75 * Math.PI, 1.72 * Math.PI); ctx.stroke(); break;
    case "dots":
      ctx.arc(x + rx * .54, y + .6, 1.35, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + rx * .38, y + 2.6, .9, 0, Math.PI * 2); ctx.fill(); break;
    case "bar":
      ctx.moveTo(x - 1.3, y + ry * .62); ctx.lineTo(x + 2.5, y + ry * .36); ctx.stroke(); break;
    case "diamond":
      ctx.moveTo(x - 1.5, y - 1.4); ctx.lineTo(x + .7, y - 3.6);
      ctx.lineTo(x + 2.9, y - 1.4); ctx.lineTo(x + .7, y + .8); ctx.closePath(); ctx.stroke(); break;
  }
  ctx.globalAlpha = 1;
}

export function paintField(ctx: CanvasRenderingContext2D, field: TissueField, cells: readonly TissueCell[], channels: readonly TissueChannel[],
  view: FieldView, selectedFactor: string | undefined, selectedCell: TissueCell | undefined, inheritedFinding = false) {
  const canvas = ctx.canvas;
  ctx.setTransform(canvas.width / view.width, 0, 0, canvas.height / view.height,
    -view.x * canvas.width / view.width, -view.y * canvas.height / view.height);
  tissueBackground(ctx, field);
  for (const cell of cells) drawCell(ctx, cell);
  for (const channel of channels) for (const cell of cells) {
    if (cell.role === "support") continue;
    const strength = markStrength(cell, channel);
    if (strength > .025) drawMark(ctx, cell, channel, strength, selectedFactor === channel.factor);
  }
  if (selectedCell) {
    const { x, y, rx, ry } = selectedCell;
    const radius = Math.max(rx, ry) + 3.5;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 2.8; ctx.strokeStyle = "#fff8ec"; ctx.stroke(); ctx.lineWidth = 1.1; ctx.strokeStyle = "#263e36"; ctx.stroke();
  }
  if (inheritedFinding) {
    // Select a visible nucleus from the common background, independently of exposure and clone state.
    const targetX = view.x + .23 * view.width, targetY = view.y + .5 * view.height;
    let nucleus: TissueCell | undefined;
    let distance = Infinity;
    for (const cell of field.cells) {
      if (cell.role === "support") continue;
      const d = Math.hypot(cell.x - targetX, cell.y - targetY);
      if (d < distance) { distance = d; nucleus = cell; }
    }
    if (nucleus) {
      // Draw the leader and its text in screen-relative units at both zoom settings.
      ctx.save(); ctx.translate(nucleus.x, nucleus.y); ctx.scale(view.width / W, view.height / H);
      ctx.beginPath(); ctx.rect(-4.4, -4.4, 8.8, 8.8); ctx.moveTo(4.4,-4.4); ctx.lineTo(16,-17); ctx.lineTo(23,-17);
      ctx.strokeStyle = "#fff8ed"; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = "#244a3c"; ctx.lineWidth = 1.35; ctx.stroke();
      ctx.fillStyle = "#244a3c"; ctx.fillRect(22,-23.7,38,13.4);
      ctx.font = "bold 8.7px Arial, sans-serif"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fffaf0"; ctx.fillText("Nucleus", 25, -16.4);
      ctx.restore();
    }
  }
}
