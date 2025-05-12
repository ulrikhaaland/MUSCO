#!/usr/bin/env python3
"""
merge_missing_fields.py

Copy every key-value pair that is present in the English JSON but
missing (or empty / null / []) in the Norwegian translation.

Only the file m_quads.json is processed; adjust FILENAMES or wrap the
merge_file() call in a loop if you want more.
"""

import json
import os
import shutil
import time
from typing import Any, Dict, List

# ── CONFIG ────────────────────────────────────────────────────────────
BASE = "/Users/ulrikhaland/Documents/musco-new/public/data/exercises/musco"
EN_DIR  = os.path.join(BASE, "json2")       # original English
NO_DIR  = os.path.join(BASE, "json2_no")    # Norwegian (has gaps)
FILENAMES = ["warmups.json"]                # process only this file
# ───────────────────────────────────────────────────────────────────────

def is_missing(value: Any) -> bool:
    """Return True if the value should be considered 'missing'."""
    return value in ("", None, [], {})

def merge_objects(src: Dict[str, Any], dst: Dict[str, Any]) -> None:
    """
    Recursively copy every key that is missing (or empty) in dst
    from src into dst.  dst is modified in place.
    """
    for key, val in src.items():
        if key not in dst or is_missing(dst[key]):
            # simple replacement if the field is absent / empty
            dst[key] = val
        else:
            # recurse through nested dicts / lists of dicts
            if isinstance(val, dict) and isinstance(dst[key], dict):
                merge_objects(val, dst[key])

            elif isinstance(val, list) and isinstance(dst[key], list):
                # special-case: list of exercises (dicts that have "id")
                if all(isinstance(x, dict) and "id" in x for x in val):
                    by_id = {x["id"]: x for x in dst[key]}
                    for entry in val:
                        obj_id = entry["id"]
                        if obj_id in by_id:
                            merge_objects(entry, by_id[obj_id])
                        else:
                            dst[key].append(entry)   # whole object missing
                # otherwise leave lists (strings, numbers, …) untouched

def merge_file(name: str) -> None:
    src_path = os.path.join(EN_DIR, name)
    dst_path = os.path.join(NO_DIR, name)

    if not (os.path.exists(src_path) and os.path.exists(dst_path)):
        print(f"❌  Skipping {name} – file not found in both folders")
        return

    # read both JSON files
    with open(src_path, "r", encoding="utf-8") as fh:
        src_json = json.load(fh)
    with open(dst_path, "r", encoding="utf-8") as fh:
        dst_json = json.load(fh)

    # merge in-place
    merge_objects(src_json, dst_json)

    # back-up Norwegian file before overwriting
    ts = time.strftime("%Y%m%d_%H%M%S")
    backup = f"{dst_path}.{ts}.bak"
    shutil.copy2(dst_path, backup)
    print(f"🗄️   Backup created → {backup}")

    # write merged result
    with open(dst_path, "w", encoding="utf-8") as fh:
        json.dump(dst_json, fh, ensure_ascii=False, indent=2)
    print(f"✅  {name} merged successfully")

if __name__ == "__main__":
    for fname in FILENAMES:
        merge_file(fname)
