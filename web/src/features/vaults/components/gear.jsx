function Gear({ teeth = 8, r = 38, stroke = "#0a6aa8", strokeWidth = 2 }) {
  const ri = r * 0.72;
  const toothH = r * 0.22;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a1 = (i / teeth) * Math.PI * 2 + 0.12;
    const a2 = (i / teeth) * Math.PI * 2 + Math.PI / teeth - 0.12;
    const a3 = (i / teeth) * Math.PI * 2 + Math.PI / teeth + 0.12;
    const a4 = ((i + 1) / teeth) * Math.PI * 2 - 0.12;
    const c = Math.cos, s = Math.sin;
    if (!i) d += `M ${ri * c(a1)} ${ri * s(a1)} `;
    d += `L ${(r + toothH) * c(a1)} ${(r + toothH) * s(a1)} `;
    d += `L ${(r + toothH) * c(a2)} ${(r + toothH) * s(a2)} `;
    d += `L ${ri * c(a3)} ${ri * s(a3)} `;
    d += `L ${ri * c(a4)} ${ri * s(a4)} `;
  }
  d += "Z";
  const cx = r + toothH + 4;
  return (
    <svg viewBox={`${-cx} ${-cx} ${cx * 2} ${cx * 2}`} xmlns="http://www.w3.org/2000/svg">
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" />
      <circle cx="0" cy="0" r={ri * 0.35} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    </svg>
  );
}

export default Gear;