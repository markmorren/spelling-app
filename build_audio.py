#!/usr/bin/env python3
"""Generate a spoken audio clip per word using the built-in macOS `say` command.

`say` renders to a finished file, so there is none of the start/end clipping the
browser's live SpeechSynthesis suffers from. Clips are AAC .m4a in audio/<slug>.

Usage:
    python3 build_audio.py                 # every word in words.json
    python3 build_audio.py alphabet        # one activity by id
    python3 build_audio.py l7-cc-core ...  # specific set ids

Re-runnable: existing files are skipped, so new words only generate what's missing.
The slug() here MUST stay identical to audioSlug() in app.js.
"""
import json
import os
import re
import subprocess
import sys

VOICE = "Daniel"  # en_GB; change and delete audio/ to re-voice everything
RATE  = 150       # words per minute (say default is ~175-200); slower = clearer


def slug(word):
    return re.sub(r"[^a-z0-9]+", "-", word.lower()).strip("-")


def main():
    targets = set(sys.argv[1:])  # activity ids and/or set ids; empty = all
    data = json.load(open("words.json"))

    words = set()
    for act in data["activities"]:
        act_match = not targets or act["id"] in targets
        if act_match:
            for w in act.get("words", []):
                words.add(w["word"])
        for s in act.get("sets", []):
            if act_match or s["id"] in targets:
                for w in s["words"]:
                    words.add(w["word"])

    os.makedirs("audio", exist_ok=True)
    made = skipped = 0
    for w in sorted(words):
        path = f"audio/{slug(w)}.m4a"
        if os.path.exists(path):
            skipped += 1
            continue
        subprocess.run(
            ["say", "-v", VOICE, "-r", str(RATE), "-o", path,
             "--data-format=aac", w], check=True)
        made += 1

    print(f"voice={VOICE}  targeted={len(words)}  generated={made}  existed={skipped}")


if __name__ == "__main__":
    main()
