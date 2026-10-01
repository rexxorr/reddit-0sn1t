# OSNIT / Reddit Intelligence Search

A focused open-source intelligence interface for exploring publicly available Reddit posts and comments by username.

> Educational project. It does not require Reddit login credentials and should be used responsibly, lawfully, and with respect for privacy.

## Overview

OSNIT searches archived Reddit activity from public archive services and presents the results in a fast, readable workspace. It combines post and comment records, identifies their source, and provides filters for community, date range, sort order, result type, and NSFW visibility.

## Features

- Username-based Reddit archive search
- Combined posts and comments view
- Separate Posts and Comments tabs
- Arctic Shift and PullPush archive sources
- Independent source requests so one unavailable API does not hide all results
- Duplicate removal by Reddit record ID
- Community filter by subreddit
- Before and after date filters
- Newest, oldest, and engagement sorting
- Optional NSFW record visibility, disabled by default
- Local demo fallback when archive services are unavailable
- Client-side request rate limiter and stale-request cancellation
- Responsive interface for desktop and mobile
- Animated archive status indicator with reduced-motion support
- Direct links to Reddit threads and user profiles

## Tech Stack

| Area | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 with custom properties and responsive media queries |
| Logic | Vanilla JavaScript |
| Archive APIs | Arctic Shift and PullPush |
| Hosting | GitHub Pages or any static web host |
| Authentication | None required |

## Project Structure

```text
.
├── index.html          # Entry redirect to the main interface
├── osnitreddit.html    # Application markup
├── r1dit.css           # Layout, theme, responsive styles, and animation
├── api.js              # Archive endpoints, request limiting, and data normalization
├── reddit.js            # Search state, filters, tabs, and result rendering
└── README.md           # Project documentation
```

## Run Locally

No build step or package installation is required.

1. Download or clone the repository.
2. Open `index.html` in a browser.
3. Search for a Reddit username, or use one of the example usernames.

For a local static server, any simple HTTP server can be used. For example:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Archive Sources

OSNIT uses public archive APIs inspired by the reference RedditOsint project:

- [Arctic Shift](https://github.com/ArthurHeitmann/arctic_shift) for archived posts and comments
- [PullPush](https://pullpush.io/) for archived submissions and comments

The application does not use private API keys. Availability and coverage depend on the archive services.

## Request Handling

The browser queries the archive sources independently and merges their responses. To keep the interface responsive and avoid unnecessary API load, the client:

- Spaces search batches by 1.2 seconds
- Cancels the previous search when a new username is submitted
- Ignores stale responses from older searches
- Deduplicates records returned by multiple sources
- Falls back to local demo records when public archives are unavailable

## NSFW Content

NSFW records are hidden by default. The `INCLUDE NSFW POSTS` control allows the user to reveal records marked as NSFW by the archive response. This setting only changes client-side display filtering.

## Limitations

- Archive services may be rate-limited, offline, or incomplete.
- Archived data may not represent a complete Reddit history.
- Deleted or removed content may be missing or only partially captured.
- Results are limited by the public archive APIs and their retention policies.
- The app is a static client and does not provide authentication or private account access.

## Responsible Use

Use this project for education, research, and legitimate investigations. Do not use it to harass, threaten, impersonate, expose private information, or circumvent access controls. Respect platform rules, applicable laws, and removal requests.

## Credits

- Project workflow inspired by [RedditOsint / Rosint](https://github.com/zuxu4n/RedditOsint)
- Archive data from [Arctic Shift](https://github.com/ArthurHeitmann/arctic_shift) and [PullPush](https://pullpush.io/)

## License

This project is intended as an educational open-source interface. Add a license file before redistributing it as a packaged project.
