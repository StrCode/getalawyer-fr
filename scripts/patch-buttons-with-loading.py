#!/usr/bin/env python3
"""Turn <Button ... :loading=...> into <ButtonBusy> (shadcn ui/button stays unmodified)."""
from __future__ import annotations

import re
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"

ANY_BTN = re.compile(r"</?Button(?:Busy)?\b[^>]*>")


def parse_vue_open_tag(content: str, start: int) -> tuple[int, bool] | None:
    """Tag starts at ``start`` with ``<Button``. Return ``(index_after_close, self_closing)``."""
    if start + 7 > len(content) or content[start : start + 7] != "<Button":
        return None
    if len(content) > start + 10 and content.startswith("<ButtonBusy", start):
        return None

    i = start + len("<Button")
    in_dq = in_sq = False
    while i < len(content):
        c = content[i]
        if in_dq:
            if c == "\\" and i + 1 < len(content):
                i += 2
                continue
            if c == '"':
                in_dq = False
            i += 1
            continue
        if in_sq:
            if c == "\\" and i + 1 < len(content):
                i += 2
                continue
            if c == "'":
                in_sq = False
            i += 1
            continue
        if c == '"':
            in_dq = True
            i += 1
            continue
        if c == "'":
            in_sq = True
            i += 1
            continue
        if c == "/" and i + 1 < len(content) and content[i + 1] == ">":
            return i + 2, True
        if c == ">":
            return i + 1, False
        i += 1
    return None


def patch(content: str) -> tuple[str, bool]:
    emit = 0
    out: list[str] = []
    changed = False
    scan = 0

    while scan < len(content):
        j = content.find("<Button", scan)
        if j == -1:
            out.append(content[emit:])
            break
        if len(content) > j + 10 and content.startswith("<ButtonBusy", j):
            scan = j + 10
            continue

        parsed = parse_vue_open_tag(content, j)
        if parsed is None:
            scan = j + 7
            continue

        end_open, self_closing = parsed
        open_slice = content[j:end_open]
        if ":loading=" not in open_slice:
            scan = j + 7
            continue

        out.append(content[emit:j])
        out.append("<ButtonBusy" + open_slice[len("<Button") :])
        changed = True

        if self_closing:
            emit = end_open
            scan = end_open
            continue

        body_start = end_open
        depth = 1
        s = body_start
        while depth > 0:
            cm = ANY_BTN.search(content, s)
            if not cm:
                raise SystemExit(f"Unclosed Button from offset {j}")
            tag = cm.group(0)
            if tag.startswith("</"):
                depth -= 1
                if depth == 0:
                    out.append(content[body_start : cm.start()])
                    out.append("</ButtonBusy>")
                    emit = cm.end()
                    scan = emit
                    break
                s = cm.end()
            else:
                depth += 1
                s = cm.end()

    return "".join(out), changed


def main() -> None:
    for path in sorted(APP.rglob("*.vue")):
        if "/ui/" in path.as_posix():
            continue
        text = path.read_text(encoding="utf-8")
        if "<Button" not in text or ":loading=" not in text:
            continue
        new_text, changed = patch(text)
        if changed and new_text != text:
            path.write_text(new_text, encoding="utf-8")
            print("patched:", path.relative_to(APP))


if __name__ == "__main__":
    main()
