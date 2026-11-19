"""Static server for the AS hero previews that never lets the browser cache.

python -m http.server sends no cache headers, so a browser reuses an old preview.html and edits
look like they did nothing. This sends Cache-Control: no-store.

python3 scripts/as-hero/serve_nocache.py <port> <directory>
"""

import functools
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1])
    directory = sys.argv[2]
    handler = functools.partial(NoCacheHandler, directory=directory)
    http.server.ThreadingHTTPServer(("", port), handler).serve_forever()
