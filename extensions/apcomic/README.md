Extension scaffold for allporncomic.com

Notes:
- Implemented selectors using heuristics observed on https://allporncomic.com.
- Key selectors used:
	- Listing items: `.page-item-detail`, `h3 a` for title links
	- Detail title: `h1`
	- Cover: `div.summary_image img`, `img.img-responsive.entered`
	- Genres: `a[href*='/porncomic-cat/']`
	- Chapters: `.listing-chapters_wrap a`, `ul li a` (fallback)
- Next step: run `vbook debug` / `vbook test-all` against your VBook device to validate outputs.

How to debug locally:
1. Ensure VBook app is running and reachable at `http://<IP>:8080`.
2. From repo root run:
```bash
node vbook-tool/index.js debug "d:/.../extensions/allporncomic/src/detail.js" -i <IP> -p 8080 --json
```

If device is not available, you can still run selector discovery with the built-in `analyze` command using a template context:
```bash
node vbook-tool/index.js analyze https://allporncomic.com/home-3/ --json
```
