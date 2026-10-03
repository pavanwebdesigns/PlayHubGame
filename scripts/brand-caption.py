"""Draw one Anek Latin 500 line as an SVG. The site build does not run this."""

import sys

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont


def main() -> None:
    font_path, text, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    blob = hb.Blob.from_file_path(font_path)
    face = hb.Face(blob)
    font = hb.Font(face)
    buffer = hb.Buffer()
    buffer.add_str(text)
    buffer.guess_segment_properties()
    hb.shape(font, buffer)

    tt = TTFont(font_path)
    order = tt.getGlyphOrder()
    glyphs = tt.getGlyphSet()
    ascent = tt['hhea'].ascent
    descent = tt['hhea'].descent
    x = 0
    paths: list[str] = []
    for info, pos in zip(buffer.glyph_infos, buffer.glyph_positions):
        name = order[info.codepoint]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        commands = pen.getCommands()
        if commands:
            paths.append(
                f'<path transform="translate({x + pos.x_offset},{pos.y_offset})" d="{commands}"/>'
            )
        x += pos.x_advance
    height = ascent - descent
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {-ascent} {x} {height}">'
        f'<g transform="scale(1,-1)" fill="#B4AADB">{"".join(paths)}</g>'
        '</svg>'
    )
    with open(out_path, 'w', encoding='utf-8') as handle:
        handle.write(svg)


if __name__ == '__main__':
    main()
