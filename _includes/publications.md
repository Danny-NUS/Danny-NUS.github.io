<h2 id="publications" style="margin: 2px 0px -5px;">Publications</h2>

<div class="publications">

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

  <ol class="bibliography pub-category-list">

{% for link in site.data.publications.main %}
{% if link.category == cat_key %}

    <li>
    <div class="pub-row compact-pub-row">
      <div class="col-sm-3 abbr pub-img-col">
        {% if link.image %}
        <img src="{{ link.image }}" class="teaser img-fluid z-depth-1 pub-teaser">
        {% endif %}
        {% if link.conference_short %}
        <abbr class="badge">{{ link.conference_short }}</abbr>
        {% endif %}
      </div>

      <div class="col-sm-9 pub-text-col">
        <div class="title"><a href="{{ link.pdf }}">{{ link.title }}</a></div>
        <div class="author">{{ link.authors }}</div>
        <div class="periodical"><em>{{ link.conference }}</em></div>

        <div class="links">
          {% if link.pdf %}
          <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" target="_blank">PDF</a>
          {% endif %}
          {% if link.code %}
          <a href="{{ link.code }}" class="btn btn-sm z-depth-0" role="button" target="_blank">Code</a>
          {% endif %}
          {% if link.page %}
          <a href="{{ link.page }}" class="btn btn-sm z-depth-0" role="button" target="_blank">Project Page</a>
          {% endif %}
          {% if link.bibtex %}
          <a href="{{ link.bibtex }}" class="btn btn-sm z-depth-0" role="button" target="_blank">BibTex</a>
          {% endif %}
          {% if link.notes %}
          <strong><i style="color:#e74d3c">{{ link.notes }}</i></strong>
          {% endif %}
          {% if link.others %}
          {{ link.others }}
          {% endif %}
        </div>
      </div>
    </div>
    </li>

    {% endif %}

{% endfor %}

  </ol>

{% endfor %}

</div>
