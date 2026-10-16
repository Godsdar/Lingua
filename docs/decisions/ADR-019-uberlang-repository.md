# ADR-019: Rename the GitHub repository to Uberlang

## Status
Accepted 2026-10-16 at the owner's explicit request. Supersedes ADR-018's
retention of the old repository name only.

## Decision
Rename Godsdar/Lingua to **Godsdar/Uberlang**, preserving repository identity,
history, issues and settings. Update the active checkout's origin, README badge,
clone instructions and current repository/deployment guidance. The working folder
remains `work/lingua-repo/`; do not silently alter the older independent checkout.

GitHub Pages now uses `https://godsdar.github.io/Uberlang/`. The existing workflow
uses repository context and relative assets; publish and verify the new path.
Old GitHub repository URLs redirect, but do not assume old Pages paths redirect.
Vercel remains project `lingua` at `https://lingua-lac.vercel.app/`, deployed through
the existing CLI workflow. Package identifiers, API/IPC and storage keys do not change.

## Verification
Confirm the repository ID survives the rename, push to the new origin, check the
README's new URLs, and verify CI/Pages plus the unchanged Vercel demo.
