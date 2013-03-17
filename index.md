---
layout: page
title: Welcome
---
{% include JB/setup %}

At present everything is as default as possible, except for the comments.  I removed those.

    
## Posts

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>
