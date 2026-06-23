<h2 id="publications" style="margin: 2px 0px -15px;">Publications</h2>

<div class="publications">
<ol class="bibliography">

{% assign categories =
"speech|Speech & Singing Voice Synthesis,
music_audio|Music & Audio Generation,
human_animation|Speech-Driven Human Animation,
affective|Affective Speech & Multimodal Learning" | split: "," %}

{% for cat in categories %}
{% assign pair = cat | split: "|" %}
{% assign cat_key = pair[0] | strip %}
{% assign cat_name = pair[1] | strip %}

<div class="pub-category">
  {{ forloop.index }}. {{ cat_name }}
</div>

{% for link in site.data.publications.main %}
{% if link.category == cat_key %}

<li>
<div class="pub-row">
  <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
    {% if link.image %} 
    <img src="{{ link.image }}" class="teaser img-fluid z-depth-1" style="width=100;height=40%">
    {% endif %}
    {% if link.conference_short %} 
    <abbr class="badge">{{ link.conference_short }}</abbr>
    {% endif %}
  </div>

  <div class="col-sm-9" style="position: relative;padding-right: 15px;padding-left: 20px;">
    <div class="title"><a href="{{ link.pdf }}">{{ link.title }}</a></div>
    <div class="author">{{ link.authors }}</div>
    <div class="periodical"><em>{{ link.conference }}</em></div>

    <div class="links">
      {% if link.pdf %}
      <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">PDF</a>
      {% endif %}

      {% if link.code %}
      <a href="{{ link.code }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Code</a>
      {% endif %}

      {% if link.data %}
      <a href="{{ link.data }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Data</a>
      {% endif %}

      {% if link.page %}
      <a href="{{ link.page }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Project Page</a>
      {% endif %}

      {% if link.bibtex %}
      <textarea class="bibtex-content" style="display:none;">{{ link.bibtex }}</textarea>
      <a href="#" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;" onclick="copyBibtex(this); return false;">BibTeX</a>
      {% endif %}

      {% if link.notes %}
      <strong> <i style="color:#e74d3c">{{ link.notes }}</i></strong>
      {% endif %}

      {% if link.others %}
      {{ link.others }}
      {% endif %}
    </div>

  </div>
</div>
</li>

<br>

{% endif %}
{% endfor %}

{% endfor %}

</ol>
</div>

<script>
function copyBibtex(el) {
  const bib = el.parentElement.querySelector(".bibtex-content").value;
  navigator.clipboard.writeText(bib).then(function() {
    const oldText = el.innerText;
    el.innerText = "Copied!";
    setTimeout(function() {
      el.innerText = oldText;
    }, 1200);
  });
}
</script>
