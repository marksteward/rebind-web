var Rebind = (function() {
    rebind = {};
    rebind.domain = 'rebind.rack.ms';

    function removeEnding(str, ending) {
        var i = str.indexOf(ending);
        if (i < 0 || i != (str.length - ending.length)) throw 'Ending not matched';
        return str.slice(0, i);
    }
    function splitLast(str, sep) {
        var i = str.lastIndexOf(sep);
        if (i == -1) return str;
        return str.slice(i + sep.length);
    }

    try {
        rebind.hostname = document.location.hostname;
        rebind.subdomain = removeEnding(rebind.hostname, '.' + rebind.domain);
        rebind.client = splitLast(rebind.subdomain, '.');
        if (rebind.client == rebind.subdomain) {
            rebind.target = '';
        } else {
            rebind.target = removeEnding(rebind.subdomain, '.' + rebind.client);
        }
        rebind.base = rebind.client + '.' + rebind.domain;
    } catch(e) {
        throw 'Invalid hostname';
    }

    rebind.hosts = {};
    rebind.host = function(host) {
        if (rebind.hosts[host] === undefined) {

            var wnd = null;
            var fetchers = [];
            var iframe = document.createElement('iframe');
            iframe.src = 'http://' + host + '.' + Rebind.base + '/iframe';
            document.body.appendChild(iframe);

            rebind.hosts[host] = new Promise(function(resolve, reject) {
                window.addEventListener('message', function(e) {
                    if (e.data.target === undefined) return;
                    if (e.data.target != host) return;
                    if (e.data.status == 'loaded') {
                        wnd = iframe.contentWindow;
                    } else if (e.data.status == 'rebound') {
                        resolve(fetchRebound);
                    } else if (e.data.status == 'fetched') {
                        fetchers[e.data.id].resolve(e.data.result);
                    } else if (e.data.status == 'error') {
                        fetchers[e.data.id].reject(e.data.error);
                    }
                });

                function fetchRebound(url) {
                    return new Promise(function(resolve, reject) {
                        var id = fetchers.length;
                        fetchers[id] = { resolve: resolve, reject: reject };
                        wnd.postMessage({ id: id, url: url.href }, '*');
                    });
                };
            });
        }
        return rebind.hosts[host];
    };

    rebind.fetch = function(url) {
        var url = new URL(url);

        return rebind.host(url.host).then(function(fetchRebound) {
            return fetchRebound(url);
        });
    };

    return rebind;
})();
document.domain = Rebind.base;

