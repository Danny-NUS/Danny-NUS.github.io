#!/usr/bin/env python3
"""Render publications.json into index.html; no third-party packages required.

Run from any directory:
    python3 scripts/render_publications.py
    python3 scripts/render_publications.py --output /tmp/danny-publications.html

The --output form writes only the publication fragment and leaves index.html alone.
"""

import argparse
from collections import OrderedDict
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent.parent
START = "<!-- PUBLICATIONS:START -->"
END = "<!-- PUBLICATIONS:END -->"


class AuthorMarkup(HTMLParser):
    """Keep author emphasis while treating all text as untrusted HTML."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.markup = []
        self.text = []
        self.bold_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag == "b":
            self.markup.append("<b>")
            self.bold_depth += 1

    def handle_endtag(self, tag):
        if tag == "b" and self.bold_depth:
            self.markup.append("</b>")
            self.bold_depth -= 1

    def handle_data(self, data):
        self.markup.append(html.escape(data))
        self.text.append(data)

    def result(self):
        self.close()
        return (
            "".join(self.markup) + "</b>" * self.bold_depth,
            "".join(self.text),
        )


def authors(value):
    parser = AuthorMarkup()
    parser.feed(value)
    return parser.result()


def escape(value):
    return html.escape(str(value), quote=True)


def slug(value):
    result = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if not result:
        raise ValueError("Publication IDs must contain letters or numbers.")
    return result


def url(value):
    parsed = urlsplit(value)
    if parsed.scheme not in {"https", "http"} or not parsed.netloc:
        raise ValueError("Publication links must be absolute HTTP(S) URLs: " + value)
    return escape(value)


def render_paper(paper, paper_id):
    title = paper["title"]
    author_html, author_text = authors(paper["authors"])
    categories = paper["category"]
    if isinstance(categories, str):
        categories = [categories]
    category_text = " ".join(categories)
    links = paper.get("links", {})
    paper_url = links.get("pdf") or links.get("arxiv")
    search_text = " ".join([
        title, author_text, paper["conference"], str(paper["year"]),
        category_text, paper.get("summary", ""), paper_id, " ".join(links.values()),
        " ".join({"speech": "voice speech singing", "music": "music audio", "human": "human motion animation", "affective": "affective emotion"}.get(category, category) for category in categories),
    ])
    output = [
        f'    <article class="publication" id="{escape(paper_id)}" '
        f'data-categories="{escape(category_text)}" data-search="{escape(search_text)}">',
        '      <div class="paper-meta">',
        f'        <small class="paper-venue">{escape(paper["venue"])}</small>',
    ]
    if paper.get("new"):
        output.append('        <small class="paper-new">New</small>')
    output.append("      </div>")
    heading = escape(title)
    if paper_url:
        heading = f'<a href="{url(paper_url)}">{heading}</a>'
    output.extend([
        f'      <h4 class="paper-title">{heading}</h4>',
        f'      <p class="paper-authors">{author_html}</p>',
        f'      <p class="paper-conference">{escape(paper["conference"])}</p>',
        '      <div class="paper-links">',
    ])
    for label, target in [
        ("Paper", paper_url), ("Demo", links.get("page")),
        ("Code", links.get("code")), ("Data", links.get("data")),
    ]:
        if target:
            output.append(f'        <a href="{url(target)}" data-kind="{label.lower()}">{label}</a>')
    if paper.get("summary"):
        output.extend([
            '        <details class="abstract">',
            '          <summary>Overview</summary>',
            f'          <p class="abstract-text">{escape(paper["summary"])}</p>',
            '        </details>',
        ])
    if paper.get("bibtex"):
        output.extend([
            '        <details class="citation">',
            '          <summary>Cite</summary>',
            '          <div class="citation-panel">',
            f'            <pre><code>{escape(paper["bibtex"])}</code></pre>',
            '            <button class="copy-citation js-control" type="button" hidden '
            f'aria-label="Copy BibTeX citation for {escape(title)}">Copy BibTeX</button>',
            '          </div>',
            '        </details>',
        ])
    output.extend(['      </div>', '    </article>'])
    return "\n".join(output)


def render(papers):
    groups = OrderedDict()
    ids = set()
    for paper in sorted(papers, key=lambda item: int(item["year"]), reverse=True):
        paper_id = slug(paper.get("id") or paper["title"])
        if paper_id in ids:
            raise ValueError("Duplicate publication ID: " + paper_id)
        ids.add(paper_id)
        groups.setdefault(str(paper["year"]), []).append((paper, paper_id))

    output = []
    for year, entries in groups.items():
        output.extend([
            f'<section class="year-group" data-year="{escape(year)}" '
            f'aria-label="Publications from {escape(year)}">',
            '  <div class="year-heading">',
            f'    <h3>{escape(year)}</h3>',
            '  </div>',
            '  <div class="year-papers">',
        ])
        output.extend(render_paper(paper, paper_id) for paper, paper_id in entries)
        output.extend(['  </div>', '</section>'])
    return "\n".join(output) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output", type=Path, metavar="PATH",
        help="write only the HTML fragment to PATH, without changing index.html",
    )
    args = parser.parse_args()
    try:
        papers = json.loads((ROOT / "assets" / "publications.json").read_text(encoding="utf-8"))
        fragment = render(papers)
        if args.output:
            args.output.write_text(fragment, encoding="utf-8")
            destination = args.output
        else:
            destination = ROOT / "index.html"
            source = destination.read_text(encoding="utf-8")
            if source.count(START) != 1 or source.count(END) != 1:
                raise ValueError("index.html must contain exactly one pair of publication markers.")
            before, tail = source.split(START, 1)
            _, after = tail.split(END, 1)
            destination.write_text(before + START + "\n" + fragment + END + after, encoding="utf-8")
        print(f"Rendered {len(papers)} publications into {destination}")
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f"Publication render failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
