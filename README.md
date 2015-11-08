# AsyncLink.jQuery.js

`AsyncLink` will transform your classic web site into a modern AJAX driven single page. It is jQuery plugin that replaces all needed links and forms with AJAX handlers.

Current version **1.0.0** (2015-11-08).

* [asynclink.jquery.js](asynclink.jquery.js) (6.9 kB)
* [asynclink.jquery.min.js](asynclink.jquery.min.js) (2.8 kB, gzipped 1.2 kB)
* Fork at [Github](https://github.com/makryl/jquery-asynclink)

## Features

- AJAX links.
- AJAX forms.
- Changes history state if browser supports it.
- Navigates by history.
- Custom links and targets.
- Forms with file uploads works also.

<!-- Example -->

## Usage

### Basic

Add jQuery and AsyncLink scripts at your page.

    <script src="jquery.js"></script>
    <script src="asynclink.jquery.js"></script>

Call plugin on root element. Inside this element plugin will search links and forms, and by default replace root element's contents with AJAX responses.

    $('body').asynclink();

Server should response to AJAX request with content part of page only. To let server know that it is AJAX request you should mark your request somehow. For example, for link to `/foo.html` you can:

- Add parameter to URL: `/foo.html?async=1`.
- Add prefix to URL: `/async/foo.html`.
- Add header to request: `Async: true`, in this case no need to change link.
- Fully replace URL: `/bar.html`.

### Replacing URL

To replace URL using some simple rule, you can use `replaceUrlCallback` option:

    // add parameter to URL
    $('body').asynclink({
        replaceUrlCallback: function(url) {
            return url + (url.indexOf('?') == -1 ? '?' : '&') + 'async=1';
        }
    });
    
    // or add prefix to URL
    $('body').asynclink({
        replaceUrlCallback: function(url) {
            return '/async' + url; // will work if your urls starts with "/"
        }
    });

### Adding custom header

To add custom header you can use `ajaxSettings` option. These AJAX settings are the same as in [`jQuery.ajax`](http://api.jquery.com/jquery.ajax/) function, and you can change any of these settings.

    // add custom header
    $('body').asynclink({
        ajaxSettings: {
            headers: {
                'Async': 'true'
            }
        }
    });

### Custom link attribute

To fully replace URL, you can use `al-href` attribute for links or `al-action` for forms. The flaw of this method is that you should change your html source code.

    <a href="/foo.html" al-href="/bar.html">foo</a>

### Targets

If your root element differs from main content block, which should change by AJAX requests, use `target` option - it is jQuery selector to needed element.

    <html>
        <body>
            <a href="/foo.html">foo</a>
            <a href="/bar.html">bar</a>
            
            <div class="main">
                contents
            </div>
            
            <script src="jquery.js"></script>
            <script src="asynclink.jquery.js"></script>
            <script>
                // find links in "body" element,
                // but load AJAX request to element with css class "main"
                $('body').asynclink({
                    target: '.main'
                });
            </script>
        </body>
    </html>
    
Also, you can specify target in link or form element using `al-target` attribute:

    <a href="/foo.html" al-target=".custom">foo</a>

### History change ignoring

History state will not change in next cases:

- Forms with `POST` method.
- If URL starts with `#`, and you use custom attribute.

        <a href="#foo" al-href="/foo.html">foo</a>

### File uploads

Forms with file uploads will work with `enctype="multipart/form-data"`, if browser supports `FormData`.

### Complete and error handlers

Use `ajaxSettings` as in [`jQuery.ajax`](http://api.jquery.com/jquery.ajax/). There are `success`, `error` and `complete` options.

    $('body').asynclink({
        ajaxSettings: {
            success: function(data, textStatus, jqXHR) {
                var m = data.match(/<meta name="title" content="([^"]*)">/);
                if (m && m[1]) {
                    document.title = m[1];
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(textStatus);
            }
        }
    });

### Options

- `id` - if you want multiple plugin instances with different options, set different identifiers for properly navigation by history, to let history know which instance options should be used. Default: index number, starting from `0`.
- `selectorLinks` - selector of links that should work in AJAX mode. Default: `a[href^="/"],*[al-href^="/"]`, it means links with `href` attribute or any element with `al-href` attribute starting with `/`.
- `selectorForms` - selector of forms that should work in AJAX mode. Default: `form[action^="/"],form[al-action^="/"],form:not([action])`, it means forms with `action` or `al-action` attribute starting with `/` or forms without `action` attribute.
- `state` - initial history state object with two parameters `url` and `target`. By default `url` sets to current location processed by `replaceUrlCallback`, and `target` sets to plugin's `target` option.
- `target` - selector of target element for AJAX requests. By default equals to root plugin's selector.
- `ajaxSettings` - additional settings for AJAX requests, same as: [`jQuery.ajax`](http://api.jquery.com/jquery.ajax/).
- `replaceUrlCallback` - function used to transform URL of links or forms for AJAX requests.
- `attrTarget` - custom `target` attribute. Default: `al-target`.
- `attrHref` - custom link's `href` attribute. Default: `al-href`.
- `attrAction` - custom form's `action` attribute. Default: `al-action`.

### Static methods

- `$.asynclink.rebind(id = 0)` - using this method you can manually rebind links and forms handlers, if you made any external changes in root plugin's element.
- `$.asynclink.unbind(id = 0)` - removes all handlers of specified plugin instance.
- `$.asynclink.rebindAll()` - rebinds all handlers of all plugin instances.
- `$.asynclink.unbindAll()` - remove all handlers of all plugin instances.

## MIT License

Copyright (c) 2015 Maksim Krylosov <aequiternus@gmail.com>
