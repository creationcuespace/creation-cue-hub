import qrcode

def generate_styled_qr(url, filename_prefix, dark_mode=False, with_logo=True):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H if with_logo else qrcode.constants.ERROR_CORRECT_M,
        box_size=1,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    matrix = qr.get_matrix()
    size = len(matrix)
    
    bg_color = "#0F172A" if dark_mode else "#FFFFFF"
    dot_color = "#F1B31C" if dark_mode else "#0F172A"
    eye_pupil_color = "#FFFFFF" if dark_mode else "#0F172A"
    card_border_color = "rgba(241, 179, 28, 0.3)" if dark_mode else "rgba(15, 23, 42, 0.1)"
    
    cell_size = 20
    view_size = size * cell_size
    margin = 40
    total_size = view_size + (margin * 2)
    
    def is_finder_pattern(r, c):
        if 2 <= r <= 8 and 2 <= c <= 8:
            return True
        if 2 <= r <= 8 and (size - 9) <= c <= (size - 3):
            return True
        if (size - 9) <= r <= (size - 3) and 2 <= c <= 8:
            return True
        return False
        
    center_start = (size // 2) - 3
    center_end = (size // 2) + 3
    def is_center_logo_area(r, c):
        if not with_logo:
            return False
        return center_start <= r <= center_end and center_start <= c <= center_end

    svg_parts = []
    svg_parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_size} {total_size}" width="1000" height="1000">')
    
    svg_parts.append('''
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFD700" />
          <stop offset="50%" stop-color="#F1B31C" />
          <stop offset="100%" stop-color="#D99B0C" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.15" />
        </filter>
      </defs>
    ''')
    
    svg_parts.append(f'<rect width="{total_size}" height="{total_size}" rx="36" fill="{bg_color}" stroke="{card_border_color}" stroke-width="2" />')
    
    dots_group = []
    dots_group.append(f'<g fill="{dot_color}">')
    
    for r in range(size):
        for c in range(size):
            if matrix[r][c]:
                if is_finder_pattern(r, c) or is_center_logo_area(r, c):
                    continue
                x = margin + (c * cell_size)
                y = margin + (r * cell_size)
                dots_group.append(f'  <rect x="{x+2}" y="{y+2}" width="{cell_size-4}" height="{cell_size-4}" rx="6" />')
    
    dots_group.append('</g>')
    svg_parts.append("\n".join(dots_group))
    
    def draw_finder_eye(top_row, left_col):
        x = margin + (left_col * cell_size)
        y = margin + (top_row * cell_size)
        w = 7 * cell_size
        
        eye_svg = []
        eye_svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{w}" rx="24" fill="url(#goldGrad)" />')
        inner_margin = cell_size
        inner_w = w - (2 * inner_margin)
        eye_svg.append(f'<rect x="{x + inner_margin}" y="{y + inner_margin}" width="{inner_w}" height="{inner_w}" rx="16" fill="{bg_color}" />')
        pupil_margin = cell_size * 2
        pupil_w = w - (2 * pupil_margin)
        eye_svg.append(f'<rect x="{x + pupil_margin}" y="{y + pupil_margin}" width="{pupil_w}" height="{pupil_w}" rx="10" fill="{eye_pupil_color}" />')
        return "\n".join(eye_svg)

    svg_parts.append(draw_finder_eye(2, 2))
    svg_parts.append(draw_finder_eye(2, size - 9))
    svg_parts.append(draw_finder_eye(size - 9, 2))
    
    if with_logo:
        cx = margin + (center_start * cell_size)
        cy = margin + (center_start * cell_size)
        cw = (center_end - center_start + 1) * cell_size
        center_mid_x = cx + (cw / 2)
        center_mid_y = cy + (cw / 2)
        
        logo_bg = "#0F172A" if dark_mode else "#FFFFFF"
        logo_border = "#F1B31C"
        
        svg_parts.append(f'''
          <g filter="url(#softGlow)">
            <circle cx="{center_mid_x}" cy="{center_mid_y}" r="{cw/2 + 4}" fill="{logo_bg}" stroke="{logo_border}" stroke-width="4" />
            <circle cx="{center_mid_x}" cy="{center_mid_y}" r="{cw/2 - 2}" fill="url(#goldGrad)" />
            <text x="{center_mid_x}" y="{center_mid_y + 12}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="34" fill="#0F172A" text-anchor="middle">C</text>
          </g>
        ''')
    
    svg_parts.append('</svg>')
    
    full_svg = "\n".join(svg_parts)
    out_filename = f"{filename_prefix}.svg"
    with open(out_filename, "w", encoding="utf-8") as f:
        f.write(full_svg)
    print(f"Generated {out_filename}")

generate_styled_qr("https://creationcue.web.app/go", "qrcode_go_light", dark_mode=False, with_logo=True)
generate_styled_qr("https://creationcue.web.app/go", "qrcode_go_dark", dark_mode=True, with_logo=True)
generate_styled_qr("https://creationcue.web.app/go", "qrcode_go_classic", dark_mode=False, with_logo=False)
