# Shared Anatomy Source

`body_part_groups.json` and `viewer_shared.json` are canonical shared anatomy/viewer payloads used to generate platform-specific artifacts.

## Regenerate

Run:

```bash
node scripts/convert_body_parts.js
```

This will:

1. Generate Flutter configs:
   - `flutter_app/lib/config/body_part_groups.dart`
   - `flutter_app/lib/config/viewer_shared.dart`
   - `flutter_app/lib/utils/anatomy_helpers.dart`
2. Generate TypeScript artifacts:
   - `shared/anatomy/body_part_groups.ts`
   - `shared/anatomy/viewer_shared.ts`
   - `shared/anatomy/anatomy_helpers.ts`
