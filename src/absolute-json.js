(function(root, $) {
  const abjson = Object.create(null, {});

    // defaults
    
const options = {
      source: null,
      sourceUrl: "",
      localeObject: {},
      customJsonParser: null
    };

  function AbjError(name, message) {
    this.name = name;
    this.message = message || "error";
  }

  AbjError.prototype = new Error();
  AbjError.prototype.constructor = AbjError;

  function forEach(obj, iterator, context) {
    let i; let key;
    if (obj === null) {
      return;
    }
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === {}) {
          return;
        }
      }
    } else {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (iterator.call(context, obj[key], key, obj) === {}) {
            return;
          }
        }
      }
    }
  }

  function getPropertyByString(obj, str) {
    let n;

      
const a = str.split(".");
    while (a.length) {
      n = a.shift();
      if (n in obj) {
        obj = obj[n];
      } else {
        return;
      }
    }
    return obj;
  }

  function load(opt, callback) {
    options.source = opt.source;
    options.sourceUrl = opt.sourceUrl;

    loadSource(callback);
  }

  function loadSource(callback) {
    if (options.source) {
      options.localeObject = options.source;
      callback();
      return;
    }

    $.ajax({
      url: options.sourceUrl,
      type: "get",
      dataType: "json",
      cache: false,
      success(data) {
        options.localeObject = data;
        callback();
      },
      error(xhr, textStatus) {
        callback(new AbjError(textStatus.toUpperCase(), xhr.statusText));
      }
    });
  }

  function get(key, replacements) {
    return options.localeObject[key]
      ? wildcardReplace(options.localeObject[key], replacements || [])
      : undefined;
  }

  function updateElements(el, opt) {
    const elKey = el.attr("data-abjson");

      
const updateElementsdText = get(elKey);

    if (typeof updateElementsdText !== "undefined") {
      if (updateElementsdText === Object(updateElementsdText)) {
        forEach(updateElementsdText, (val, key) => {
          if (key === "text") {
            if (el.attr("data-abjson-r")) {
              el.html(
                wildcardReplace(
                  updateElementsdText,
                  el.attr("data-abjson-r").split("|")
                )
              );
            } else {
              el.html(val);
            }
          } else {
            el.attr(key, val);
          }
        });
      } else if (el.attr("data-abjson-r")) {
          el.html(
            wildcardReplace(
              updateElementsdText,
              el.attr("data-abjson-r").split("|")
            )
          );
        } else {
          el.html(updateElementsdText);
        }
    } else {
      el.html(`${elKey  } NOT FOUND`);
    }
  }

  function wildcardReplace(text, replaceElements) {
    let i;

      
let replacedText = text;

    for (i = 0; i < replaceElements.length; i++) {
      if (typeof replaceElements[i].replace === "function") {
        replaceElements[i] = replaceElements[i].replace(/%{(.+?)}/g, (
          $0,
          $1
        ) => get($1));
      }
      replacedText = replacedText.replace(
        new RegExp(`%${  i + 1}`, "ig"),
        replaceElements[i]
      );
    }

    return replacedText;
  }

  if (!root.abjson) {
    $.fn.abjson = function(options) {
      const elements = $("[data-abjson]", this);

      elements.each(function() {
        updateElements($(this), options);
      });
    };

    root.abjson = root.abjson || abjson;
  }

  // public interface
  abjson.load = load;
  abjson.options = options;
  abjson.get = get;

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = abjson;
  } else {
    window.abjson = abjson;
  }
})(window, jQuery);
